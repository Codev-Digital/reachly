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
      .sort({ createdAt: -1 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Stats calculations
    const totalBookings = bookings.filter((b) => b.status !== 'cancelled').length;

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

    // Extract all guest emails and form-filler user IDs to fetch photos
    const guestEmails = Array.from(new Set(
      bookings.map((b) => b.guestDetails?.email?.toLowerCase()).filter(Boolean)
    )) as string[];

    const formFillerUserIds = Array.from(new Set(
      bookings.map((b) => b.userId?.toString()).filter(Boolean)
    )) as string[];

    // Fetch users registered with the guest emails
    const guestUsers = guestEmails.length > 0
      ? await User.find({ email: { $in: guestEmails } }).select('email profilePhoto').lean() as any[]
      : [];
    const guestUsersMap = new Map<string, any>(guestUsers.map((u) => [u.email.toLowerCase(), u]));

    // Fetch users who filled the form (fallback)
    const formFillerUsers = formFillerUserIds.length > 0
      ? await User.find({ _id: { $in: formFillerUserIds } }).select('profilePhoto').lean() as any[]
      : [];
    const formFillersMap = new Map<string, any>(formFillerUsers.map((u) => [u._id.toString(), u]));

    // Collect all user IDs we might check CreatorProfiles for
    const allUserIdsToCheck = Array.from(new Set([
      ...guestUsers.map((u) => u._id.toString()),
      ...formFillerUserIds
    ]));

    const cpDocs = allUserIdsToCheck.length > 0
      ? await CreatorProfile.find({ userId: { $in: allUserIdsToCheck } }).select('userId profilePhoto').lean() as any[]
      : [];
    const cpMap = new Map<string, string>(cpDocs.map((cp) => [cp.userId.toString(), cp.profilePhoto]));

    // Format recent bookings list
    const formattedBookings = bookings.map((b) => {
      const scheduledDateStr = new Date(b.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      
      const duration = (b.sessionTypeId as any)?.duration || 30;
      
      // Determine avatar photo
      let avatarUrl = '/avatar.png';
      const guestEmail = b.guestDetails?.email?.toLowerCase();
      
      if (guestEmail && guestUsersMap.has(guestEmail)) {
        const guestUserObj = guestUsersMap.get(guestEmail);
        avatarUrl = guestUserObj.profilePhoto || cpMap.get(guestUserObj._id.toString()) || '/avatar.png';
      } else if (b.userId) {
        const fillerUserObj = formFillersMap.get(b.userId.toString());
        if (fillerUserObj) {
          avatarUrl = fillerUserObj.profilePhoto || cpMap.get(b.userId.toString()) || '/avatar.png';
        }
      }
      
      return {
        id: b._id || b.bookingRef,
        name: b.guestDetails?.fullName || 'Guest Client',
        handle: b.guestDetails?.email || '@client',
        avatar: avatarUrl,
        time: `${scheduledDateStr} at ${b.scheduledTime} (${duration} mins)`,
        type: b.paymentMethod || 'Online',
        note: b.guestDetails?.notes || b.guestDetails?.whatToDiscuss || 'No special requirements listed.',
        amount: `${b.finalPrice} PKR`,
        status: b.status,
        scheduledDate: b.scheduledDate,
        meetingUrl: b.meetingUrl,
        bookingRef: b.bookingRef,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalBookings,
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
