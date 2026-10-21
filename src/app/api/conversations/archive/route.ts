import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, archive } = await req.json();
    if (!conversationId || typeof archive !== 'boolean') {
      return NextResponse.json({ error: 'conversationId and archive (boolean) are required' }, { status: 400 });
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

    const uid = user._id.toString();
    const isCreator = conv.creatorId.toString() === uid;
    const isDmPeer = conv.userId && conv.userId.toString() === uid;
    const isBroadcastMember =
      conv.type === 'broadcast' &&
      Array.isArray(conv.participantIds) &&
      conv.participantIds.some((id: any) => id.toString() === uid);

    if (isCreator) {
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $set: { isArchivedByCreator: archive } },
        { new: true }
      );
    } else if (isDmPeer || isBroadcastMember) {
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $set: { isArchivedByUser: archive } },
        { new: true }
      );
    } else {
      return NextResponse.json({ error: 'Only participants can archive this chat' }, { status: 403 });
    }

    return NextResponse.json({ success: true, isArchivedByCreator: archive });
  } catch (error: any) {
    console.error('POST /api/conversations/archive error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
