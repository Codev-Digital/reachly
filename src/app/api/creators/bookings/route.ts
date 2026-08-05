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
        const query: any = { creatorId: user._id };
        if (dateParam) {
            const targetDate = new Date(dateParam);
            const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));
            query.scheduledDate = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        // Get all bookings for this creator matching query
        console.log('Querying bookings with:', query);
        const bookings = await Booking.find(query)
            .sort({ scheduledDate: -1, createdAt: -1 })
            .populate({
                path: 'sessionTypeId',
                model: SessionType,
                select: 'title duration features'
            })
            .lean();
        console.log('Found', bookings.length, 'bookings');

        // Enrich with user/guest info and last message
        const enrichedBookings = await Promise.all(
            bookings.map(async (booking: any) => {
                // Get last message and unread count
                const [lastMsgDoc, unreadCount] = await Promise.all([
                    Message.findOne({ bookingId: booking._id })
                        .sort({ createdAt: -1 })
                        .lean(),
                    Message.countDocuments({
                        bookingId: booking._id,
                        senderRole: 'user',
                        read: false
                    })
                ]);
                
                // Prioritize guest details for name/email
                let followerName = 'Guest';
                let email = '';
                if (booking.guestDetails?.fullName) {
                    followerName = booking.guestDetails.fullName;
                    email = booking.guestDetails.email || '';
                } else if (booking.userId) {
                    const u = await User.findById(booking.userId).lean() as any;
                    if (u) {
                        followerName = u.name || 'Guest';
                        email = u.email || '';
                    }
                }

                // Determine avatar: lookup registered user by guest email first
                let avatar = '/avatar.png';
                const guestEmail = booking.guestDetails?.email?.toLowerCase();
                
                if (guestEmail) {
                    const guestUser = await User.findOne({ email: guestEmail }).lean() as any;
                    if (guestUser) {
                        if (guestUser.profilePhoto) {
                            avatar = guestUser.profilePhoto;
                        } else {
                            const cp = await CreatorProfile.findOne({ userId: guestUser._id }).lean() as any;
                            if (cp?.profilePhoto) {
                                avatar = cp.profilePhoto;
                            }
                        }
                    }
                }
                
                // Fallback to form-filler user avatar if guest lookup yielded nothing
                if (avatar === '/avatar.png' && booking.userId) {
                    const u = await User.findById(booking.userId).lean() as any;
                    if (u) {
                        if (u.profilePhoto) {
                            avatar = u.profilePhoto;
                        } else {
                            const cp = await CreatorProfile.findOne({ userId: u._id }).lean() as any;
                            if (cp?.profilePhoto) {
                                avatar = cp.profilePhoto;
                            }
                        }
                    }
                }

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

                const bookingDateTime = new Date(`${booking.scheduledDate.toISOString().split('T')[0]}T${convertTo24Hour(booking.scheduledTime)}+05:00`);
                const now = new Date();

                let displayStatus: string;
                if (booking.status === 'pending') {
                    displayStatus = 'Pending Action';
                } else if (booking.status === 'confirmed' || booking.status === 'completed') {
                    if (booking.status === 'confirmed' && bookingDateTime > now) {
                        displayStatus = 'Upcoming';
                    } else {
                        displayStatus = 'Past';
                    }
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
                    lastMessage: lastMsgDoc ? lastMsgDoc.content : "",
                    lastMessageTime: lastMsgDoc ? lastMsgDoc.createdAt : null,
                    unreadCount: unreadCount,
                };
            })
        );

        return NextResponse.json({ bookings: enrichedBookings });
    } catch (error: any) {
        console.error('GET /api/creators/bookings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}