import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import EventPurchase from '@/models/EventPurchase';
import { checkSessionModificationWindow } from '@/lib/time';
import { removeBuyerFromEventBroadcast } from '@/lib/eventBroadcastChat';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PUT — refund / cancel an event ticket owned by the signed-in user.
 * Body: `{ action: 'refund' }`
 * Enforces the same 24-hour window as session cancellations.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const email = session.user.email?.toLowerCase().trim();
    let user = null;
    if (email) user = await User.findOne({ email });
    if (!user && (session.user as any).id) {
      user = await User.findById((session.user as any).id).exec();
    }
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    if (body?.action !== 'refund') {
      return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
    }

    let purchase = null;
    if (mongoose.isValidObjectId(id)) {
      purchase = await EventPurchase.findById(id).exec();
    }
    if (!purchase) {
      purchase = await EventPurchase.findOne({ ticketRef: id }).exec();
    }
    if (!purchase) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
    }

    const ownsTicket =
      purchase.userId?.toString() === user._id.toString() ||
      purchase.buyerEmail?.toLowerCase().trim() === email;
    if (!ownsTicket) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (purchase.status === 'cancelled' || purchase.paymentStatus === 'refunded') {
      return NextResponse.json({ error: 'This ticket has already been refunded.' }, { status: 400 });
    }
    if (purchase.status === 'completed') {
      return NextResponse.json({ error: 'Completed event tickets cannot be refunded.' }, { status: 400 });
    }

    const windowCheck = checkSessionModificationWindow(
      purchase.eventDate,
      purchase.eventStartTime || '12:00 AM',
      'Asia/Karachi',
      'refund'
    );
    if (!windowCheck.allowed) {
      return NextResponse.json(
        {
          error: windowCheck.errorMessage,
          remainingMs: windowCheck.diffMs,
          sessionStartUTC: windowCheck.sessionStartUTC?.toISOString() || null,
        },
        { status: 400 }
      );
    }

    purchase.status = 'cancelled';
    purchase.paymentStatus = 'refunded';
    await purchase.save();

    try {
      await removeBuyerFromEventBroadcast(purchase.eventId, purchase.userId);
    } catch (chatErr) {
      console.error('[PUT /api/user/event-purchases/:id] remove from broadcast:', chatErr);
    }

    return NextResponse.json({
      success: true,
      purchase: {
        id: String(purchase._id),
        status: purchase.status,
        paymentStatus: purchase.paymentStatus,
        ticketRef: purchase.ticketRef,
      },
    });
  } catch (err) {
    console.error('[PUT /api/user/event-purchases/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
