import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import CreatorPayout from '@/models/CreatorPayout';
import CreatorProfile from '@/models/CreatorProfile';
import EventPurchase from '@/models/EventPurchase';
import EventPaymentProof from '@/models/EventPaymentProof';
import PackagePurchase from '@/models/PackagePurchase';
import SessionPaymentProof from '@/models/SessionPaymentProof';
import User from '@/models/User';
import { packageInfo } from '@/lib/packageLabels';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = { params: Promise<{ id: string }> };
const PAYMENT_PROOF_BUCKET = process.env.SUPABASE_PAYMENT_PROOFS_BUCKET || process.env.SUPABASE_STORAGE_BUCKET || 'reachly';

function isAdmin(email?: string | null) {
  if (!email) return false;
  return ['abdullahgotaccess@gmail.com', 'admin@reachly.com'].includes(email.toLowerCase());
}

async function authorizeAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.email && isAdmin(session.user.email);
}

async function getScreenshotUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  const { data, error } = await supabaseAdmin.storage
    .from(PAYMENT_PROOF_BUCKET)
    .createSignedUrl(path, 3600);
  if (!error && data?.signedUrl) return data.signedUrl;
  return supabaseAdmin.storage.from(PAYMENT_PROOF_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await authorizeAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }
    await connectDB();

    const creatorProfile = await CreatorProfile.findOne({ userId: id })
      .select('displayName username profilePhoto commissionPercent updated_totall_earning updated_life_time_earning')
      .lean();
    if (!creatorProfile) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const [creatorUser, bookings, eventPurchases, outgoingBookings, payoutRecord] = await Promise.all([
      User.findById(id).select('name profilePhoto').lean(),
      Booking.find({ creatorId: id }).sort({ createdAt: -1 }).lean(),
      EventPurchase.find({ creatorId: id }).sort({ createdAt: -1 }).lean(),
      Booking.find({ userId: id, creatorId: { $ne: id } })
        .select('_id finalPrice packagePurchaseId sessionNumber status paymentStatus')
        .lean(),
      CreatorPayout.findOne({ creatorProfileId: creatorProfile._id }).select('payouts').lean(),
    ]);
    const [sessionProofs, eventProofs] = await Promise.all([
      SessionPaymentProof.find({ bookingId: { $in: bookings.map((booking) => booking._id) } }).lean(),
      EventPaymentProof.find({ purchaseId: { $in: eventPurchases.map((purchase) => purchase._id) } }).lean(),
    ]);
    const sessionProofMap = new Map(sessionProofs.map((proof) => [String(proof.bookingId), proof]));
    const eventProofMap = new Map(eventProofs.map((proof) => [String(proof.purchaseId), proof]));

    const packageIds = [...new Set(bookings
      .map((booking) => booking.packagePurchaseId?.toString())
      .filter((value): value is string => Boolean(value)))];
    const packages = packageIds.length
      ? await PackagePurchase.find({ _id: { $in: packageIds } }).select('price paymentStatus').lean()
      : [];
    const packageMap = new Map(packages.map((purchase) => [String(purchase._id), purchase]));
    const payableBookings = bookings.filter(
      (booking) => !booking.packagePurchaseId || booking.sessionNumber === 1,
    );
    const buyerIds = [...new Set([
      ...payableBookings.map((booking) => booking.userId?.toString()),
      ...eventPurchases.map((purchase) => purchase.userId?.toString()),
    ].filter((value): value is string => Boolean(value)))];
    const buyers = buyerIds.length
      ? await User.find({ _id: { $in: buyerIds } }).select('name email profilePhoto').lean()
      : [];
    const buyerMap = new Map(buyers.map((buyer) => [String(buyer._id), buyer]));
    const commissionPercent = creatorProfile.commissionPercent ?? 20;

    const sessionPayments = await Promise.all(payableBookings.map(async (booking) => {
      const packagePurchase = booking.packagePurchaseId
        ? packageMap.get(String(booking.packagePurchaseId))
        : undefined;
      const totalAmount = Number(packagePurchase?.price ?? booking.finalPrice ?? 0);
      const platformAmount = totalAmount * commissionPercent / 100;
      const buyer = booking.userId ? buyerMap.get(String(booking.userId)) : undefined;
      const paymentStatus = packagePurchase?.paymentStatus ?? booking.paymentStatus;
      const proof = sessionProofMap.get(String(booking._id));
      return {
        id: String(booking._id),
        type: 'session' as const,
        reference: booking.bookingRef,
        description: packagePurchase ? `Package · session ${booking.sessionNumber}` : 'Session booking',
        buyer: buyer?.name || booking.guestDetails?.fullName || buyer?.email || 'Guest',
        date: booking.createdAt,
        status: paymentStatus || booking.status,
        originalTotalAmount: totalAmount,
        originalPlatformAmount: platformAmount,
        totalAmount: booking.updated_total_amount ?? totalAmount,
        platformAmount: booking.updated_platform_amount ?? platformAmount,
        proof: proof ? {
          screenshotUrl: await getScreenshotUrl(proof.screenshotPath),
          sessionTitle: proof.sessionTitle,
          creatorName: proof.creatorName,
          creatorUsername: proof.creatorUsername,
          creatorAvatar: creatorProfile.profilePhoto || creatorUser?.profilePhoto || '/avatar.png',
          buyerName: proof.payerName,
          buyerEmail: proof.payerEmail,
          buyerAvatar: buyer?.profilePhoto || '/avatar.png',
        } : null,
      };
    }));

    const eventPayments = await Promise.all(eventPurchases.map(async (purchase) => {
      const totalAmount = Number(purchase.tierPrice || 0) * Number(purchase.quantity || 1);
      const buyer = buyerMap.get(String(purchase.userId));
      const proof = eventProofMap.get(String(purchase._id));
      return {
        id: String(purchase._id),
        type: 'event' as const,
        reference: purchase.ticketRef,
        description: `${purchase.eventTitle} · ${purchase.tierTitle}`,
        buyer: buyer?.name || purchase.buyerEmail || 'Event buyer',
        date: purchase.createdAt,
        status: purchase.paymentStatus || purchase.status,
        originalTotalAmount: totalAmount,
        originalPlatformAmount: 0,
        totalAmount: purchase.updated_total_amount ?? totalAmount,
        platformAmount: purchase.updated_platform_amount ?? 0,
        proof: proof ? {
          screenshotUrl: await getScreenshotUrl(proof.screenshotPath),
          sessionTitle: proof.eventTitle,
          creatorName: creatorProfile.displayName || creatorUser?.name || 'Creator',
          creatorUsername: creatorProfile.username || '@creator',
          creatorAvatar: creatorProfile.profilePhoto || creatorUser?.profilePhoto || '/avatar.png',
          buyerName: proof.buyerName,
          buyerEmail: proof.buyerEmail,
          buyerAvatar: buyer?.profilePhoto || '/avatar.png',
        } : null,
      };
    }));

    const adjustedPackageIds = new Set(
      bookings
        .filter((booking) =>
          booking.packagePurchaseId &&
          booking.sessionNumber === 1 &&
          booking.updated_total_amount !== undefined,
        )
        .map((booking) => booking.packagePurchaseId!.toString()),
    );
    const lifetimeEarning = bookings.reduce((sum, booking) => {
      if (booking.paymentStatus !== 'paid') return sum;
      const isAdjustedPackage = booking.packagePurchaseId &&
        adjustedPackageIds.has(booking.packagePurchaseId.toString());
      if (isAdjustedPackage && booking.sessionNumber !== 1) return sum;
      const amount = booking.updated_total_amount !== undefined
        ? Math.max(0, booking.updated_total_amount - (booking.updated_platform_amount ?? 0))
        : Number(booking.finalPrice || 0);
      return sum + amount;
    }, 0);
    const payableOutgoingBookings = outgoingBookings.filter(
      (booking) => !(booking.packagePurchaseId && booking.sessionNumber !== 1),
    );
    const { paid: outgoingPackagePayments } = await packageInfo(payableOutgoingBookings);
    const outgoingPaid = payableOutgoingBookings.reduce((sum, booking) => {
      if (booking.status === 'cancelled' || booking.paymentStatus === 'refunded') return sum;
      return sum + (
        outgoingPackagePayments.get(String(booking._id)) ?? Number(booking.finalPrice || 0)
      );
    }, 0);
    const fundedPayouts = (payoutRecord?.payouts || [])
      .filter((payout) => payout.status === 'funded')
      .reduce((sum, payout) => sum + Number(payout.withdrawAmount || 0), 0);
    const totalPaidOut = outgoingPaid + fundedPayouts;
    const actualAvailableBalance = Math.max(0, lifetimeEarning - totalPaidOut);
    await CreatorProfile.updateOne(
      { _id: creatorProfile._id },
      {
        $set: {
          actual_totall_earning: actualAvailableBalance,
          actual_life_time_earning: lifetimeEarning,
        },
      },
    );

    return NextResponse.json({
      success: true,
      creatorName: creatorProfile.displayName || creatorUser?.name || 'Creator',
      wallet: {
        availableBalance: creatorProfile.updated_totall_earning ?? actualAvailableBalance,
        lifetimeEarning: creatorProfile.updated_life_time_earning ?? lifetimeEarning,
        actualAvailableBalance,
        actualLifetimeEarning: lifetimeEarning,
        totalPaidOut,
      },
      payments: [...sessionPayments, ...eventPayments].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    });
  } catch (error) {
    console.error('Admin creator wallet GET error:', error);
    return NextResponse.json({ error: 'Unable to load creator wallet.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await authorizeAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }
    await connectDB();

    const body = await req.json();
    if (body.type === 'balance') {
      const field = body.field;
      const value = Number(body.value);
      if (
        !['availableBalance', 'lifetimeEarning'].includes(field) ||
        !Number.isFinite(value) ||
        value < 0
      ) {
        return NextResponse.json({ error: 'Enter a valid non-negative amount.' }, { status: 422 });
      }

      const update = field === 'availableBalance'
        ? { updated_totall_earning: value }
        : { updated_life_time_earning: value };
      const profile = await CreatorProfile.findOneAndUpdate(
        { userId: id },
        { $set: update },
        { new: true, runValidators: true },
      );
      if (!profile) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    if (body.type === 'payment') {
      const { paymentType, paymentId } = body;
      const totalAmount = Number(body.totalAmount);
      const platformAmount = Number(body.platformAmount);
      if (
        !['session', 'event'].includes(paymentType) ||
        !mongoose.isValidObjectId(paymentId) ||
        !Number.isFinite(totalAmount) ||
        !Number.isFinite(platformAmount) ||
        totalAmount < 0 ||
        platformAmount < 0 ||
        platformAmount > totalAmount
      ) {
        return NextResponse.json(
          { error: 'Enter valid payment and platform amounts. Platform amount cannot exceed payment amount.' },
          { status: 422 },
        );
      }

      const update = {
        $set: {
          updated_total_amount: totalAmount,
          updated_platform_amount: platformAmount,
        },
      };
      const updateOptions = {
        new: true,
        runValidators: true,
        // These fields are validated above and may be added after a model was
        // cached during development, so do not let Mongoose silently strip them.
        strict: false,
      } as const;
      const payment = paymentType === 'session'
        ? await Booking.findOneAndUpdate({ _id: paymentId, creatorId: id }, update, updateOptions)
        : await EventPurchase.findOneAndUpdate({ _id: paymentId, creatorId: id }, update, updateOptions);
      if (!payment) {
        return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });
      }
      if (
        payment.updated_total_amount !== totalAmount ||
        payment.updated_platform_amount !== platformAmount
      ) {
        console.error('Admin creator wallet payment update did not persist', {
          paymentType,
          paymentId,
        });
        return NextResponse.json({ error: 'Payment update did not persist.' }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid update request.' }, { status: 400 });
  } catch (error) {
    console.error('Admin creator wallet PUT error:', error);
    return NextResponse.json({ error: 'Unable to update creator wallet.' }, { status: 500 });
  }
}