import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';

// Helper to safely convert 12h to 24h for comparison
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

        // Get all bookings for this creator
        console.log('Querying bookings for creatorId:', user._id);
        const bookings = await Booking.find({ creatorId: user._id })
            .sort({ scheduledDate: -1, createdAt: -1 })
            .populate({
                path: 'sessionTypeId',
                model: SessionType,
                select: 'title duration features'
            })
            .lean();
        console.log('Found', bookings.length, 'bookings');

        // Enrich with user/guest info
        const enrichedBookings = await Promise.all(
            bookings.map(async (booking: any) => {
                let userInfo: any = null;
                let avatar = '/avatar.png'; // Default
                if (booking.userId) {
                    const user = await User.findById(booking.userId);
                    if (user) {
                        userInfo = {
                            name: user.name,
                            email: user.email
                        };
                        
                        // Check if user has profilePhoto on User model first
                        if (user.profilePhoto) {
                            avatar = user.profilePhoto;
                        } else {
                            // Check if user has CreatorProfile for avatar
                            const creatorProfile = await CreatorProfile.findOne({ userId: user._id });
                            if (creatorProfile?.profilePhoto) {
                                avatar = creatorProfile.profilePhoto;
                            }
                        }
                    }
                } else if (booking.guestDetails) {
                    userInfo = booking.guestDetails;
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
                    follower: userInfo?.fullName || userInfo?.name || 'Guest',
                    email: userInfo?.email,
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
                };
            })
        );

        return NextResponse.json({ bookings: enrichedBookings });
    } catch (error: any) {
        console.error('GET /api/creators/bookings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}