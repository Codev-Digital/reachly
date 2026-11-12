import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import { decodeAttachmentsFromContent } from '@/lib/chatAttachments';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
    try {
        let authEmail: string | undefined;
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
            authEmail = session.user.email.toLowerCase().trim();
        } else {
            const token = request.cookies.get('auth_token')?.value;
            const payload = token ? verifyToken(token) : null;
            authEmail = payload?.email?.toLowerCase().trim();
        }
        if (!authEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const conversationId = request.nextUrl.searchParams.get('conversationId');
        if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
            return NextResponse.json({ error: 'Valid conversationId is required' }, { status: 400 });
        }

        await connectDB();

        // Fetch current user and conversation in parallel to save a DB round-trip
        const [user, conversation] = await Promise.all([
            User.findOne({ email: authEmail }).select('_id').lean() as Promise<any>,
            Conversation.findById(conversationId)
                .select('type creatorId userId participantIds creatorClearedAt userClearedAt')
                .lean() as Promise<any>,
        ]);

        if (!user?._id) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }
        const uid = user._id.toString();

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

        const query: any = { conversationId };
        if (isCreator && conversation.creatorClearedAt) {
            query.createdAt = { $gt: conversation.creatorClearedAt };
        } else if (!isCreator && conversation.userClearedAt) {
            query.createdAt = { $gt: conversation.userClearedAt };
        }

        const knownDmIds = !isBroadcast
            ? Array.from(
                  new Set(
                      [conversation.creatorId, conversation.userId]
                          .filter(Boolean)
                          .map((id: any) => id.toString())
                  )
              )
            : [];

        // For 1:1 DM chats, fetch messages and participant profiles simultaneously
        const [messages, preloadedUsers, preloadedCreators] = await Promise.all([
            Message.find(query)
                .select('conversationId bookingId senderId senderRole content read createdAt attachment attachments')
                .sort({ createdAt: 1 })
                .lean(),
            knownDmIds.length > 0
                ? User.find({ _id: { $in: knownDmIds } }).select('_id name profilePhoto').lean()
                : Promise.resolve([]),
            knownDmIds.length > 0
                ? CreatorProfile.find({ userId: { $in: knownDmIds } })
                      .select('userId displayName username profilePhoto')
                      .lean()
                : Promise.resolve([]),
        ]);

        const profileIds = Array.from(
            new Set([
                ...messages.map((m: any) => m.senderId.toString()),
                conversation.creatorId.toString(),
            ])
        );
        const knownSet = new Set(knownDmIds);
        const missingIds = profileIds.filter((id) => !knownSet.has(id));

        let users = preloadedUsers as any[];
        let creatorProfiles = preloadedCreators as any[];
        if (missingIds.length > 0) {
            const [extraUsers, extraCreators] = await Promise.all([
                User.find({ _id: { $in: missingIds } }).select('_id name profilePhoto').lean(),
                CreatorProfile.find({ userId: { $in: missingIds } })
                    .select('userId displayName username profilePhoto')
                    .lean(),
            ]);
            users = [...users, ...(extraUsers as any[])];
            creatorProfiles = [...creatorProfiles, ...(extraCreators as any[])];
        }

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
