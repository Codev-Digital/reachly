import { NextRequest, NextResponse } from 'next/server';
import { packageLabels } from '@/lib/packageLabels';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import Message from '@/models/Message';
import Review from '@/models/Review';
import { richTextToPlain } from '@/lib/richText';

function convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    let hoursInt = parseInt(hours, 10);

    if (hoursInt === 12) {
        hoursInt = 0;
    }

    if (modifier === 'PM') {
        hoursInt = hoursInt + 12;
    }

    let hoursStr = hoursInt.toString().padStart(2, '0');
    return `${hoursStr}:${minutes}:00`;
}

export async function GET(request: NextRequest) {
    try {
        console.log('=== /api/creators/bookings called ===');
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            console.log('Unauthorized - no session email');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('Session email:', session.user.email);

        await connectDB();
        console.log('Connected to DB');

        const user = await User.findOne({ email: session.user.email }).select('_id').lean() as any;
        if (!user) {
            console.log('User not found');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        console.log('Found user:', user._id);

        // Get date parameter
        const dateParam = request.nextUrl.searchParams.get('date'); // e.g. "2026-08-05"
        const dateFilter: any = {};
        if (dateParam) {
            const targetDate = new Date(dateParam);
            const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));
            dateFilter.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
        }

        // ── 1. Query Incoming and Outgoing Bookings in parallel ────────────
        // Only show incoming bookings after payment has been verified by admin (confirmed/completed and not pending/failed)
        const incomingQuery: any = {
            creatorId: user._id,
            status: { $ne: 'pending' },
            paymentStatus: { $nin: ['pending', 'failed'] },
            ...dateFilter
        };
        const outgoingQuery: any = { userId: user._id, creatorId: { $ne: user._id }, ...dateFilter };

        const [incomingBookings, outgoingBookings] = await Promise.all([
            Booking.find(incomingQuery)
                .sort({ scheduledDate: -1, createdAt: -1 })
                .populate({ path: 'sessionTypeId', model: SessionType, select: 'title duration features' })
                .lean(),
            Booking.find(outgoingQuery)
                .sort({ scheduledDate: -1, createdAt: -1 })
                .populate({ path: 'sessionTypeId', model: SessionType, select: 'title duration features' })
                .lean()
        ]);

        const rawAllBookings = [...incomingBookings, ...outgoingBookings];
        if (rawAllBookings.length === 0) {
            return NextResponse.json({ bookings: [] });
        }

        const allBookingIds = rawAllBookings.map((b: any) => b._id);
        const pkgLabels = await packageLabels(rawAllBookings);
        const allUserIds = Array.from(new Set([
            ...rawAllBookings.map((b: any) => b.userId?.toString()),
            ...outgoingBookings.map((b: any) => b.creatorId?.toString())
        ].filter(Boolean)));

        const guestEmails = Array.from(new Set(
            rawAllBookings.map((b: any) => b.guestDetails?.email?.toLowerCase()).filter(Boolean)
        )) as string[];

        // ── 2. Batch fetch Users, Profiles, Messages, and my reviews concurrently ─────
        const [
            guestUsers,
            knownUsers,
            unreadCountsAgg,
            lastMessagesAgg,
            myReviews,
        ] = await Promise.all([
            guestEmails.length > 0
                ? User.find({ email: { $in: guestEmails } }).select('_id email name profilePhoto').lean()
                : [],
            allUserIds.length > 0
                ? User.find({ _id: { $in: allUserIds } }).select('_id email name profilePhoto').lean()
                : [],
            Message.aggregate([
                { $match: { bookingId: { $in: allBookingIds }, senderRole: 'user', read: false } },
                { $group: { _id: '$bookingId', count: { $sum: 1 } } }
            ]),
            Message.aggregate([
                { $match: { bookingId: { $in: allBookingIds } } },
                { $sort: { createdAt: -1 } },
                { $group: {
                    _id: '$bookingId',
                    content: { $first: '$content' },
                    createdAt: { $first: '$createdAt' }
                } }
            ]),
            Review.find({
                bookingId: { $in: allBookingIds },
                reviewerId: user._id,
            })
                .select('bookingId')
                .lean(),
        ]);

        // Collect all possible user IDs for creator profiles
        const guestUserIds = (guestUsers as any[]).map((u) => u._id.toString());
        const allProfileUserIds = Array.from(new Set([...allUserIds, ...guestUserIds]));
        const creatorProfiles = allProfileUserIds.length > 0
            ? await CreatorProfile.find({ userId: { $in: allProfileUserIds } }).select('userId displayName profilePhoto').lean() as any[]
            : [];

        // Build Map lookups for O(1) in-memory resolution
        const guestUserByEmail = new Map<string, any>((guestUsers as any[]).map((u) => [u.email.toLowerCase(), u]));
        const userById = new Map<string, any>((knownUsers as any[]).map((u) => [u._id.toString(), u]));
        const profileByUserId = new Map<string, any>(creatorProfiles.map((cp) => [cp.userId.toString(), cp]));
        const unreadCountByBooking = new Map<string, number>(unreadCountsAgg.map((u: any) => [u._id.toString(), u.count]));
        const lastMsgByBooking = new Map<string, any>(lastMessagesAgg.map((m: any) => [m._id.toString(), m]));
        const reviewedSet = new Set((myReviews as any[]).map((r) => String(r.bookingId)));

        // Enrich bookings synchronously without ANY additional DB queries
        const enrichBookingSync = (booking: any, isOutgoing: boolean) => {
            const bookingIdStr = booking._id.toString();
            const lastMsgDoc = lastMsgByBooking.get(bookingIdStr);
            const unreadCount = unreadCountByBooking.get(bookingIdStr) || 0;

            let followerName = 'Guest';
            let email = '';
            let avatar = '/avatar.png';
            const isCreatorBooker = isOutgoing;

            if (isOutgoing) {
                const creatorIdStr = booking.creatorId?.toString();
                const otherUser = creatorIdStr ? userById.get(creatorIdStr) : null;
                const otherProfile = creatorIdStr ? profileByUserId.get(creatorIdStr) : null;
                followerName = otherProfile?.displayName || otherUser?.name || 'Creator';
                email = otherUser?.email || '';
                avatar = otherProfile?.profilePhoto || otherUser?.profilePhoto || '/avatar.png';
            } else {
                const guestEmail = booking.guestDetails?.email?.toLowerCase();
                const guestUser = guestEmail ? guestUserByEmail.get(guestEmail) : null;

                if (booking.guestDetails?.fullName) {
                    followerName = booking.guestDetails.fullName;
                    email = booking.guestDetails.email || '';
                } else if (booking.userId) {
                    const u = userById.get(booking.userId.toString());
                    if (u) {
                        followerName = u.name || 'Guest';
                        email = u.email || '';
                    }
                }

                if (guestUser) {
                    if (guestUser.profilePhoto) {
                        avatar = guestUser.profilePhoto;
                    } else {
                        const cp = profileByUserId.get(guestUser._id.toString());
                        if (cp?.profilePhoto) avatar = cp.profilePhoto;
                    }
                } else if (booking.userId) {
                    const u = userById.get(booking.userId.toString());
                    if (u) {
                        if (u.profilePhoto) {
                            avatar = u.profilePhoto;
                        } else {
                            const cp = profileByUserId.get(u._id.toString());
                            if (cp?.profilePhoto) avatar = cp.profilePhoto;
                        }
                    }
                }
            }

            const d = new Date(booking.scheduledDate);
            const formattedShortDate = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
            const bookedOn = new Date(booking.createdAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
            const bookingDateTime = new Date(`${booking.scheduledDate.toISOString().split('T')[0]}T${convertTo24Hour(booking.scheduledTime)}+05:00`);
            const now = new Date();

            let displayStatus: string;
            if (booking.status === 'pending') { displayStatus = 'Pending Action'; }
            else if (booking.status === 'confirmed' || booking.status === 'completed') {
                displayStatus = (booking.status === 'confirmed' && bookingDateTime > now) ? 'Upcoming' : 'Past';
            } else {
                displayStatus = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
            }

            return {
                id: booking._id.toString(),
                bookingRef: booking.bookingRef,
                follower: followerName,
                email: email,
                avatar: avatar,
                session: booking.sessionTypeId?.title || 'Session',
                date: `${formattedShortDate} at ${booking.scheduledTime}`,
                shortDate: formattedShortDate,
                time: booking.scheduledTime,
                duration: `${booking.sessionTypeId?.duration || 0} min`,
                amount: pkgLabels.get(bookingIdStr) || `PKR ${booking.finalPrice.toLocaleString()}`,
                status: displayStatus,
                statusRaw: booking.status,
                paymentStatus: booking.paymentStatus,
                paymentMethod: booking.paymentMethod,
                preSessionQuestion: richTextToPlain(booking.guestDetails?.whatToDiscuss) || '',
                reason: '',
                isPaid: booking.paymentStatus === 'paid',
                bookedOn: bookedOn,
                scheduledDate: booking.scheduledDate,
                isRescheduled: booking.isRescheduled || false,
                isPackage: !!booking.packagePurchaseId,
                sessionNumber: booking.sessionNumber,
                rescheduleStatus: booking.rescheduleRequest?.status,
                isLocked: booking.isLocked !== undefined ? booking.isLocked : !lastMsgDoc,
                meetingUrl: booking.meetingUrl,
                meetingStarted: Boolean(booking.meetingStartedAt),
                // Only after the call was explicitly ended (timer / hang-up) — never on book
                meetingEnded: Boolean(booking.meetingEndedAt),
                meetingEndsAt: booking.meetingEndsAt || null,
                hasReviewed: reviewedSet.has(bookingIdStr),
                lastMessage: lastMsgDoc ? lastMsgDoc.content : '',
                lastMessageTime: lastMsgDoc ? lastMsgDoc.createdAt : null,
                unreadCount: unreadCount,
                isCreatorBooker: isCreatorBooker,
            };
        };

        const enrichedIncoming = incomingBookings.map((b) => enrichBookingSync(b, false));
        const enrichedOutgoing = outgoingBookings.map((b) => enrichBookingSync(b, true));

        // Merge and sort by scheduledDate descending
        const allBookings = [...enrichedIncoming, ...enrichedOutgoing].sort((a, b) => {
            return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
        });

        return NextResponse.json({ bookings: allBookings });
    } catch (error: any) {
        console.error('GET /api/creators/bookings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}