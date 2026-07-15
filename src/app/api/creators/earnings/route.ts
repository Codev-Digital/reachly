import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Fetch all non-cancelled bookings for this creator in the requested year
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const bookings = await Booking.find({
      creatorId: user._id,
      status: { $in: ['confirmed', 'completed'] },
      scheduledDate: { $gte: startOfYear, $lte: endOfYear },
    }).select('finalPrice scheduledDate status');

    // Aggregate earnings per month
    const monthlyTotals: number[] = Array(12).fill(0);
    const monthlyBookings: number[] = Array(12).fill(0);

    bookings.forEach((b) => {
      const month = new Date(b.scheduledDate).getMonth(); // 0-indexed
      monthlyTotals[month] += b.finalPrice || 0;
      monthlyBookings[month] += 1;
    });

    const chartData = MONTHS.map((month, idx) => ({
      month,
      earnings: monthlyTotals[idx],
      bookings: monthlyBookings[idx],
    }));

    // Total for the year
    const totalEarnings = monthlyTotals.reduce((sum, v) => sum + v, 0);

    // Selected month earnings (if month param provided)
    const selectedMonth = searchParams.get('month');
    const selectedMonthEarnings = selectedMonth !== null
      ? monthlyTotals[parseInt(selectedMonth, 10)]
      : null;

    return NextResponse.json({
      success: true,
      year,
      totalEarnings,
      selectedMonthEarnings,
      chartData,
    });
  } catch (error: any) {
    console.error('Earnings API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
