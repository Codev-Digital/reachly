import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import { decodeAttachmentsFromContent } from '@/lib/chatAttachments';

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

        // Resolve by email (same as /api/conversations) — session.user.id can be empty/stale
        const user = await User.findOne({ email: session.user.email }).select('_id').lean() as any;
        if (!user?._id) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const uid = user._id.toString();

        const conversation = await Conversation.findById(conversationId).lean() as any;
        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const isBroadcast = conversation.type === 'broadcast';
        const isCreator = conversation.creatorId?.toString() === uid;
        const isDmPeer = conversation.userId && conversation.userId.toString() === uid;
        const isBroadcastMember =
            isBroadcast &&
            Array.isArray(conversation.participantIds) &&
            conversation.participantIds.some((id: any) => id.toString() === uid);

        // Only participants can read messages
        if (!isCreator && !isDmPeer && !isBroadcastMember) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let query: any = { conversationId };

        if (isCreator && conversation.creatorClearedAt) {
            query.createdAt = { $gt: conversation.creatorClearedAt };
        } else if (!isCreator && conversation.userClearedAt) {
            query.createdAt = { $gt: conversation.userClearedAt };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: 1 })
            .lean();

        // Resolve display name/avatar only for senders in this thread (avoid huge participantIds $in)
        const profileIds = Array.from(
            new Set([
                ...messages.map((m: any) => m.senderId.toString()),
                conversation.creatorId.toString(),
            ])
        );

        const [users, creatorProfiles] = await Promise.all([
            profileIds.length
                ? User.find({ _id: { $in: profileIds } }).select('_id name profilePhoto').lean()
                : Promise.resolve([]),
            profileIds.length
                ? CreatorProfile.find({ userId: { $in: profileIds } })
                      .select('userId displayName username profilePhoto')
                      .lean()
                : Promise.resolve([]),
        ]);

        const usersMap = new Map<string, any>((users as any[]).map((u) => [u._id.toString(), u]));
        const creatorProfilesMap = new Map<string, any>(
            (creatorProfiles as any[]).map((cp) => [cp.userId.toString(), cp])
        );

        // Joiners (user role) → User name/photo; creators → CreatorProfile then User
        const resolveProfile = (userId: string, senderRole?: string) => {
            const user = usersMap.get(userId);
            const creatorProfile = creatorProfilesMap.get(userId);
            if (senderRole === 'user') {
                return {
                    name: user?.name || 'User',
                    avatar: user?.profilePhoto || '/avatar.png',
                };
            }
            const name =
                creatorProfile?.displayName ||
                creatorProfile?.username ||
                user?.name ||
                'User';
            const avatar =
                creatorProfile?.profilePhoto || user?.profilePhoto || '/avatar.png';
            return { name, avatar };
        };

        const participantProfiles: Record<string, { name: string; avatar: string }> = {};
        for (const id of profileIds) {
            // Default map for joiners uses User fields; creator id uses creator profile
            const roleHint =
                id === conversation.creatorId.toString() ? 'creator' : 'user';
            participantProfiles[id] = resolveProfile(id, roleHint);
        }

        const formatted = messages.map((msg: any) => {
            const fromFields =
                Array.isArray(msg.attachments) && msg.attachments.length
                    ? msg.attachments
                    : msg.attachment
                      ? [msg.attachment]
                      : [];
            // Older multi-image rows only stored singular `attachment`; full album is in content.
            const fromContent = decodeAttachmentsFromContent(msg.content);
            const attachments =
                fromContent.length > fromFields.length ? fromContent : fromFields.length ? fromFields : fromContent;
            const senderId = msg.senderId.toString();
            const profile = resolveProfile(senderId, msg.senderRole);
            // Keep map in sync with role-aware resolution for live UI lookups
            participantProfiles[senderId] = profile;
            return {
                id: msg._id.toString(),
                conversationId: msg.conversationId?.toString(),
                bookingId: msg.bookingId?.toString(),
                senderId,
                senderRole: msg.senderRole,
                senderName: profile.name,
                senderAvatar: profile.avatar,
                content: msg.content,
                read: msg.read || false,
                createdAt: msg.createdAt,
                attachment: attachments[0] || msg.attachment,
                attachments,
            };
        });

        return NextResponse.json({
            success: true,
            messages: formatted,
            participantProfiles,
        });
    } catch (error: any) {
        console.error('GET /api/conversations/messages error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
