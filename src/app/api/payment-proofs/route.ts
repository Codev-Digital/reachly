import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import CreatorProfile from '@/models/CreatorProfile';
import PackagePurchase from '@/models/PackagePurchase';
import SessionType from '@/models/SessionType';
import SessionPaymentProof from '@/models/SessionPaymentProof';
import User from '@/models/User';
import { supabaseAdmin } from '@/lib/supabase';

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const BUCKET = process.env.SUPABASE_PAYMENT_PROOFS_BUCKET || 'payment-proofs';

export async function POST(request: NextRequest) {
  let uploadedPath: string | null = null;
  try {
    const formData = await request.formData();
    const bookingId = String(formData.get('bookingId') || '');
    const bookingRef = String(formData.get('bookingRef') || '');
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const file = formData.get('screenshot');

    if (!mongoose.isValidObjectId(bookingId) || !bookingRef || !email) {
      return NextResponse.json({ error: 'Booking details are missing.' }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0 || !ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Choose a JPEG, PNG, or WebP payment screenshot.' }, { status: 422 });
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      return NextResponse.json({ error: 'Screenshot must be 5 MB or smaller.' }, { status: 413 });
    }

    await connectDB();
    const booking = await Booking.findOne({ _id: bookingId, bookingRef });
    if (!booking || !['easypaisa', 'jazzcash'].includes(booking.paymentMethod || '')) {
      return NextResponse.json({ error: 'Manual payment booking not found.' }, { status: 404 });
    }
    if (booking.paymentStatus !== 'pending' || booking.status !== 'pending') {
      return NextResponse.json({ error: 'This booking is no longer awaiting payment proof.' }, { status: 409 });
    }
    if (booking.guestDetails?.email?.toLowerCase() !== email) {
      return NextResponse.json({ error: 'Booking email does not match.' }, { status: 403 });
    }
    const session = await getServerSession(authOptions);
    if (session?.user?.email && session.user.email.toLowerCase() !== email) {
      return NextResponse.json({ error: 'Signed-in account does not match the booking.' }, { status: 403 });
    }
    if (booking.userId && !session?.user?.email) {
      return NextResponse.json({ error: 'Sign in to submit proof for this booking.' }, { status: 401 });
    }
    if (booking.userId && session?.user?.email) {
      const user = await User.findOne({ email }).select('_id').lean();
      if (!user || String(user._id) !== String(booking.userId)) {
        return NextResponse.json({ error: 'You cannot submit proof for this booking.' }, { status: 403 });
      }
    }

    const [creator, sessionType] = await Promise.all([
      CreatorProfile.findOne({ userId: booking.creatorId }).select('displayName username').lean(),
      SessionType.findById(booking.sessionTypeId).select('title').lean(),
    ]);
    if (!creator || !sessionType) {
      return NextResponse.json({ error: 'Booking details are incomplete.' }, { status: 409 });
    }

    let amount = booking.finalPrice;
    if (booking.packagePurchaseId) {
      amount = 0;
      if (booking.sessionNumber === 1) {
        const purchase = await PackagePurchase.findById(booking.packagePurchaseId).select('price').lean();
        if (!purchase) return NextResponse.json({ error: 'Package purchase was not found.' }, { status: 409 });
        amount = purchase.price;
      }
    }

    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    uploadedPath = `${booking.bookingRef}/${new mongoose.Types.ObjectId().toString()}.${extension}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(uploadedPath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      });
    if (uploadError) throw new Error(`Payment screenshot upload failed: ${uploadError.message}`);

    const previousProof = await SessionPaymentProof.findOne({ bookingId: booking._id }).select('screenshotPath');
    await SessionPaymentProof.findOneAndUpdate(
      { bookingId: booking._id },
      {
        $set: {
          bookingRef: booking.bookingRef,
          userId: booking.userId,
          payerName: booking.guestDetails?.fullName || 'Customer',
          payerEmail: email,
          creatorId: booking.creatorId,
          creatorName: creator.displayName,
          creatorUsername: creator.username,
          sessionTypeId: booking.sessionTypeId,
          sessionTitle: sessionType.title,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          paymentMethod: booking.paymentMethod,
          amount,
          currency: 'PKR',
          screenshotPath: uploadedPath,
          status: 'pending',
          reviewedAt: null,
          reviewedBy: null,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    if (previousProof?.screenshotPath) {
      await supabaseAdmin.storage.from(BUCKET).remove([previousProof.screenshotPath]);
    }

    return NextResponse.json({ success: true, status: 'pending' });
  } catch (error) {
    if (uploadedPath) {
      const { error: cleanupError } = await supabaseAdmin.storage.from(BUCKET).remove([uploadedPath]);
      if (cleanupError) console.error('[Payment proof] failed to remove orphaned screenshot:', cleanupError);
    }
    console.error('[Payment proof] submission failed:', error);
    return NextResponse.json({ error: 'Unable to save payment proof. Please try again.' }, { status: 500 });
  }
}
