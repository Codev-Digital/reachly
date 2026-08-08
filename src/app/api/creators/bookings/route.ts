import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import Message from '@/models/Message';

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

        const user = await User.findOne({ email: session.user.email });
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

        // ── 1. Incoming bookings: this creator is the host ──────────────────
        const incomingQuery: any = { creatorId: user._id, ...dateFilter };
        console.log('Querying incoming bookings with:', incomingQuery);
        const incomingBookings = await Booking.find(incomingQuery)
            .sort({ scheduledDate: -1, createdAt: -1 })
            .populate({ path: 'sessionTypeId', model: SessionType, select: 'title duration features' })
            .lean();
        console.log('Found', incomingBookings.length, 'incoming bookings');

        // ── 2. Outgoing bookings: this creator booked another creator ───────
        const outgoingQuery: any = { userId: user._id, creatorId: { $ne: user._id }, ...dateFilter };
        const outgoingBookings = await Booking.find(outgoingQuery)
            .sort({ scheduledDate: -1, createdAt: -1 })
            .populate({ path: 'sessionTypeId', model: SessionType, select: 'title duration features' })
            .lean();
        console.log('Found', outgoingBookings.length, 'outgoing bookings');

        // Helper to enrich a single booking
        async function enrichBooking(booking: any, isOutgoing: boolean) {
            // Get last message and unread count
            const [lastMsgDoc, unreadCount] = await Promise.all([
                Message.findOne({ bookingId: booking._id }).sort({ createdAt: -1 }).lean(),
                Message.countDocuments({ bookingId: booking._id, senderRole: 'user', read: false })
            ]);

            let followerName = 'Guest';
            let email = '';
            let isCreatorBooker = isOutgoing; // outgoing bookings are always creator-booker cards

            if (isOutgoing) {
                // For outgoing bookings, show the OTHER creator's info (the one being booked)
                const otherCreatorUser = await User.findById(booking.creatorId).lean() as any;
                const otherCreatorProfile = await CreatorProfile.findOne({ userId: booking.creatorId }).lean() as any;
                followerName = otherCreatorProfile?.displayName || otherCreatorUser?.name || 'Creator';
                email = otherCreatorUser?.email || '';
            } else {
                // Incoming: show the booker's info
                if (booking.guestDetails?.fullName) {
                    followerName = booking.guestDetails.fullName;
                    email = booking.guestDetails.email || '';
                } else if (booking.userId) {
                    const u = await User.findById(booking.userId).lean() as any;
                    if (u) { followerName = u.name || 'Guest'; email = u.email || ''; }
                }

                // Check if the booker (userId) is also a creator
                if (booking.userId) {
                    const bookerCp = await CreatorProfile.findOne({ userId: booking.userId }).lean() as any;
                    if (bookerCp) isCreatorBooker = true;
                }
            }

            // Determine avatar
            let avatar = '/avatar.png';
            if (isOutgoing) {
                const otherCp = await CreatorProfile.findOne({ userId: booking.creatorId }).lean() as any;
                avatar = otherCp?.profilePhoto || (await User.findById(booking.creatorId).lean() as any)?.profilePhoto || '/avatar.png';
            } else {
                const guestEmail = booking.guestDetails?.email?.toLowerCase();
                if (guestEmail) {
                    const guestUser = await User.findOne({ email: guestEmail }).lean() as any;
                    if (guestUser) {
                        if (guestUser.profilePhoto) { avatar = guestUser.profilePhoto; }
                        else {
                            const cp = await CreatorProfile.findOne({ userId: guestUser._id }).lean() as any;
                            if (cp?.profilePhoto) avatar = cp.profilePhoto;
                        }
                    }
                }
                if (avatar === '/avatar.png' && booking.userId) {
                    const u = await User.findById(booking.userId).lean() as any;
                    if (u) {
                        if (u.profilePhoto) { avatar = u.profilePhoto; }
                        else {
                            const cp = await CreatorProfile.findOne({ userId: u._id }).lean() as any;
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
                amount: `PKR ${booking.finalPrice.toLocaleString()}`,
                status: displayStatus,
                statusRaw: booking.status,
                paymentStatus: booking.paymentStatus,
                paymentMethod: booking.paymentMethod,
                preSessionQuestion: booking.guestDetails?.whatToDiscuss || '',
                reason: '',
                isPaid: booking.paymentStatus === 'paid',
                bookedOn: bookedOn,
                scheduledDate: booking.scheduledDate,
                isRescheduled: booking.isRescheduled || false,
                isLocked: booking.isLocked !== undefined ? booking.isLocked : !lastMsgDoc,
                meetingUrl: booking.meetingUrl,
                lastMessage: lastMsgDoc ? (lastMsgDoc as any).content : '',
                lastMessageTime: lastMsgDoc ? (lastMsgDoc as any).createdAt : null,
                unreadCount: unreadCount,
                isCreatorBooker: isCreatorBooker,
            };
        }

        const enrichedIncoming = await Promise.all(incomingBookings.map((b) => enrichBooking(b, false)));
        const enrichedOutgoing = await Promise.all(outgoingBookings.map((b) => enrichBooking(b, true)));

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