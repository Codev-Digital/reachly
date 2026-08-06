import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';

// GET all notifications for creator
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

    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get('countOnly') === 'true';

    if (countOnly) {
      const count = await Notification.countDocuments({ userId: user._id, read: false });
      return NextResponse.json({ success: true, count });
    }

    const rawNotifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

    // Ensure createdAt is always serialized as ISO string
    const notifications = rawNotifications.map((n: any) => ({
      ...n,
      _id: n._id?.toString(),
      userId: n.userId?.toString(),
      createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
      updatedAt: n.updatedAt instanceof Date ? n.updatedAt.toISOString() : n.updatedAt,
    }));

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PUT to mark notifications as read
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await Notification.updateMany({ userId: user._id, read: false }, { $set: { read: true } });
    } else if (notificationId) {
      await Notification.updateOne({ _id: notificationId, userId: user._id }, { $set: { read: true } });
    }

    return NextResponse.json({ success: true, message: 'Updated notifications status' });
  } catch (error: any) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
