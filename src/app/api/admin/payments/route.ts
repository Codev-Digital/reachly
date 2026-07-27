import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';

function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fetch all bookings sorted by newest first
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();

    // Fetch all users and creators for fast lookup
    const users = await User.find({}).lean();
    const creatorProfiles = await CreatorProfile.find({}).lean();

    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
    const creatorMap = new Map(creatorProfiles.map((cp: any) => [cp.userId.toString(), cp]));

    const enrichedPayments = bookings.map((booking: any) => {
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

      // Status mapping based on booking.status
      let displayStatus = 'Pending';
      if (booking.status === 'completed' || booking.status === 'confirmed') displayStatus = 'Completed';
      else if (booking.status === 'refunded' || booking.status === 'cancelled') displayStatus = 'Refunded';

      // Parse amount (assume finalPrice is string like "25,000" or number)
      let numericAmount = 0;
      if (typeof booking.finalPrice === 'string') {
        numericAmount = parseFloat(booking.finalPrice.replace(/[^0-9.]/g, '')) || 0;
      } else if (typeof booking.finalPrice === 'number') {
        numericAmount = booking.finalPrice;
      }

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

    return NextResponse.json({ success: true, payments: enrichedPayments });
  } catch (error: any) {
    console.error('Admin payments GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
