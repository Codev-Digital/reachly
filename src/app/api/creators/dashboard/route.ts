import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import Booking from '@/models/Booking';
import SessionType from '@/models/SessionType';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = await CreatorProfile.findOne({ userId: user._id });
    const profileViews = profile?.views || 0;

    // Fetch all bookings for this creator
    const bookings = await Booking.find({ creatorId: user._id })
      .populate({ path: 'sessionTypeId', model: SessionType })
      .populate({ path: 'userId', model: User, select: 'profilePhoto' })
      .sort({ createdAt: -1 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Stats calculations
    const totalBookingsThisMonth = bookings.filter((b) => {
      const created = new Date(b.createdAt);
      return created >= startOfMonth && created <= endOfMonth && b.status !== 'cancelled';
    }).length;

    const upcomingSessions = bookings.filter((b) => {
      const scheduled = new Date(b.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return scheduled >= today && (b.status === 'confirmed' || b.status === 'pending');
    }).length;

    // Unique customers count
    const uniqueCustomerEmails = new Set<string>();
    bookings.forEach((b) => {
      if (b.status !== 'cancelled') {
        if (b.guestDetails?.email) {
          uniqueCustomerEmails.add(b.guestDetails.email.toLowerCase());
        }
      }
    });
    const totalCustomers = uniqueCustomerEmails.size;

    // Format recent bookings list
    const formattedBookings = await Promise.all(bookings.map(async (b) => {
      const scheduledDateStr = new Date(b.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      
      const duration = (b.sessionTypeId as any)?.duration || 30;
      
      let avatarUrl = '/avatar.png'; // Default
      if (b.userId) {
        const u = b.userId as any;
        if (u.profilePhoto) {
          avatarUrl = u.profilePhoto;
        } else {
          const cp = await CreatorProfile.findOne({ userId: u._id });
          if (cp?.profilePhoto) {
            avatarUrl = cp.profilePhoto;
          }
        }
      }
      
      return {
        id: b._id || b.bookingRef,
        name: b.guestDetails?.fullName || 'Guest Client',
        handle: b.guestDetails?.email ? `@${b.guestDetails.email.split('@')[0]}` : '@client',
        avatar: avatarUrl,
        time: `${scheduledDateStr} at ${b.scheduledTime} (${duration} mins)`,
        type: b.paymentMethod || 'Online',
        note: b.guestDetails?.notes || b.guestDetails?.whatToDiscuss || 'No special requirements listed.',
        amount: `${b.finalPrice} PKR`,
        status: b.status,
        scheduledDate: b.scheduledDate,
      };
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalBookingsThisMonth,
        upcomingSessions,
        profileViews,
        totalCustomers,
      },
      bookings: formattedBookings,
    });
  } catch (error: any) {
    console.error('Creator dashboard stats API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
