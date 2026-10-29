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
import { generateCreatorNewBookingEmail, generateUserBookingApprovedEmail } from '@/lib/utils';
import { queueEmail } from '@/lib/emailQueue';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';

const BUCKET = process.env.SUPABASE_PAYMENT_PROOFS_BUCKET || process.env.SUPABASE_STORAGE_BUCKET || 'reachly';

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
      let screenshotUrl = '';
      if (proof.screenshotPath?.startsWith('data:') || proof.screenshotPath?.startsWith('http')) {
        screenshotUrl = proof.screenshotPath;
      } else {
        try {
          const { data, error } = await supabaseAdmin.storage
            .from(BUCKET)
            .createSignedUrl(proof.screenshotPath, 3600);
          if (!error && data?.signedUrl) {
            screenshotUrl = data.signedUrl;
          } else {
            const { data: pubData } = supabaseAdmin.storage
              .from(BUCKET)
              .getPublicUrl(proof.screenshotPath);
            screenshotUrl = pubData.publicUrl;
          }
        } catch {
          const { data: pubData } = supabaseAdmin.storage
            .from(BUCKET)
            .getPublicUrl(proof.screenshotPath);
          screenshotUrl = pubData.publicUrl;
        }
      }
      return { ...proof, _id: String(proof._id), screenshotUrl };
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
    const { proofId, bookingId, bookingRef, decision, remarks } = await request.json();
    if (!['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid review request.' }, { status: 422 });
    }
    await connectDB();

    let proof: any = null;
    if (proofId && mongoose.isValidObjectId(proofId)) {
      proof = await SessionPaymentProof.findById(proofId);
    }
    if (!proof && bookingId && mongoose.isValidObjectId(bookingId)) {
      proof = await SessionPaymentProof.findOne({
        $or: [
          { bookingId },
          { bookingId: new mongoose.Types.ObjectId(bookingId) }
        ]
      });
    }
    if (!proof && bookingRef) {
      proof = await SessionPaymentProof.findOne({ bookingRef });
    }

    const bookingStatus = decision === 'approved' ? 'confirmed' : 'cancelled';
    const paymentStatus = decision === 'approved' ? 'paid' : 'failed';
    const cleanedRemarks = typeof remarks === 'string' ? remarks.trim() : (remarks ? String(remarks).trim() : '');

    const bookingUpdate: Record<string, any> = { status: bookingStatus, paymentStatus };
    if (decision === 'rejected') {
      bookingUpdate.adminRemarks = cleanedRemarks;
    }

    const bookingQuery: any[] = [];
    if (proof?.bookingId) bookingQuery.push({ _id: proof.bookingId });
    if (proof?.bookingRef) bookingQuery.push({ bookingRef: proof.bookingRef });
    if (bookingRef) bookingQuery.push({ bookingRef });
    if (bookingId) {
      if (mongoose.isValidObjectId(bookingId)) {
        bookingQuery.push({ _id: bookingId });
      } else {
        bookingQuery.push({ bookingRef: bookingId });
      }
    }
    if (proofId) {
      if (mongoose.isValidObjectId(proofId)) {
        bookingQuery.push({ _id: proofId });
      } else {
        bookingQuery.push({ bookingRef: proofId });
      }
    }

    if (bookingQuery.length === 0) {
      return NextResponse.json({ error: 'No booking or payment proof identifier provided.' }, { status: 422 });
    }

    const booking = await Booking.findOneAndUpdate(
      { $or: bookingQuery },
      { $set: bookingUpdate },
      { new: true }
    );
    if (!booking) {
      return NextResponse.json({ error: 'Booking associated with payment proof not found.' }, { status: 404 });
    }
    const shouldSendBookingEmails = decision === 'approved' && proof?.status !== 'approved';

    const proofUpdate: Record<string, any> = {
      status: decision,
      reviewedAt: new Date(),
      reviewedBy: session.user.email,
    };
    if (decision === 'rejected') {
      proofUpdate.adminRemarks = cleanedRemarks;
    }

    if (!proof) {
      proof = await SessionPaymentProof.findOne({
        $or: [
          { bookingId: booking._id },
          { bookingRef: booking.bookingRef },
        ]
      });
    }

    if (proof) {
      await SessionPaymentProof.updateOne(
        { _id: proof._id },
        { $set: proofUpdate }
      );
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

      if (shouldSendBookingEmails) {
        const [buyerDetails, creatorUser, creatorProfile, sessionType] = await Promise.all([
          booking.userId
            ? User.findById(booking.userId).select('name email profilePhoto').lean()
            : User.findOne({ email: proof?.payerEmail }).select('name email profilePhoto').lean(),
          User.findById(booking.creatorId).select('name email profilePhoto').lean(),
          CreatorProfile.findOne({ userId: booking.creatorId }).select('displayName profilePhoto').lean(),
          SessionType.findById(booking.sessionTypeId).select('title').lean(),
        ]);
        const date = new Date(booking.scheduledDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const sessionImage = creatorProfile?.profilePhoto || `${process.env.NEXTAUTH_URL || ''}/assets/booking-confirm-sm.webp`;
        const details = {
          sessionTitle: sessionType?.title || 'Your booked session',
          sessionImage,
          creatorName: creatorProfile?.displayName || creatorUser?.name || 'Creator',
          creatorAvatar: creatorProfile?.profilePhoto || creatorUser?.profilePhoto || `${process.env.NEXTAUTH_URL || ''}/avatar.png`,
          buyerName: buyerDetails?.name || booking.guestDetails?.fullName || proof?.payerName || 'Client',
          buyerAvatar: buyerDetails?.profilePhoto || `${process.env.NEXTAUTH_URL || ''}/avatar.png`,
          date,
          time: booking.scheduledTime,
          totalPrice: proof?.amount ?? booking.finalPrice,
        };
        if (buyerDetails?.email) {
          queueEmail({
            to: buyerDetails.email,
            subject: 'Your slot is confirmed!',
            html: generateUserBookingApprovedEmail(details),
            description: 'Manual payment booking confirmation for user',
          });
        }
        if (creatorUser?.email) {
          queueEmail({
            to: creatorUser.email,
            subject: `You have a new booking on ${date}`,
            html: generateCreatorNewBookingEmail(details),
            description: 'Manual payment booking notification for creator',
          });
        }
      }
    }
    return NextResponse.json({ success: true, status: decision });
  } catch (error) {
    console.error('[Admin payment proofs] review failed:', error);
    return NextResponse.json({ error: 'Unable to review payment proof.' }, { status: 500 });
  }
}
