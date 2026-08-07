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

        const enriched = await Promise.all(
            filteredConversations.map(async (conv) => {
                const convId = conv._id.toString();
                const isCreator = conv.creatorId.toString() === userId;
                const otherUserId = isCreator ? conv.userId : conv.creatorId;

                // Participant info
                const otherUser = await User.findById(otherUserId).lean() as any;
                const creatorProfile = await CreatorProfile.findOne({ userId: otherUserId }).lean() as any;

                const displayName = creatorProfile?.displayName || otherUser?.name || 'Unknown';
                const username = creatorProfile?.username || '';
                const avatar = creatorProfile?.profilePhoto || otherUser?.profilePhoto || '/avatar.png';
                const email = otherUser?.email || '';

                // Last message
                const lastMsg = await Message.findOne({ conversationId: conv._id })
                    .sort({ createdAt: -1 })
                    .lean() as any;

                // Unread count
                const unreadSenderRole = isCreator ? 'user' : 'creator';
                const unreadCount = await Message.countDocuments({
                    conversationId: conv._id,
                    senderRole: unreadSenderRole,
                    read: false,
                });

                // Use date-specific booking if filter active, else latest booking
                let targetBooking: any = null;
                if (dateParam) {
                    const key = `${conv.creatorId}-${conv.userId}`;
                    targetBooking = dateBookingMap.get(key);
                } else {
                    targetBooking = await Booking.findOne({
                        creatorId: conv.creatorId,
                        userId: conv.userId,
                    })
                        .sort({ scheduledDate: -1 })
                        .lean() as any;
                }

                // Session type info
                let sessionTitle = '';
                let duration = '';
                if (targetBooking?.sessionTypeId) {
                    const st = await SessionType.findById(targetBooking.sessionTypeId).lean() as any;
                    if (st) {
                        sessionTitle = st.title || '';
                        duration = st.duration ? `${st.duration} min` : '';
                    }
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
                    lastMessage: lastMsg?.content || '',
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
            })
        );

        return NextResponse.json({ success: true, conversations: enriched });
    } catch (error: any) {
        console.error('GET /api/conversations error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
