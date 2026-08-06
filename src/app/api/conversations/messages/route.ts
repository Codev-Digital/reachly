import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const conversationId = request.nextUrl.searchParams.get('conversationId');
        if (!conversationId) {
            return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Only participants can read messages
        const uid = user._id.toString();
        if (conversation.creatorId.toString() !== uid && conversation.userId.toString() !== uid) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let query: any = { conversationId };

        if (conversation.creatorId.toString() === uid && conversation.creatorClearedAt) {
            query.createdAt = { $gt: conversation.creatorClearedAt };
        } else if (conversation.userId.toString() === uid && conversation.userClearedAt) {
            query.createdAt = { $gt: conversation.userClearedAt };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: 1 })
            .lean();

        const formatted = messages.map((msg: any) => ({
            id: msg._id.toString(),
            conversationId: msg.conversationId?.toString(),
            bookingId: msg.bookingId?.toString(),
            senderId: msg.senderId.toString(),
            senderRole: msg.senderRole,
            content: msg.content,
            read: msg.read || false,
            createdAt: msg.createdAt,
            attachment: msg.attachment,
        }));

        return NextResponse.json({ success: true, messages: formatted });
    } catch (error: any) {
        console.error('GET /api/conversations/messages error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
