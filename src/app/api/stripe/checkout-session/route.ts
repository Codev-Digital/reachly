import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { finalizeStripeCheckout } from '@/lib/stripeCheckout';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) return NextResponse.json({ error: 'Missing checkout session.' }, { status: 400 });

  try {
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
    const result = await finalizeStripeCheckout(session);
    return NextResponse.json({
      paid: result.paid,
      ...(result.paid ? {
        amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase(),
      } : {}),
    });
  } catch (error) {
    console.error('[GET /api/stripe/checkout-session]', error);
    return NextResponse.json({ error: 'Unable to verify this payment.' }, { status: 500 });
  }
}
