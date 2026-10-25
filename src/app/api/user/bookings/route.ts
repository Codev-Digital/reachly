import { NextRequest, NextResponse } from 'next/server';
import { packageInfo } from '@/lib/packageLabels';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import EventPurchase from '@/models/EventPurchase';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import Message from '@/models/Message';
import Review from '@/models/Review';
import { verifyToken } from '@/lib/jwt';
import { fromISODate } from '@/lib/eventTicketing';

export async function GET(request: NextRequest) {
    try {
        let email: string | undefined;

        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
            email = session.user.email;
        } else {
            const token = request.cookies.get('auth_token')?.value;
            const payload = token ? verifyToken(token) : null;
            email = payload?.email;
        }

        const { searchParams } = new URL(request.url);
        const guestEmail = searchParams.get('guestEmail');

        if (!email && !guestEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        let bookingsQuery = {};
        let userId: any = null;

        if (email) {
            const user = await User.findOne({ email }).select('_id').lean() as any;
            if (user) {
                userId = user._id;
                bookingsQuery = { userId: user._id };
            } else if (guestEmail) {
                bookingsQuery = { 'guestDetails.email': guestEmail };
            } else {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
        } else if (guestEmail) {
            bookingsQuery = { 'guestDetails.email': guestEmail };
        }

        // Find all matching bookings
        const bookings = await Booking.find(bookingsQuery)
            .sort({ scheduledDate: -1, createdAt: -1 })
            .populate({
                path: 'sessionTypeId',
                model: SessionType,
                select: 'title duration features'
            })
            .lean();

        const allBookingIds = bookings.map((b: any) => b._id);
        const creatorIds = Array.from(new Set(bookings.map((b: any) => b.creatorId?.toString()).filter(Boolean)));

        // Batch fetch CreatorProfiles, unread counts, last messages, and my reviews
        const [
            creatorProfiles,
            unreadCountsAgg,
            lastMessagesAgg,
            myReviews,
        ] = await Promise.all([
            creatorIds.length > 0 
                ? CreatorProfile.find({ userId: { $in: creatorIds } }).lean()
                : [],
            allBookingIds.length > 0
                ? Message.aggregate([
                    { $match: { bookingId: { $in: allBookingIds }, senderRole: 'creator', read: false } },
                    { $group: { _id: '$bookingId', count: { $sum: 1 } } }
                ])
                : [],
            allBookingIds.length > 0
                ? Message.aggregate([
                    { $match: { bookingId: { $in: allBookingIds } } },
                    { $sort: { createdAt: -1 } },
                    { $group: {
                        _id: '$bookingId',
                        content: { $first: '$content' },
                        createdAt: { $first: '$createdAt' }
                    } }
                ])
                : [],
            userId && allBookingIds.length > 0
                ? Review.find({
                    bookingId: { $in: allBookingIds },
                    reviewerId: userId,
                  })
                    .select('bookingId')
                    .lean()
                : Promise.resolve([]),
        ]);

        const { labels: pkgLabels, paid: pkgPaid } = await packageInfo(bookings);
        const profileMap = new Map(creatorProfiles.map((cp: any) => [cp.userId.toString(), cp]));
        const unreadMap = new Map(unreadCountsAgg.map((item: any) => [item._id.toString(), item.count]));
        const lastMsgMap = new Map(lastMessagesAgg.map((item: any) => [item._id.toString(), item]));
        const reviewedSet = new Set(
            (myReviews as any[]).map((r) => String(r.bookingId))
        );

        const now = new Date();

        const enrichedBookings = bookings.map((booking: any) => {
            const bIdStr = booking._id.toString();
            const creatorProfile = profileMap.get(booking.creatorId?.toString());
            const lastMsgDoc = lastMsgMap.get(bIdStr);
            const unreadCount = unreadMap.get(bIdStr) || 0;

            const d = new Date(booking.scheduledDate);
            const formattedShortDate = d.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const bookedOn = new Date(booking.createdAt).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            // Determine relative status:
            let displayStatus = booking.status;
            if (booking.scheduledDate) {
                const [bYear, bMonth, bDay] = booking.scheduledDate.toISOString().split('T')[0].split('-');
                const time24 = convertTo24Hour(booking.scheduledTime);
                const bookingDateTimePKT = new Date(`${bYear}-${bMonth}-${bDay}T${time24}+05:00`);

                if (booking.status === 'pending') {
                    displayStatus = 'Pending Approval';
                } else if (booking.status === 'confirmed') {
                    if (bookingDateTimePKT > now) {
                        displayStatus = 'Upcoming';
                    } else {
                        displayStatus = 'Past';
                    }
                } else {
                    displayStatus = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
                }
            }

            return {
                id: bIdStr,
                kind: 'session' as const,
                isEvent: false,
                creator: creatorProfile?.displayName || 'Unknown Creator',
                username: creatorProfile?.username || '',
                session: booking.sessionTypeId?.title || 'Session',
                sessionType: booking.sessionTypeId?.title || 'Session',
                sessionTypeId:
                  booking.sessionTypeId?._id?.toString?.() ||
                  (typeof booking.sessionTypeId === 'string' ? booking.sessionTypeId : null),
                date: `${formattedShortDate} at ${booking.scheduledTime}`,
                shortDate: formattedShortDate,
                time: booking.scheduledTime,
                status: displayStatus,
                image: creatorProfile?.profilePhoto || '/ahad raza mir.png',
                tags: [displayStatus],
                ref: `RCH-${bIdStr.slice(-8).toUpperCase()}`,
                duration: `${booking.sessionTypeId?.duration || 0} minutes`,
                durationMins: Number(booking.sessionTypeId?.duration) || 15,
                price: pkgLabels.get(bIdStr) || `PKR ${booking.finalPrice}`,
                paymentAmount: pkgPaid.has(bIdStr) ? pkgPaid.get(bIdStr) : booking.finalPrice,
                paymentMethod: booking.paymentMethod || 'Guest',
                transactionId: `${bIdStr.slice(0, 8).toUpperCase()}`,
                bookedOn: bookedOn,
                originalStatus: booking.status,
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
                hasReviewed: reviewedSet.has(bIdStr),
                bookingRef: booking.bookingRef,
                lastMessage: lastMsgDoc ? lastMsgDoc.content : "",
                lastMessageTime: lastMsgDoc ? lastMsgDoc.createdAt : null,
                unreadCount: unreadCount,
                eventId: null,
                tierTitle: null,
            };
        });

        // Event ticket purchases (same list as session bookings)
        let eventItems: any[] = [];
        try {
            const purchaseQuery: Record<string, unknown> = {};
            if (userId && email) {
                purchaseQuery.$or = [
                    { userId },
                    { buyerEmail: email.toLowerCase() },
                ];
            } else if (userId) {
                purchaseQuery.userId = userId;
            } else if (email) {
                purchaseQuery.buyerEmail = email.toLowerCase();
            }

            if (Object.keys(purchaseQuery).length > 0) {
                const purchases = await EventPurchase.find(purchaseQuery)
                    .sort({ createdAt: -1 })
                    .lean();

                const eventCreatorIds = Array.from(
                    new Set(purchases.map((p: any) => p.creatorId?.toString()).filter(Boolean))
                );
                const missingCreatorIds = eventCreatorIds.filter((cid) => !profileMap.has(cid));
                if (missingCreatorIds.length > 0) {
                    const extraProfiles = await CreatorProfile.find({
                        userId: { $in: missingCreatorIds },
                    }).lean();
                    for (const cp of extraProfiles as any[]) {
                        profileMap.set(cp.userId.toString(), cp);
                    }
                }

                eventItems = purchases.map((p: any) => {
                    const pId = String(p._id);
                    const creatorProfile = profileMap.get(p.creatorId?.toString());
                    const eventDateStr = String(p.eventDate || '').slice(0, 10);
                    const d = /^\d{4}-\d{2}-\d{2}$/.test(eventDateStr)
                        ? fromISODate(eventDateStr)
                        : new Date(p.createdAt);
                    const formattedShortDate = d.toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    });
                    const timeLabel = p.eventEndTime
                        ? `${p.eventStartTime} - ${p.eventEndTime}`
                        : p.eventStartTime || 'Time TBA';

                    const dayEnd = new Date(d);
                    dayEnd.setHours(23, 59, 59, 999);
                    let displayStatus = 'Upcoming';
                    if (p.status === 'cancelled') displayStatus = 'Cancelled';
                    else if (p.status === 'completed' || dayEnd.getTime() < now.getTime()) {
                        displayStatus = 'Past';
                    }

                    const bookedOn = new Date(p.createdAt).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    });

                    return {
                        id: pId,
                        kind: 'event' as const,
                        isEvent: true,
                        creator: creatorProfile?.displayName || 'Unknown Creator',
                        username: creatorProfile?.username || '',
                        session: p.eventTitle || 'Event',
                        sessionType: p.eventTitle || 'Event',
                        date: `${formattedShortDate} at ${timeLabel}`,
                        shortDate: formattedShortDate,
                        time: p.eventStartTime || '12:00 AM',
                        status: displayStatus,
                        image: creatorProfile?.profilePhoto || p.eventBannerUrl || '/avatar.png',
                        tags: [displayStatus, 'Event'],
                        ref: p.ticketRef,
                        duration: '',
                        price: `PKR ${(Number(p.tierPrice) || 0).toLocaleString('en-US')}`,
                        paymentAmount: Number(p.tierPrice) || 0,
                        paymentMethod: 'Event',
                        transactionId: p.ticketRef,
                        bookedOn,
                        // Keep confirmed so Cancelled-tab filter (originalStatus === cancelled) works
                        originalStatus: p.status === 'cancelled' ? 'cancelled' : 'confirmed',
                        // YYYY-MM-DD — avoids UTC day-shift bugs in isMeetingPassed
                        scheduledDate: eventDateStr || undefined,
                        isRescheduled: false,
                        isPackage: false,
                        sessionNumber: undefined,
                        rescheduleStatus: undefined,
                        isLocked: true,
                        meetingUrl: undefined,
                        bookingRef: p.ticketRef,
                        lastMessage: '',
                        lastMessageTime: null,
                        unreadCount: 0,
                        eventId: String(p.eventId),
                        tierTitle: p.tierTitle,
                        bio: `${p.tierTitle || 'Ticket'}${p.category ? ` · ${p.category}` : ''}`,
                        preSessionQuestion: p.eventTitle || 'Event ticket',
                    };
                });
            }
        } catch (eventErr) {
            console.error('[GET /api/user/bookings] event purchases failed:', eventErr);
        }

        const merged = [...enrichedBookings, ...eventItems].sort((a, b) => {
            const da = new Date(a.scheduledDate || 0).getTime();
            const db = new Date(b.scheduledDate || 0).getTime();
            return db - da;
        });

        return NextResponse.json({ bookings: merged });
    } catch (error: any) {
        console.error('GET /api/user/bookings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// helper to safely convert 12h to 24h for comparison
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
