import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import PackagePurchase from '@/models/PackagePurchase';
import Referral from '@/models/referral.model';
import User from '@/models/User';
import SessionPaymentProof from '@/models/SessionPaymentProof';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET = process.env.SUPABASE_PAYMENT_PROOFS_BUCKET || 'payment-proofs';

function isAdmin(email?: string | null) {
  return !!email && ['abdullahgotaccess@gmail.com', 'admin@reachly.com'].includes(email.toLowerCase());
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const proofs = await SessionPaymentProof.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(100).lean();
    const results = await Promise.all(proofs.map(async (proof) => {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(proof.screenshotPath, 600);
      if (error) throw new Error(`Unable to access payment proof ${proof.bookingRef}: ${error.message}`);
      return { ...proof, _id: String(proof._id), screenshotUrl: data.signedUrl };
    }));
    return NextResponse.json({ success: true, proofs: results });
  } catch (error) {
    console.error('[Admin payment proofs] list failed:', error);
    return NextResponse.json({ error: 'Unable to load payment proofs.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { proofId, decision } = await request.json();
    if (!mongoose.isValidObjectId(proofId) || !['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid review request.' }, { status: 422 });
    }
    await connectDB();
    const proof = await SessionPaymentProof.findOne({ _id: proofId, status: 'pending' });
    if (!proof) return NextResponse.json({ error: 'Pending payment proof not found.' }, { status: 404 });

    const bookingStatus = decision === 'approved' ? 'confirmed' : 'cancelled';
    const paymentStatus = decision === 'approved' ? 'paid' : 'failed';
    const booking = await Booking.findOneAndUpdate(
      { _id: proof.bookingId, status: 'pending', paymentStatus: 'pending' },
      { $set: { status: bookingStatus, paymentStatus } },
      { new: true }
    );
    if (!booking) {
      return NextResponse.json({ error: 'Booking is no longer awaiting verification.' }, { status: 409 });
    }
    const updatedProof = await SessionPaymentProof.findOneAndUpdate(
      { _id: proof._id, status: 'pending' },
      { $set: { status: decision, reviewedAt: new Date(), reviewedBy: session.user.email } },
      { new: true }
    );
    if (!updatedProof) {
      await Booking.updateOne(
        { _id: booking._id, status: bookingStatus, paymentStatus },
        { $set: { status: 'pending', paymentStatus: 'pending' } }
      );
      return NextResponse.json({ error: 'Payment proof was reviewed by another administrator.' }, { status: 409 });
    }

    if (decision === 'rejected' && booking.packagePurchaseId) {
      if (booking.sessionNumber === 1) {
        await PackagePurchase.deleteOne({ _id: booking.packagePurchaseId });
      } else {
        await PackagePurchase.updateOne(
          { _id: booking.packagePurchaseId },
          { $inc: { sessionsBooked: -1 } }
        );
      }
    }
    if (decision === 'approved') {
      const buyer = booking.userId
        ? await User.findById(booking.userId)
        : await User.findOne({ email: proof.payerEmail });
      if (buyer?.isReferred && buyer.whoReferred) {
        const [referral, referrer] = await Promise.all([
          Referral.findOne({ referrer: buyer.whoReferred, joinnee: buyer._id }),
          User.findById(buyer.whoReferred),
        ]);
        if (referral?.totalBuyActivities === 1 && referrer) {
          const paidAmount = proof.amount;
          const reward = Number((paidAmount * 0.05).toFixed(2));
          referrer.totalAmountEarnedFromReferrals =
            (Number(referrer.totalAmountEarnedFromReferrals) || 0) + reward;
          await Promise.all([
            referrer.save(),
            Referral.updateOne(
              { _id: referral._id },
              {
                $inc: { totalBuyActivities: 1 },
                $push: {
                  buyActivities: {
                    type: 'buy_session',
                    activityTime: new Date(),
                    totalAmount: reward,
                    status: 'completed',
                    sessionId: proof.sessionTypeId,
                  },
                },
              }
            ),
          ]);
        }
      }
    }
    return NextResponse.json({ success: true, status: decision });
  } catch (error) {
    console.error('[Admin payment proofs] review failed:', error);
    return NextResponse.json({ error: 'Unable to review payment proof.' }, { status: 500 });
  }
}
