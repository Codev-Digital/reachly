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

    // Fetch profile and bookings in parallel with .lean()
    const [profile, incomingBookings, outgoingBookings] = (await Promise.all([
      CreatorProfile.findOne({ userId: user._id }).select('views').lean(),
      Booking.find({ creatorId: user._id })
        .populate({ path: 'sessionTypeId', model: SessionType, select: 'duration' })
        .sort({ createdAt: -1 })
        .lean(),
      Booking.find({ userId: user._id, creatorId: { $ne: user._id } })
        .populate({ path: 'sessionTypeId', model: SessionType, select: 'duration' })
        .sort({ createdAt: -1 })
        .lean(),
    ])) as [any, any[], any[]];

    const profileViews = profile?.views || 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Stats calculations (based on incoming bookings only)
    const totalBookings = incomingBookings.filter((b) => b.status !== 'cancelled').length;

    const totalBookingsThisMonth = incomingBookings.filter((b) => {
      const created = new Date(b.createdAt);
      return created >= startOfMonth && created <= endOfMonth && b.status !== 'cancelled';
    }).length;

    const upcomingSessions = incomingBookings.filter((b) => {
      const scheduled = new Date(b.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return scheduled >= today && (b.status === 'confirmed' || b.status === 'pending');
    }).length;

    // Unique customers count (incoming only)
    const uniqueCustomerEmails = new Set<string>();
    incomingBookings.forEach((b) => {
      if (b.status !== 'cancelled') {
        if (b.guestDetails?.email) {
          uniqueCustomerEmails.add(b.guestDetails.email.toLowerCase());
        }
      }
    });
    const totalCustomers = uniqueCustomerEmails.size;

    // Extract all guest emails, form-filler user IDs, and other creator IDs in parallel
    const guestEmails = Array.from(new Set(
      incomingBookings.map((b) => b.guestDetails?.email?.toLowerCase()).filter(Boolean)
    )) as string[];

    const formFillerUserIds = Array.from(new Set(
      incomingBookings.map((b) => b.userId?.toString()).filter(Boolean)
    )) as string[];

    const otherCreatorIds = Array.from(new Set(
      outgoingBookings.map((b) => b.creatorId?.toString()).filter(Boolean)
    ));

    // Batch fetch all participant users and other creator data concurrently
    const [guestUsers, formFillerUsers, otherCreatorUsers, otherCreatorProfiles] = (await Promise.all([
      guestEmails.length > 0
        ? User.find({ email: { $in: guestEmails } }).select('_id email profilePhoto').lean()
        : Promise.resolve([]),
      formFillerUserIds.length > 0
        ? User.find({ _id: { $in: formFillerUserIds } }).select('_id profilePhoto').lean()
        : Promise.resolve([]),
      otherCreatorIds.length > 0
        ? User.find({ _id: { $in: otherCreatorIds } }).select('_id name email profilePhoto').lean()
        : Promise.resolve([]),
      otherCreatorIds.length > 0
        ? CreatorProfile.find({ userId: { $in: otherCreatorIds } }).select('userId displayName profilePhoto').lean()
        : Promise.resolve([])
    ])) as [any[], any[], any[], any[]];

    const guestUsersMap = new Map<string, any>((guestUsers as any[]).map((u) => [u.email.toLowerCase(), u]));
    const formFillersMap = new Map<string, any>((formFillerUsers as any[]).map((u) => [u._id.toString(), u]));
    const otherCreatorUsersMap = new Map<string, any>((otherCreatorUsers as any[]).map((u) => [u._id.toString(), u]));
    const otherCreatorProfilesMap = new Map<string, any>((otherCreatorProfiles as any[]).map((cp) => [cp.userId.toString(), cp]));

    // Collect all user IDs we might check CreatorProfiles for
    const allUserIdsToCheck = Array.from(new Set([
      ...(guestUsers as any[]).map((u) => u._id.toString()),
      ...formFillerUserIds
    ]));

    const cpDocs = allUserIdsToCheck.length > 0
      ? await CreatorProfile.find({ userId: { $in: allUserIdsToCheck } }).select('userId profilePhoto').lean() as any[]
      : [];
    const cpMap = new Map<string, string>(cpDocs.map((cp) => [cp.userId.toString(), cp.profilePhoto]));

    // Format incoming bookings
    const formattedIncoming = incomingBookings.map((b) => {
      const scheduledDateStr = new Date(b.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      });
      const duration = (b.sessionTypeId as any)?.duration || 30;
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
        isCreatorBooker: false,
      };
    });

    const formattedOutgoing = outgoingBookings.map((b) => {
      const scheduledDateStr = new Date(b.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      });
      const duration = (b.sessionTypeId as any)?.duration || 30;
      const creatorIdStr = b.creatorId?.toString();
      const otherUser = otherCreatorUsersMap.get(creatorIdStr || '');
      const otherProfile = otherCreatorProfilesMap.get(creatorIdStr || '');
      const name = otherProfile?.displayName || otherUser?.name || 'Creator';
      const handle = otherUser?.email || '@creator';
      const avatarUrl = otherProfile?.profilePhoto || otherUser?.profilePhoto || '/avatar.png';
      return {
        id: b._id || b.bookingRef,
        name,
        handle,
        avatar: avatarUrl,
        time: `${scheduledDateStr} at ${b.scheduledTime} (${duration} mins)`,
        type: b.paymentMethod || 'Online',
        note: b.guestDetails?.whatToDiscuss || 'No special requirements listed.',
        amount: `${b.finalPrice} PKR`,
        status: b.status,
        scheduledDate: b.scheduledDate,
        meetingUrl: b.meetingUrl,
        bookingRef: b.bookingRef,
        isCreatorBooker: true,
      };
    });

    // Merge and sort combined list by scheduledDate descending
    const allBookings = [...formattedIncoming, ...formattedOutgoing].sort((a, b) =>
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalBookings,
        totalBookingsThisMonth,
        upcomingSessions,
        profileViews,
        totalCustomers,
      },
      bookings: allBookings,
    });
  } catch (error: any) {
    console.error('Creator dashboard stats API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

