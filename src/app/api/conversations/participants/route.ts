import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import EventPurchase from '@/models/EventPurchase';
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

    const user = await User.findOne({ email: session.user.email }).select('_id').lean() as any;
    if (!user?._id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const conversation = await Conversation.findById(conversationId).lean() as any;
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.type !== 'broadcast') {
      return NextResponse.json({ error: 'Participants are only available for event chats' }, { status: 400 });
    }

    if (conversation.creatorId?.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Only the event creator can view participants' }, { status: 403 });
    }

    const muteAll = Boolean(conversation.muteAll);
    const mutedUserIds = new Set(
      (conversation.mutedUserIds || []).map((id: any) => id.toString())
    );

    if (!conversation.eventId) {
      return NextResponse.json({
        success: true,
        muteAll,
        mutedUserIds: Array.from(mutedUserIds),
        participants: [],
        participantCount: 0,
      });
    }

    const purchases = await EventPurchase.find({
      eventId: conversation.eventId,
      status: { $ne: 'cancelled' },
    })
      .select('userId buyerEmail tierTitle tierPrice quantity createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const userIds = Array.from(
      new Set(purchases.map((p: any) => p.userId?.toString()).filter(Boolean))
    );

    const users = userIds.length
      ? await User.find({ _id: { $in: userIds } })
          .select('_id name email profilePhoto')
          .lean()
      : [];

    const usersMap = new Map<string, any>(
      (users as any[]).map((u) => [u._id.toString(), u])
    );

    const byUser = new Map<
      string,
      {
        userId: string;
        name: string;
        email: string;
        avatar: string;
        tiers: string[];
        quantity: number;
      }
    >();

    for (const purchase of purchases as any[]) {
      const uid = purchase.userId?.toString();
      if (!uid) continue;
      const profile = usersMap.get(uid);
      const existing = byUser.get(uid);
      const tier = (purchase.tierTitle || '').trim();
      if (existing) {
        if (tier && !existing.tiers.includes(tier)) existing.tiers.push(tier);
        existing.quantity += purchase.quantity || 0;
      } else {
        byUser.set(uid, {
          userId: uid,
          name: profile?.name || 'User',
          email: profile?.email || purchase.buyerEmail || '',
          avatar: profile?.profilePhoto || '/avatar.png',
          tiers: tier ? [tier] : [],
          quantity: purchase.quantity || 1,
        });
      }
    }

    const participants = Array.from(byUser.values()).map((p) => ({
      userId: p.userId,
      name: p.name,
      email: p.email,
      avatar: p.avatar,
      tierTitle: p.tiers.join(', ') || '—',
      quantity: p.quantity,
      isMuted: muteAll || mutedUserIds.has(p.userId),
    }));

    participants.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      muteAll,
      mutedUserIds: Array.from(mutedUserIds),
      participants,
      participantCount: participants.length,
    });
  } catch (error: any) {
    console.error('GET /api/conversations/participants error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
