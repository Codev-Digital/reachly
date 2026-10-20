import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import PackagePurchase from '@/models/PackagePurchase';
import CreatorProfile from '@/models/CreatorProfile';
import { autoSettleEarnings } from '@/lib/autoSettleEarnings';

// The logged-in user's packages with progress ("2 of 5 completed") and whether
// the next session can be booked yet (only after the previous one is completed).
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select('_id').lean() as any;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await autoSettleEarnings(); // brings completed flags up to date

    const purchases = await PackagePurchase.find({ userId: user._id }).sort({ createdAt: -1 }).lean() as any[];
    const [bookings, profiles] = await Promise.all([
      Booking.find({ packagePurchaseId: { $in: purchases.map((p) => p._id) } })
        .select('packagePurchaseId sessionNumber bookingRef scheduledDate scheduledTime status')
        .sort({ sessionNumber: 1 })
        .lean() as Promise<any[]>,
      CreatorProfile.find({ userId: { $in: purchases.map((p) => p.creatorId) } })
        .select('userId username displayName profilePhoto')
        .lean() as Promise<any[]>,
    ]);
    const profileByUser = new Map(profiles.map((p) => [String(p.userId), p]));

    return NextResponse.json({
      success: true,
      packages: purchases.map((p) => {
        const mine = bookings.filter((b) => String(b.packagePurchaseId) === String(p._id));
        const completed = mine.filter((b) => b.status === 'completed').length;
        const creator = profileByUser.get(String(p.creatorId));
        return {
          id: String(p._id),
          title: p.title,
          price: p.price,
          status: p.status,
          sessionsTotal: p.sessionsTotal,
          sessionsBooked: p.sessionsBooked,
          sessionsCompleted: completed,
          creatorName: creator?.displayName || 'Creator',
          creatorUsername: creator?.username || '',
          creatorPhoto: creator?.profilePhoto || '/avatar.png',
          sessionTypeId: String(p.sessionTypeId),
          // next one unlocks once everything booked so far is completed
          canBookNext: p.status === 'active' && p.sessionsBooked < p.sessionsTotal && completed === p.sessionsBooked,
          nextNumber: p.sessionsBooked + 1,
          sessions: mine.map((b) => ({
            number: b.sessionNumber,
            bookingRef: b.bookingRef,
            date: b.scheduledDate,
            time: b.scheduledTime,
            status: b.status,
          })),
        };
      }),
    });
  } catch (error) {
    console.error('GET /api/user/packages error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
