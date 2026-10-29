import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import EventPurchase from '@/models/EventPurchase';
import EventPaymentProof from '@/models/EventPaymentProof';
import User from '@/models/User';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET = process.env.SUPABASE_PAYMENT_PROOFS_BUCKET || process.env.SUPABASE_STORAGE_BUCKET || 'reachly';
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  await connectDB();
  return User.findOne({ email: session.user.email.toLowerCase() }).select('_id name email').lean();
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    const { id } = await params;
    const purchaseId = new URL(request.url).searchParams.get('purchaseId');
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(purchaseId || '')) {
      return NextResponse.json({ error: 'Purchase not found.' }, { status: 404 });
    }
    const purchase = await EventPurchase.findOne({ _id: purchaseId, eventId: id, userId: user._id }).lean();
    if (!purchase) return NextResponse.json({ error: 'Purchase not found.' }, { status: 404 });
    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error('[event payment proof GET]', error);
    return NextResponse.json({ error: 'Unable to load event purchase.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let uploadedPath = '';
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Event purchase not found.' }, { status: 404 });

    const formData = await request.formData();
    const purchaseId = String(formData.get('purchaseId') || '');
    const paymentMethod = String(formData.get('paymentMethod') || '');
    const file = formData.get('screenshot');
    if (!mongoose.isValidObjectId(purchaseId) || !['easypaisa', 'jazzcash'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Choose a valid payment method.' }, { status: 422 });
    }
    if (!(file instanceof File) || !TYPES.has(file.type) || file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Choose a JPEG, PNG, or WebP screenshot up to 5 MB.' }, { status: 422 });
    }

    const purchase = await EventPurchase.findOne({ _id: purchaseId, eventId: id, userId: user._id });
    if (!purchase || purchase.paymentStatus !== 'pending' || purchase.status !== 'pending') {
      return NextResponse.json({ error: 'This event purchase is no longer awaiting payment.' }, { status: 409 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1] || 'png';
    const path = `event-payment-proofs/${purchase.ticketRef}/${new mongoose.Types.ObjectId()}.${extension}`;
    const upload = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, { contentType: file.type, upsert: true });
    uploadedPath = upload.error ? `data:${file.type};base64,${buffer.toString('base64')}` : path;

    await EventPaymentProof.findOneAndUpdate(
      { purchaseId: purchase._id },
      {
        $set: {
          eventId: purchase.eventId,
          userId: purchase.userId,
          buyerName: user.name,
          buyerEmail: user.email,
          eventTitle: purchase.eventTitle,
          eventBannerUrl: purchase.eventBannerUrl || '',
          eventDate: purchase.eventDate,
          eventStartTime: purchase.eventStartTime || '',
          tierTitle: purchase.tierTitle,
          quantity: purchase.quantity,
          amount: purchase.tierPrice * purchase.quantity,
          paymentMethod,
          screenshotPath: uploadedPath,
          status: 'pending',
          reviewedAt: null,
          reviewedBy: null,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[event payment proof]', error);
    return NextResponse.json({ error: 'Unable to submit payment proof.' }, { status: 500 });
  }
}
