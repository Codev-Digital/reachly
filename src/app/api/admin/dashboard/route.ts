import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import { richTextToPlain } from '@/lib/richText';
import Booking from '@/models/Booking';

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

    // 1. Fetch Users, Profiles & Bookings
    const [allUsers, rawProfiles, bookings] = await Promise.all([
      User.find({}).lean(),
      CreatorProfile.find({}).lean(),
      Booking.find({}).lean(),
    ]);

    const userIdsSet = new Set(allUsers.map((u: any) => u._id.toString()));
    const profiles = rawProfiles.filter((p: any) => userIdsSet.has(p.userId.toString()));
    const creatorUserIds = new Set(profiles.map((p: any) => p.userId.toString()));

    const normalUsers = allUsers.filter((u: any) => !creatorUserIds.has(u._id.toString()));

    const totalCreatorsCount = profiles.length;
    const totalNormalUsersCount = normalUsers.length;
    const totalUsersCount = normalUsers.length; // Ensure dashboard "Total Users" matches only normal users

    // Calculate percentage change from last month for users & creators
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const usersThisMonth = normalUsers.filter((u: any) => new Date(u.createdAt) >= startOfCurrentMonth).length;
    const usersLastMonth = normalUsers.filter(
      (u: any) => new Date(u.createdAt) >= startOfLastMonth && new Date(u.createdAt) < startOfCurrentMonth
    ).length;

    const userGrowthTrend = usersLastMonth === 0 
      ? (usersThisMonth > 0 ? '+100%' : '+0%') 
      : `${(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100).toFixed(1)}%`;

    const creatorsThisMonth = profiles.filter((p: any) => new Date(p.createdAt || p.updatedAt || Date.now()) >= startOfCurrentMonth).length;
    const creatorsLastMonth = profiles.filter(
      (p: any) => {
        const d = new Date(p.createdAt || p.updatedAt || Date.now());
        return d >= startOfLastMonth && d < startOfCurrentMonth;
      }
    ).length;

    const creatorGrowthTrend = creatorsLastMonth === 0 
      ? (creatorsThisMonth > 0 ? '+100%' : '+0%') 
      : `${(((creatorsThisMonth - creatorsLastMonth) / creatorsLastMonth) * 100).toFixed(1)}%`;

    // Helper to safely parse amounts
    const parseAmount = (val: any) => {
      if (typeof val === 'string') {
        return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
      }
      if (typeof val === 'number') {
        return val;
      }
      return 0;
    };

    // Revenue calculations (paid bookings or completed/confirmed)
    const totalRevenue = bookings
      .filter((b: any) => b.paymentStatus === 'paid' || b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum: number, b: any) => sum + parseAmount(b.finalPrice || b.price), 0);

    const pendingPayouts = bookings
      .filter((b: any) => !['completed', 'confirmed', 'refunded', 'cancelled'].includes(b.status))
      .reduce((sum: number, b: any) => sum + parseAmount(b.finalPrice || b.price), 0);

    // Monthly Earnings Data (Jan - Dec of current year)
    const currentYear = now.getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyEarnings = months.map((month, index) => {
      const monthBookings = bookings.filter((b: any) => {
        const d = new Date(b.createdAt);
        return d.getFullYear() === currentYear && d.getMonth() === index && b.paymentStatus === 'paid';
      });

      const earningsVal = monthBookings.reduce((sum: number, b: any) => sum + parseAmount(b.finalPrice || b.price), 0);

      // Compare with previous month for trend
      const prevMonthBookings = bookings.filter((b: any) => {
        const d = new Date(b.createdAt);
        const prevMonthIndex = index === 0 ? 11 : index - 1;
        const prevYear = index === 0 ? currentYear - 1 : currentYear;
        return d.getFullYear() === prevYear && d.getMonth() === prevMonthIndex && b.paymentStatus === 'paid';
      });
      const prevEarningsVal = prevMonthBookings.reduce((sum: number, b: any) => sum + parseAmount(b.finalPrice || b.price), 0);

      let trendStr = '+0%';
      if (prevEarningsVal === 0 && earningsVal > 0) trendStr = '+100%';
      else if (prevEarningsVal > 0) {
        const diff = ((earningsVal - prevEarningsVal) / prevEarningsVal) * 100;
        trendStr = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
      }

      return {
        month,
        rawEarnings: earningsVal,
        earnings: `PKR ${earningsVal.toLocaleString()}`,
        trend: trendStr,
      };
    });

    // Calculate dynamic bar heights relative to max earnings
    const maxEarnings = Math.max(...monthlyEarnings.map((m) => m.rawEarnings), 10000);
    const monthlyData = monthlyEarnings.map((m) => ({
      ...m,
      height: Math.max(Math.round((m.rawEarnings / maxEarnings) * 200), 20), // minimum 20px visible height
    }));

    // Categories (Niches) distribution
    const nicheStats: { [key: string]: { count: number; revenue: number } } = {};

    profiles.forEach((profile: any) => {
      const creatorBookings = bookings.filter((b: any) => b.creatorId.toString() === profile.userId.toString() && b.paymentStatus === 'paid');
      const creatorRev = creatorBookings.reduce((sum: number, b: any) => sum + parseAmount(b.finalPrice || b.price), 0);

      const niches = profile.niches && profile.niches.length > 0 ? profile.niches : ['General'];
      niches.forEach((niche: string) => {
        if (!nicheStats[niche]) {
          nicheStats[niche] = { count: 0, revenue: 0 };
        }
        nicheStats[niche].count += 1;
        nicheStats[niche].revenue += creatorRev / niches.length;
      });
    });

    const maxCount = Math.max(...Object.values(nicheStats).map((n) => n.count), 1);
    const categories = Object.entries(nicheStats)
      .map(([name, data]) => ({
        name,
        count: data.count,
        revenue: `PKR ${Math.round(data.revenue).toLocaleString()}`,
        percentage: Math.round((data.count / maxCount) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Top Creators (sorted by completed bookings or revenue)
    const creatorUserMap = new Map();
    allUsers.forEach((u: any) => creatorUserMap.set(u._id.toString(), u));

    const topCreatorsList = profiles
      .filter((p: any) => creatorUserMap.has(p.userId.toString()))
      .map((p: any) => {
        const user = creatorUserMap.get(p.userId.toString());
        const creatorBookings = bookings.filter((b: any) => b.creatorId.toString() === p.userId.toString());
        const completedCount = creatorBookings.filter((b: any) => b.status === 'completed').length;
        const totalRevenue = creatorBookings
          .filter((b: any) => b.paymentStatus === 'paid')
          .reduce((sum: number, b: any) => sum + parseAmount(b.finalPrice || b.price), 0);

        return {
          id: p.userId.toString(),
          name: p.displayName || user?.name || 'Creator',
          handle: p.username ? `@${p.username}` : `@${(user?.name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
          tag: p.isApproved ? 'Verified' : 'Sponsored',
          img: p.profilePhoto || user?.profilePhoto || '/avatar.png',
          rating: '4.9', // default stellar rating
          description: p.shortBio || richTextToPlain(p.longBio) || 'Content creator on Reachly.',
          price: p.startingPrice ? `${p.startingPrice} PKR` : '1000 PKR',
          isVerified: !!p.isApproved,
          completedCount,
          totalRevenue,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue || b.completedCount - a.completedCount);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsersCount,
        totalCreators: totalCreatorsCount,
        totalNormalUsers: totalNormalUsersCount,
        userGrowthTrend,
        creatorGrowthTrend,
        totalRevenue: `${totalRevenue.toLocaleString()} PKR`,
        pendingPayouts: `${pendingPayouts.toLocaleString()} PKR`,
      },
      monthlyData,
      categories,
      topCreators: topCreatorsList,
      adminName: session.user.name || 'Admin',
    });
  } catch (error: any) {
    console.error('Admin dashboard GET error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
