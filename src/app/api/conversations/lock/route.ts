import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId, isLocked } = await request.json();
        if (!conversationId || typeof isLocked !== 'boolean') {
            return NextResponse.json({ error: 'conversationId and isLocked are required' }, { status: 400 });
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

        // Only the creator can lock/unlock
        if (conversation.creatorId.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Only the creator can lock/unlock this conversation' }, { status: 403 });
        }

        conversation.isLocked = isLocked;
        await conversation.save();

        return NextResponse.json({ success: true, isLocked: conversation.isLocked });
    } catch (error: any) {
        console.error('POST /api/conversations/lock error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
