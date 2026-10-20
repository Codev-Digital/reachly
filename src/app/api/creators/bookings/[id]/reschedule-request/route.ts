import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';

// Creator -> admin: "unlock the chat for this package session so we can agree a new time".
export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const creator = await User.findOne({ email: session.user.email }).select('_id').lean() as any;
    const booking = await Booking.findById(id);
    if (!creator || !booking || booking.creatorId.toString() !== creator._id.toString()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (!booking.packagePurchaseId) {
      return NextResponse.json({ error: 'Only package sessions use this request.' }, { status: 400 });
    }
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'Only upcoming sessions can be rescheduled.' }, { status: 400 });
    }
    if (booking.rescheduleRequest?.status === 'pending') {
      return NextResponse.json({ success: true, status: 'pending' });
    }

    booking.rescheduleRequest = { status: 'pending', requestedAt: new Date() };
    await booking.save();
    return NextResponse.json({ success: true, status: 'pending' });
  } catch (error: any) {
    console.error('reschedule-request error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
