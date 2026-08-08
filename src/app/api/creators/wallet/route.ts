import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import SessionType from '@/models/SessionType';
import CreatorProfile from '@/models/CreatorProfile';
import { autoSettleEarnings } from '@/lib/autoSettleEarnings';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Auto-settle: mark past-due pending earnings as paid before fetching
    await autoSettleEarnings(user._id.toString());

    // Fetch incoming bookings (this creator is the host — earnings)
    const incomingBookings = await Booking.find({ creatorId: user._id })
      .populate({ path: 'sessionTypeId', model: SessionType })
      .sort({ createdAt: -1 });

    // Fetch outgoing bookings (this creator booked another creator)
    const outgoingBookings = await Booking.find({ userId: user._id, creatorId: { $ne: user._id } })
      .populate({ path: 'sessionTypeId', model: SessionType })
      .sort({ createdAt: -1 });

    // Collect other creator IDs for name lookup on outgoing
    const otherCreatorIds = Array.from(new Set(outgoingBookings.map((b: any) => b.creatorId?.toString()).filter(Boolean)));
    const otherCreatorProfiles = otherCreatorIds.length > 0
      ? await CreatorProfile.find({ userId: { $in: otherCreatorIds } }).select('userId displayName').lean() as any[]
      : [];
    const otherCreatorProfilesMap = new Map<string, string>(otherCreatorProfiles.map((cp) => [cp.userId.toString(), cp.displayName]));
    const otherCreatorUsers = otherCreatorIds.length > 0
      ? await User.find({ _id: { $in: otherCreatorIds } }).select('name').lean() as any[]
      : [];
    const otherCreatorUsersMap = new Map<string, string>(otherCreatorUsers.map((u: any) => [u._id.toString(), u.name]));

    // Calculate metrics
    let lifetimeEarning = 0;
    let pendingEarning = 0;
    let totalPaidOut = 0; // Default to 0 since there's no payout schema/actions yet

    // Map incoming bookings to transactions
    const incomingTransactions = incomingBookings.map((b: any) => {
      const amount = b.finalPrice || 0;
      const payStatus = b.paymentStatus || 'pending';
      const bookingStatus = b.status;

      if (payStatus === 'paid') {
        lifetimeEarning += amount;
      } else if (payStatus === 'pending' && bookingStatus !== 'cancelled' && bookingStatus !== 'refunded') {
        pendingEarning += amount;
      }

      const d = new Date(b.createdAt);
      const formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const formattedTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      let displayStatus = 'Pending';
      if (b.paymentStatus === 'paid') displayStatus = 'Completed';
      if (b.status === 'cancelled' || b.status === 'refunded' || b.paymentStatus === 'refunded') displayStatus = 'Failed';

      return {
        id: b.bookingRef || `TXN-${b._id.toString().slice(-5).toUpperCase()}`,
        type: bookingStatus === 'refunded' ? 'Refund' : 'Booking Earning',
        date: formattedDate,
        time: formattedTime,
        amount: `${amount.toLocaleString()} PKR`,
        status: displayStatus,
        rawAmount: amount
      };
    });

    // Map outgoing bookings to transactions (shown as "Booking with Creator")
    const outgoingTransactions = outgoingBookings.map((b: any) => {
      const amount = b.finalPrice || 0;
      const payStatus = b.paymentStatus || 'pending';
      const bookingStatus = b.status;

      // Outgoing bookings are expenses — deduct from wallet immediately by adding to totalPaidOut
      if (bookingStatus !== 'cancelled' && bookingStatus !== 'refunded' && payStatus !== 'refunded') {
        totalPaidOut += amount;
      }

      const d = new Date(b.createdAt);
      const formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const formattedTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      let displayStatus = 'Pending';
      if (b.paymentStatus === 'paid') displayStatus = 'Completed';
      if (b.status === 'cancelled' || b.paymentStatus === 'refunded') displayStatus = 'Failed';

      const creatorIdStr = b.creatorId?.toString() || '';
      const otherCreatorName = otherCreatorProfilesMap.get(creatorIdStr) || otherCreatorUsersMap.get(creatorIdStr) || 'Creator';

      return {
        id: b.bookingRef || `TXN-${b._id.toString().slice(-5).toUpperCase()}`,
        type: `Paid to ${otherCreatorName}`,
        date: formattedDate,
        time: formattedTime,
        amount: `-${amount.toLocaleString()} PKR`,
        status: displayStatus,
        rawAmount: -amount
      };
    });

    const allTransactions = [...incomingTransactions, ...outgoingTransactions].sort((a, b) => {
      // Sort by id (bookingRef is date-ish); fallback keeps original order
      return 0;
    });

    const availableBalance = Math.max(0, lifetimeEarning - totalPaidOut);

    return NextResponse.json({
      success: true,
      availableBalance,
      lifetimeEarning,
      pendingEarning,
      totalPaidOut,
      transactions: allTransactions
    });
  } catch (error: any) {
    console.error('Creator wallet API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

