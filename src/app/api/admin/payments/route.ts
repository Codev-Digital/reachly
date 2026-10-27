import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import SessionPaymentProof from '@/models/SessionPaymentProof';
import { supabaseAdmin } from '@/lib/supabase';
import { autoSettleEarnings } from '@/lib/autoSettleEarnings';
import mongoose from 'mongoose';
import PackagePurchase from '@/models/PackagePurchase';

function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

// GET all payments, or a single payment with ?id=<bookingId>
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const id = new URL(req.url).searchParams.get('id');
    if (id && !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Auto-settle all creators: mark past-due pending earnings as paid
    await autoSettleEarnings();

    // Fetch all bookings sorted by newest first (or just the requested one)
    const bookings = await Booking.find(id ? { _id: id } : {}).sort({ createdAt: -1 }).lean();

    // Fetch all users and creators for fast lookup
    const users = await User.find({}).lean();
    const creatorProfiles = await CreatorProfile.find({}).lean();

    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
    const creatorMap = new Map(creatorProfiles.map((cp: any) => [cp.userId.toString(), cp]));

    // A package is ONE payment of the whole price, made with its first session
    const purchaseIds = [...new Set(bookings.map((b: any) => b.packagePurchaseId?.toString()).filter(Boolean))];
    const purchases = purchaseIds.length
      ? ((await PackagePurchase.find({ _id: { $in: purchaseIds } }).select('price paymentStatus').lean()) as any[])
      : [];
    const purchaseMap = new Map(purchases.map((p) => [String(p._id), p]));
    const payableBookings = bookings.filter((b: any) => !b.packagePurchaseId || b.sessionNumber === 1);

    const enrichedPayments = payableBookings.map((booking: any) => {
      const user = userMap.get(booking.userId?.toString());
      const creatorProfile = creatorMap.get(booking.creatorId?.toString());
      const creatorUser = userMap.get(booking.creatorId?.toString()); // in case we need their basic user details

      const d = new Date(booking.createdAt);
      const formattedDate = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const time = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // Status mapping based on paymentStatus (source of truth for earnings)
      let displayStatus = 'Pending';
      if (booking.paymentStatus === 'paid') {
        displayStatus = 'Completed';
      } else if (booking.paymentStatus === 'refunded' || booking.status === 'refunded') {
        displayStatus = 'Refunded';
      } else if (booking.paymentStatus === 'failed' || booking.status === 'cancelled') {
        displayStatus = 'Rejected';
      }

      const purchase = booking.packagePurchaseId ? purchaseMap.get(booking.packagePurchaseId.toString()) : null;
      if (purchase) {
        if (purchase.paymentStatus === 'paid') displayStatus = 'Completed';
        else if (purchase.paymentStatus === 'refunded') displayStatus = 'Refunded';
        else if (purchase.paymentStatus === 'failed') displayStatus = 'Rejected';
        else displayStatus = 'Pending';
      }

      // Parse amount (assume finalPrice is string like "25,000" or number)
      let numericAmount = 0;
      if (typeof booking.finalPrice === 'string') {
        numericAmount = parseFloat(booking.finalPrice.replace(/[^0-9.]/g, '')) || 0;
      } else if (typeof booking.finalPrice === 'number') {
        numericAmount = booking.finalPrice;
      }
      if (purchase) numericAmount = purchase.price; // the whole package, not one session's share

      // Calculate platform fee (e.g. 20%) and creator earnings (80%)
      const platformFeeNum = numericAmount * 0.20;
      const creatorEarningsNum = numericAmount * 0.80;

      return {
        id: `TXN-${booking._id.toString().slice(-5).toUpperCase()}`,
        dbId: booking._id.toString(),
        user: {
          name: user?.name || booking.guestDetails?.name || 'Guest User',
          username: user?.name ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : '@guest',
          avatar: user?.profilePhoto || '/avatar.png'
        },
        creator: {
          name: creatorProfile?.displayName || creatorUser?.name || 'Unknown Creator',
          username: creatorProfile?.username || '@unknown',
          avatar: creatorProfile?.profilePhoto || creatorUser?.profilePhoto || '/avatar.png'
        },
        paymentMethod: booking.paymentMethod || 'Card',
        date: formattedDate,
        time: time,
        amount: `${numericAmount.toLocaleString()} PKR`,
        rawAmount: numericAmount,
        platformFee: `${platformFeeNum.toLocaleString()} PKR`,
        creatorEarnings: `${creatorEarningsNum.toLocaleString()} PKR`,
        status: displayStatus
      };
    });

    if (id) {
      let booking: any = null;
      if (mongoose.isValidObjectId(id)) {
        booking = await Booking.findById(id).populate('sessionTypeId').lean();
      } else if (id.startsWith('TXN-')) {
        const allBookings = await Booking.find({}).sort({ createdAt: -1 }).populate('sessionTypeId').lean();
        booking = allBookings.find((b: any) => b._id.toString().slice(-5).toUpperCase() === id.slice(-5).toUpperCase() || b.bookingRef === id);
      } else {
        booking = await Booking.findOne({ bookingRef: id }).populate('sessionTypeId').lean();
      }

      if (!booking) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      const BUCKET = process.env.SUPABASE_PAYMENT_PROOFS_BUCKET || process.env.SUPABASE_STORAGE_BUCKET || 'reachly';

      const [creatorProfile, creatorUser, clientUser, proof] = await Promise.all([
        CreatorProfile.findOne({ userId: booking.creatorId }).lean() as any,
        User.findById(booking.creatorId).lean() as any,
        booking.userId ? (User.findById(booking.userId).lean() as any) : null,
        SessionPaymentProof.findOne({
          $or: [
            { bookingId: booking._id },
            { bookingRef: booking.bookingRef },
          ]
        }).lean() as any,
      ]);

      let screenshotUrl = '';
      if (proof) {
        if (proof.screenshotPath?.startsWith('data:') || proof.screenshotPath?.startsWith('http')) {
          screenshotUrl = proof.screenshotPath;
        } else if (proof.screenshotPath) {
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
      }

      const d = new Date(booking.createdAt);
      const formattedDate = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const time = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const scheduledD = booking.scheduledDate ? new Date(booking.scheduledDate) : null;
      const formattedScheduledDate = scheduledD ? scheduledD.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : 'Not scheduled';

      let displayStatus = 'Pending';
      if (booking.paymentStatus === 'paid') {
        displayStatus = 'Completed';
      } else if (booking.paymentStatus === 'refunded' || booking.status === 'refunded') {
        displayStatus = 'Refunded';
      } else if (booking.paymentStatus === 'failed' || booking.status === 'cancelled' || proof?.status === 'rejected') {
        displayStatus = 'Rejected';
      }

      let numericAmount = 0;
      if (typeof booking.finalPrice === 'string') {
        numericAmount = parseFloat(booking.finalPrice.replace(/[^0-9.]/g, '')) || 0;
      } else if (typeof booking.finalPrice === 'number') {
        numericAmount = booking.finalPrice;
      }

      const platformFeeNum = numericAmount * 0.20;
      const creatorEarningsNum = numericAmount * 0.80;

      const paymentDetail = {
        id: `TXN-${booking._id.toString().slice(-5).toUpperCase()}`,
        dbId: booking._id.toString(),
        bookingRef: booking.bookingRef,
        bookingStatus: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod || proof?.paymentMethod || 'manual',
        adminRemarks: booking.adminRemarks || proof?.adminRemarks || '',
        date: formattedDate,
        time: time,
        amount: `${numericAmount.toLocaleString()} PKR`,
        rawAmount: numericAmount,
        platformFee: `${platformFeeNum.toLocaleString()} PKR`,
        creatorEarnings: `${creatorEarningsNum.toLocaleString()} PKR`,
        status: displayStatus,
        session: {
          title: booking.sessionTypeId?.title || '1-on-1 Consultation',
          duration: `${booking.sessionTypeId?.duration || 0} minutes`,
          durationMins: booking.sessionTypeId?.duration || 0,
          description: booking.sessionTypeId?.description || '',
          features: booking.sessionTypeId?.features || [],
          scheduledDate: formattedScheduledDate,
          scheduledTime: booking.scheduledTime || '',
          meetingUrl: booking.meetingUrl || null,
          meetingStartedAt: booking.meetingStartedAt || null,
          meetingEndedAt: booking.meetingEndedAt || null,
        },
        creator: {
          id: booking.creatorId?.toString(),
          name: creatorProfile?.displayName || creatorUser?.name || 'Creator',
          username: creatorProfile?.username ? `@${creatorProfile.username}` : (creatorUser?.name ? `@${creatorUser.name.toLowerCase().replace(/\s+/g, '')}` : '@creator'),
          avatar: creatorProfile?.profilePhoto || creatorUser?.profilePhoto || '/avatar.png',
          email: creatorUser?.email || '',
          phone: creatorUser?.phone || creatorProfile?.whatsapp || '',
          category: creatorProfile?.category || 'General',
          bio: creatorProfile?.bio || '',
          city: creatorProfile?.city || '',
          country: creatorProfile?.country || '',
          earningsShare: `${creatorEarningsNum.toLocaleString()} PKR`,
        },
        client: {
          id: clientUser?._id?.toString() || null,
          name: clientUser?.name || booking.guestDetails?.fullName || 'Guest User',
          username: clientUser?.name ? `@${clientUser.name.toLowerCase().replace(/\s+/g, '')}` : '@guest',
          avatar: clientUser?.profilePhoto || '/avatar.png',
          email: clientUser?.email || booking.guestDetails?.email || proof?.payerEmail || 'Not provided',
          phone: clientUser?.phone || booking.guestDetails?.whatsapp || 'Not provided',
          isGuest: !booking.userId,
          whatToDiscuss: booking.guestDetails?.whatToDiscuss || booking.guestDetails?.notes || '',
          heardFrom: booking.guestDetails?.heardFrom || '',
          answers: booking.answers || [],
        },
        proof: proof ? {
          id: proof._id.toString(),
          status: proof.status,
          screenshotUrl: screenshotUrl || '',
          payerName: proof.payerName || '',
          payerEmail: proof.payerEmail || '',
          amount: proof.amount || numericAmount,
          paymentMethod: proof.paymentMethod || booking.paymentMethod,
          reviewedAt: proof.reviewedAt ? new Date(proof.reviewedAt).toLocaleString() : null,
          reviewedBy: proof.reviewedBy || null,
          submittedAt: proof.createdAt ? new Date(proof.createdAt).toLocaleString() : null,
          adminRemarks: booking.adminRemarks || proof.adminRemarks || '',
        } : null,
      };

      return NextResponse.json({ success: true, payment: paymentDetail });
    }

    return NextResponse.json({ success: true, payments: enrichedPayments });
  } catch (error: any) {
    console.error('Admin payments GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
