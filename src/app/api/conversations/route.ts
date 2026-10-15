import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import Booking from '@/models/Booking';
import SessionType from '@/models/SessionType';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Optional date filter (YYYY-MM-DD) — used by creator chats page
        const dateParam = request.nextUrl.searchParams.get('date');

        await connectDB();

        const user = await User.findOne({ email: session.user.email }).lean() as any;
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = user._id.toString();

        // If a date is provided, find bookings on that date first and use them to
        // determine which conversations to show and which booking details to display.
        let dateBookingMap: Map<string, any> = new Map(); // key: `${creatorId}-${userId}`

        if (dateParam) {
            const startOfDay = new Date(dateParam);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateParam);
            endOfDay.setHours(23, 59, 59, 999);

            const bookingsOnDate = await Booking.find({
                creatorId: user._id,
                scheduledDate: { $gte: startOfDay, $lte: endOfDay },
                userId: { $exists: true, $ne: null },
            }).lean() as any[];

            for (const b of bookingsOnDate) {
                const key = `${b.creatorId}-${b.userId}`;
                // Keep earliest booking of the day if multiple
                if (!dateBookingMap.has(key)) {
                    dateBookingMap.set(key, b);
                }
            }

            // If no bookings on this date, return empty
            if (dateBookingMap.size === 0) {
                return NextResponse.json({ success: true, conversations: [] });
            }
        }

        // Find all conversations for this user
        const conversations = await Conversation.find({
            $or: [{ creatorId: user._id }, { userId: user._id }],
        })
            .sort({ updatedAt: -1 })
            .lean() as any[];

        // If date filter active, keep only conversations that have a booking on that date
        const filteredConversations = dateParam
            ? conversations.filter((conv) => {
                const key = `${conv.creatorId}-${conv.userId}`;
                return dateBookingMap.has(key);
            })
            : conversations;

        if (filteredConversations.length === 0) {
            return NextResponse.json({ success: true, conversations: [] });
        }

        const convIds = filteredConversations.map((c) => c._id);
        const otherUserIds = Array.from(new Set(
            filteredConversations.map((c) => (c.creatorId.toString() === userId ? c.userId : c.creatorId).toString())
        ));

        // Build pair matching for bookings
        const pairConditions = filteredConversations.map((c) => ({
            creatorId: c.creatorId,
            userId: c.userId,
        }));

        // Batch fetch users, profiles, messages, and bookings concurrently
        const [
            otherUsers,
            creatorProfiles,
            lastMessagesAgg,
            unreadCountsAgg,
            bookingsList
        ] = await Promise.all([
            User.find({ _id: { $in: otherUserIds } }).select('_id name email profilePhoto lastActiveAt').lean(),
            CreatorProfile.find({ userId: { $in: otherUserIds } }).select('userId displayName username profilePhoto').lean(),
            Message.aggregate([
                { $match: { conversationId: { $in: convIds } } },
                { $sort: { createdAt: -1 } },
                { $group: {
                    _id: '$conversationId',
                    content: { $first: '$content' },
                    createdAt: { $first: '$createdAt' },
                    senderRole: { $first: '$senderRole' }
                } }
            ]),
            Message.aggregate([
                { $match: { conversationId: { $in: convIds }, read: false } },
                { $group: {
                    _id: { conversationId: '$conversationId', senderRole: '$senderRole' },
                    count: { $sum: 1 }
                } }
            ]),
            !dateParam && pairConditions.length > 0
                ? Booking.find({ $or: pairConditions })
                    .sort({ scheduledDate: -1 })
                    .populate({ path: 'sessionTypeId', model: SessionType, select: 'title duration' })
                    .lean()
                : []
        ]);

        const otherUsersMap = new Map<string, any>((otherUsers as any[]).map((u) => [u._id.toString(), u]));
        const creatorProfilesMap = new Map<string, any>((creatorProfiles as any[]).map((cp) => [cp.userId.toString(), cp]));
        const lastMsgMap = new Map<string, any>(lastMessagesAgg.map((m: any) => [m._id.toString(), m]));
        
        // Unread map key: `${convId}-${senderRole}`
        const unreadMap = new Map<string, number>();
        unreadCountsAgg.forEach((item: any) => {
            const key = `${item._id.conversationId.toString()}-${item._id.senderRole}`;
            unreadMap.set(key, item.count);
        });

        // Booking map: pick the most recent booking per conversation pair
        const pairBookingMap = new Map<string, any>();
        (bookingsList as any[]).forEach((b) => {
            const key = `${b.creatorId.toString()}-${b.userId?.toString()}`;
            if (!pairBookingMap.has(key)) {
                pairBookingMap.set(key, b);
            }
        });

        const enriched = filteredConversations.map((conv) => {
            const convId = conv._id.toString();
            const isCreator = conv.creatorId.toString() === userId;
            const otherUserId = isCreator ? conv.userId.toString() : conv.creatorId.toString();

            const otherUser = otherUsersMap.get(otherUserId);
            const creatorProfile = creatorProfilesMap.get(otherUserId);

            const displayName = creatorProfile?.displayName || otherUser?.name || 'Unknown';
            const username = creatorProfile?.username || '';
            const avatar = creatorProfile?.profilePhoto || otherUser?.profilePhoto || '/avatar.png';
            const email = otherUser?.email || '';

            const lastMsg = lastMsgMap.get(convId);
            const unreadSenderRole = isCreator ? 'user' : 'creator';
            const unreadCount = unreadMap.get(`${convId}-${unreadSenderRole}`) || 0;

            const pairKey = `${conv.creatorId.toString()}-${conv.userId.toString()}`;
            const targetBooking = dateParam ? dateBookingMap.get(pairKey) : pairBookingMap.get(pairKey);

            let sessionTitle = '';
            let duration = '';
            if (targetBooking?.sessionTypeId) {
                sessionTitle = (targetBooking.sessionTypeId as any)?.title || '';
                const durVal = (targetBooking.sessionTypeId as any)?.duration;
                duration = durVal ? `${durVal} min` : '';
            }

            const scheduledDate = targetBooking?.scheduledDate
                ? new Date(targetBooking.scheduledDate).toISOString()
                : '';

            const shortDate = targetBooking?.scheduledDate
                ? new Date(targetBooking.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                  })
                : '';

            const time = targetBooking?.scheduledTime || '';
            const meetingUrl = targetBooking?.meetingUrl || null;
            const bookingRef = targetBooking?.bookingRef || '';
            const price = targetBooking?.finalPrice
                ? `PKR ${targetBooking.finalPrice.toLocaleString()}`
                : '';

            const isOnline = otherUser?.lastActiveAt
                ? Date.now() - new Date(otherUser.lastActiveAt).getTime() < 2 * 60 * 1000
                : false;

            return {
                id: convId,
                conversationId: convId,
                creatorId: conv.creatorId.toString(),
                userId: conv.userId.toString(),
                isLocked: conv.isLocked,
                isCreator,
                follower: displayName,
                creator: displayName,
                username,
                avatar,
                image: avatar,
                email,
                isOnline,
                lastMessage: (lastMsg?.content || '').split('|||')[0],
                lastMessageSenderRole: lastMsg?.senderRole || null,
                lastMessageTime: lastMsg?.createdAt || null,
                unreadCount,
                scheduledDate,
                shortDate,
                time,
                meetingUrl,
                session: sessionTitle,
                duration,
                price,
                ref: bookingRef,
                isArchivedByCreator: isCreator ? Boolean((conv as any).isArchivedByCreator) : false,
                isArchivedByUser: !isCreator ? Boolean((conv as any).isArchivedByUser) : false,
            };
        });

        return NextResponse.json({ success: true, conversations: enriched });
    } catch (error: any) {
        console.error('GET /api/conversations error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
