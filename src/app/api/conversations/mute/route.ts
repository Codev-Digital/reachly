import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import EventPurchase from '@/models/EventPurchase';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * POST body:
 * { conversationId, muteAll?: boolean, muteUserId?: string, unmuteUserId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, muteAll, muteUserId, unmuteUserId } = await request.json();
    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select('_id').lean() as any;
    if (!user?._id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.type !== 'broadcast') {
      return NextResponse.json({ error: 'Mute is only available for event chats' }, { status: 400 });
    }

    if (conversation.creatorId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Only the event creator can mute participants' }, { status: 403 });
    }

    const mutedSet = new Set(
      (conversation.mutedUserIds || []).map((id: any) => id.toString())
    );

    if (typeof muteAll === 'boolean') {
      conversation.muteAll = muteAll;
      if (muteAll) {
        conversation.mutedUserIds = [];
      }
    }

    if (muteUserId && typeof muteUserId === 'string') {
      if (muteUserId === conversation.creatorId.toString()) {
        return NextResponse.json({ error: 'Cannot mute the creator' }, { status: 400 });
      }
      mutedSet.add(muteUserId);
      conversation.muteAll = false;
      conversation.mutedUserIds = Array.from(mutedSet).map(
        (id) => new mongoose.Types.ObjectId(id)
      ) as any;
    }

    if (unmuteUserId && typeof unmuteUserId === 'string') {
      if (conversation.muteAll) {
        // Unmute one while everyone is muted → mute everyone else instead
        const purchases = conversation.eventId
          ? await EventPurchase.find({
              eventId: conversation.eventId,
              status: { $ne: 'cancelled' },
            })
              .select('userId')
              .lean()
          : [];
        const others = new Set(
          (purchases as any[])
            .map((p) => p.userId?.toString())
            .filter((id: string) => id && id !== unmuteUserId)
        );
        conversation.muteAll = false;
        conversation.mutedUserIds = Array.from(others).map(
          (id) => new mongoose.Types.ObjectId(id)
        ) as any;
      } else {
        mutedSet.delete(unmuteUserId);
        conversation.mutedUserIds = Array.from(mutedSet).map(
          (id) => new mongoose.Types.ObjectId(id)
        ) as any;
      }
    }

    await conversation.save();

    const mutedUserIds = (conversation.mutedUserIds || []).map((id: any) => id.toString());

    return NextResponse.json({
      success: true,
      muteAll: Boolean(conversation.muteAll),
      mutedUserIds,
    });
  } catch (error: any) {
    console.error('POST /api/conversations/mute error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
