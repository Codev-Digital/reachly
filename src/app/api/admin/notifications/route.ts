import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import PackagePurchase from '@/models/PackagePurchase';
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

    const notifications: any[] = [];

    // 1. Fetch Users & Creators awaiting approval
    const pendingUsers = await User.find({ approvalStatus: 'pending' }).lean();
    
    // Distinguish between normal users and creators based on CreatorProfile existence
    const userIds = pendingUsers.map(u => u._id);
    const creatorProfiles = await CreatorProfile.find({ userId: { $in: userIds } }).lean();
    const creatorUserIds = new Set(creatorProfiles.map((cp: any) => cp.userId.toString()));

    for (const user of pendingUsers) {
      const isCreator = creatorUserIds.has(user._id.toString());
      notifications.push({
        id: `usr-${user._id}`,
        type: isCreator ? 'creator_approval' : 'user_approval',
        title: isCreator ? 'New Creator Approval' : 'New User Approval',
        message: `${user.name || user.email} is waiting for account approval.`,
        date: user.createdAt || new Date(),
        link: isCreator ? '/admin/creators' : '/admin/users'
      });
    }

    // 2. Fetch recent payments (bookings) - limit to last 20 for notifications
    const recentBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const pkgIds = [...new Set(recentBookings.map((b: any) => b.packagePurchaseId?.toString()).filter(Boolean))];
    const pkgPurchases = pkgIds.length ? ((await PackagePurchase.find({ _id: { $in: pkgIds } }).select('price').lean()) as any[]) : [];
    const pkgPrice = new Map(pkgPurchases.map((p) => [String(p._id), p.price]));

    for (const booking of recentBookings) {
      // A package is a single payment, made with its first session
      if (booking.packagePurchaseId && booking.sessionNumber !== 1) continue;
      if (booking.status === 'completed' || booking.status === 'confirmed' || booking.status === 'pending') {
        notifications.push({
          id: `bkg-${booking._id}`,
          type: 'payment_received',
          title: 'Payment Received',
          message: `A new payment of PKR ${booking.packagePurchaseId ? pkgPrice.get(booking.packagePurchaseId.toString()) ?? booking.finalPrice : booking.finalPrice} was received.`,
          date: booking.createdAt || new Date(),
          link: '/admin/payments'
        });
      }
    }


    // Creators asking for a chat unlock so a package session can be rescheduled
    const rescheduleReqs = await Booking.find({ 'rescheduleRequest.status': 'pending' }).lean() as any[];
    for (const r of rescheduleReqs) {
      notifications.push({
        id: `rsr-${r._id}`,
        type: 'reschedule_request',
        title: 'Reschedule Request',
        message: `A creator asked to unlock the chat for session ${r.bookingRef} so it can be rescheduled.`,
        date: r.rescheduleRequest?.requestedAt || r.updatedAt || new Date(),
        link: '/admin/reschedule-requests',
      });
    }

    // Sort by date descending
    notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error('Admin notifications GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
