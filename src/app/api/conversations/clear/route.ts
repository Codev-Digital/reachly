import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await req.json();
    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conv.creatorId.toString() === user._id.toString()) {
      conv.creatorClearedAt = new Date();
      conv.userClearedAt = new Date();
    } else if (conv.userId && conv.userId.toString() === user._id.toString()) {
      conv.userClearedAt = new Date();
    } else {
      return NextResponse.json({ error: 'Only participants can clear this chat' }, { status: 403 });
    }

    await conv.save();

    return NextResponse.json({ success: true, deletedCount: 0 });
  } catch (error: any) {
    console.error('POST /api/conversations/clear error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
