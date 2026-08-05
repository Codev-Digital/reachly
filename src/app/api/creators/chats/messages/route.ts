import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Booking from '@/models/Booking';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const bookingId = request.nextUrl.searchParams.get('bookingId');
        if (!bookingId) {
            return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify the booking belongs to this creator
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.creatorId.toString() !== user._id.toString() && booking.userId?.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch messages sorted chronologically
        const messages = await Message.find({ bookingId })
            .sort({ createdAt: 1 })
            .lean();

        const formattedMessages = messages.map((msg: any) => ({
            id: msg._id.toString(),
            bookingId: msg.bookingId.toString(),
            senderId: msg.senderId.toString(),
            senderRole: msg.senderRole,
            content: msg.content,
            read: msg.read || false,
            createdAt: msg.createdAt,
        }));

        return NextResponse.json({ success: true, messages: formattedMessages });
    } catch (error: any) {
        console.error('GET /api/creators/chats/messages error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
