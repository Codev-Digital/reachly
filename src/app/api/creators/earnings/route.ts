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

    const timeframe = searchParams.get('timeframe') || 'monthly'; // 'weekly' | 'monthly' | 'yearly'

    if (timeframe === 'weekly') {
      // Return 7 days of the current week (or recent 7 days)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dailyTotals = Array(7).fill(0);
      const dailyBookings = Array(7).fill(0);

      const now = new Date();
      const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon
      const distanceToMon = (currentDayOfWeek + 6) % 7;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - distanceToMon);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const weekBookings = await Booking.find({
        creatorId: user._id,
        status: { $in: ['confirmed', 'completed'] },
        scheduledDate: { $gte: startOfWeek, $lte: endOfWeek },
      }).select('finalPrice scheduledDate status');

      weekBookings.forEach((b) => {
        const d = new Date(b.scheduledDate);
        const dayIdx = (d.getDay() + 6) % 7;
        dailyTotals[dayIdx] += b.finalPrice || 0;
        dailyBookings[dayIdx] += 1;
      });

      const chartData = days.map((day, idx) => ({
        label: day,
        month: day,
        earnings: dailyTotals[idx],
        bookings: dailyBookings[idx],
      }));

      const totalEarnings = dailyTotals.reduce((sum, v) => sum + v, 0);

      return NextResponse.json({
        success: true,
        year,
        timeframe: 'weekly',
        totalEarnings,
        chartData,
      });
    }

    // Monthly view (default)
    const chartData = MONTHS.map((month, idx) => ({
      label: month,
      month,
      earnings: monthlyTotals[idx],
      bookings: monthlyBookings[idx],
    }));

    const totalEarnings = monthlyTotals.reduce((sum, v) => sum + v, 0);

    return NextResponse.json({
      success: true,
      year,
      timeframe: 'monthly',
      totalEarnings,
      chartData,
    });
  } catch (error: any) {
    console.error('Earnings API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
