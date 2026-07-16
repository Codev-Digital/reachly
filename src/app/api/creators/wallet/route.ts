import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import SessionType from '@/models/SessionType';

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

    // Fetch all bookings for this creator
    const bookings = await Booking.find({ creatorId: user._id })
      .populate({ path: 'sessionTypeId', model: SessionType })
      .sort({ createdAt: -1 });

    // Calculate metrics
    let lifetimeEarning = 0;
    let pendingEarning = 0;
    let totalPaidOut = 0; // Default to 0 since there's no payout schema/actions yet

    const transactions = bookings.map((b: any) => {
      const amount = b.finalPrice || 0;
      const status = b.status;

      if (status === 'completed') {
        lifetimeEarning += amount;
      } else if (status === 'confirmed' || status === 'pending') {
        pendingEarning += amount;
      }

      // Map booking to transaction shape
      const d = new Date(b.createdAt);
      const formattedDate = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const formattedTime = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      let displayStatus = 'Pending';
      if (status === 'completed') displayStatus = 'Completed';
      if (status === 'cancelled' || status === 'refunded') displayStatus = 'Failed';

      return {
        id: b.bookingRef || `TXN-${b._id.toString().slice(-5).toUpperCase()}`,
        type: status === 'refunded' ? 'Refund' : 'Booking Earning',
        date: formattedDate,
        time: formattedTime,
        amount: `${amount.toLocaleString()} PKR`,
        status: displayStatus,
        rawAmount: amount
      };
    });

    const availableBalance = Math.max(0, lifetimeEarning - totalPaidOut);

    return NextResponse.json({
      success: true,
      availableBalance,
      lifetimeEarning,
      pendingEarning,
      totalPaidOut,
      transactions
    });
  } catch (error: any) {
    console.error('Creator wallet API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
