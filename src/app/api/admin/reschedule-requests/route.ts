import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Conversation from '@/models/Conversation';
import Notification from '@/models/Notification';

function isAdmin(email?: string | null) {
  return !!email && ['abdullahgotaccess@gmail.com', 'admin@reachly.com'].includes(email.toLowerCase());
}

// GET: pending "unlock chat to reschedule" requests from creators
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const bookings = await Booking.find({ 'rescheduleRequest.status': 'pending' })
      .populate('sessionTypeId', 'title')
      .sort({ 'rescheduleRequest.requestedAt': -1 })
      .lean() as any[];

    const ids = [...new Set(bookings.flatMap((b) => [b.creatorId, b.userId].filter(Boolean).map(String)))];
    const users = await User.find({ _id: { $in: ids } }).select('name email').lean() as any[];
    const byId = new Map(users.map((u) => [String(u._id), u]));

    return NextResponse.json({
      success: true,
      requests: bookings.map((b) => ({
        id: String(b._id),
        bookingRef: b.bookingRef,
        sessionTitle: b.sessionTypeId?.title || 'Session',
        sessionNumber: b.sessionNumber,
        scheduledDate: b.scheduledDate,
        scheduledTime: b.scheduledTime,
        creator: byId.get(String(b.creatorId))?.name || 'Creator',
        creatorEmail: byId.get(String(b.creatorId))?.email || '',
        user: b.guestDetails?.fullName || byId.get(String(b.userId))?.name || 'User',
        userEmail: b.guestDetails?.email || byId.get(String(b.userId))?.email || '',
        requestedAt: b.rescheduleRequest?.requestedAt,
      })),
    });
  } catch (error) {
    console.error('Admin reschedule-requests GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT { bookingId }: unlock the chat so the creator and user can talk
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const { bookingId } = await req.json();
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.rescheduleRequest?.status !== 'pending') {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    booking.isLocked = false;
    booking.rescheduleRequest = { status: 'unlocked', requestedAt: booking.rescheduleRequest.requestedAt };
    await booking.save();
    if (booking.userId) {
      await Conversation.updateOne({ creatorId: booking.creatorId, userId: booking.userId }, { isLocked: false });
    }

    const note = (userId: any, message: string) =>
      new Notification({ userId, title: 'Chat unlocked', message, type: 'reschedule', read: false, time: 'Just now' })
        .save()
        .catch(() => {});
    await Promise.all([
      note(booking.creatorId, 'The chat is unlocked. Agree a new time with your user, then reschedule the session.'),
      booking.userId ? note(booking.userId, 'Your creator would like to reschedule a session. The chat is now open.') : null,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin reschedule-requests PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
