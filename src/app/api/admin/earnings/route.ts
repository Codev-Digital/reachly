import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
    const timeframe = searchParams.get('timeframe') || 'monthly'; // 'weekly' | 'monthly'

    await connectDB();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const bookings = await Booking.find({
      paymentStatus: 'paid',
      createdAt: { $gte: startOfYear, $lte: endOfYear },
    }).select('finalPrice price createdAt status paymentStatus');

    const monthlyTotals: number[] = Array(12).fill(0);
    const monthlyBookings: number[] = Array(12).fill(0);
    const monthlyRawTotals: number[] = Array(12).fill(0);

    bookings.forEach((b) => {
      const month = new Date(b.createdAt).getMonth(); // 0-indexed
      const amount = b.finalPrice || b.price || 0;
      monthlyTotals[month] += amount;
      monthlyRawTotals[month] += amount;
      monthlyBookings[month] += 1;
    });

    // We also need previous month data for the trend string
    const maxEarnings = Math.max(...monthlyRawTotals, 10000);

    if (timeframe === 'weekly') {
      // Return 7 days of the current week (or recent 7 days)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dailyTotals = Array(7).fill(0);
      const dailyRawTotals = Array(7).fill(0);
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
        paymentStatus: 'paid',
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      }).select('finalPrice price createdAt status paymentStatus');

      weekBookings.forEach((b) => {
        const d = new Date(b.createdAt);
        const dayIdx = (d.getDay() + 6) % 7;
        const amount = b.finalPrice || b.price || 0;
        dailyTotals[dayIdx] += amount;
        dailyRawTotals[dayIdx] += amount;
        dailyBookings[dayIdx] += 1;
      });

      const maxDailyEarnings = Math.max(...dailyRawTotals, 1000);

      const chartData = days.map((day, idx) => {
        const earningsVal = dailyTotals[idx];
        return {
          label: day,
          month: day,
          rawEarnings: earningsVal,
          earnings: `PKR ${earningsVal.toLocaleString()}`,
          bookings: dailyBookings[idx],
          height: Math.max(Math.round((earningsVal / maxDailyEarnings) * 200), 20),
          trend: '+0%', // Can compute daily trend if needed, but keeping it simple
        };
      });

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
    const chartData = MONTHS.map((month, idx) => {
      const earningsVal = monthlyTotals[idx];
      
      // Calculate basic trend
      const prevEarningsVal = idx === 0 ? 0 : monthlyTotals[idx - 1]; // Simplified
      let trendStr = '+0%';
      if (prevEarningsVal === 0 && earningsVal > 0) trendStr = '+100%';
      else if (prevEarningsVal > 0) {
        const diff = ((earningsVal - prevEarningsVal) / prevEarningsVal) * 100;
        trendStr = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
      }

      return {
        label: month,
        month,
        rawEarnings: earningsVal,
        earnings: `PKR ${earningsVal.toLocaleString()}`,
        bookings: monthlyBookings[idx],
        height: Math.max(Math.round((earningsVal / maxEarnings) * 200), 20),
        trend: trendStr,
      };
    });

    const totalEarnings = monthlyTotals.reduce((sum, v) => sum + v, 0);

    return NextResponse.json({
      success: true,
      year,
      timeframe: 'monthly',
      totalEarnings,
      chartData,
    });
  } catch (error: any) {
    console.error('Admin Earnings API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
