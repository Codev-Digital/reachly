import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
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
      if (booking.paymentStatus === 'paid') displayStatus = 'Completed';
      else if (booking.status === 'refunded' || booking.status === 'cancelled' || booking.paymentStatus === 'refunded') displayStatus = 'Refunded';

      const purchase = booking.packagePurchaseId ? purchaseMap.get(booking.packagePurchaseId.toString()) : null;
      if (purchase) displayStatus = purchase.paymentStatus === 'paid' ? 'Completed' : 'Pending';

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
      const payment = enrichedPayments[0];
      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, payment });
    }

    return NextResponse.json({ success: true, payments: enrichedPayments });
  } catch (error: any) {
    console.error('Admin payments GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
