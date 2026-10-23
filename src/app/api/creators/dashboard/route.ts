import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import Booking from '@/models/Booking';
import SessionType from '@/models/SessionType';
import Review from '@/models/Review';
import { richTextToPlain } from '@/lib/richText';

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

    /** YYYY-MM-DD from noon-UTC scheduledDate (avoids local timezone day-shift). */
    const toScheduledDateIso = (value: string | Date | undefined | null) => {
      if (!value) return '';
      const d = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(d.getTime())) return '';
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const allBookingIds = [...incomingBookings, ...outgoingBookings]
      .map((b) => b._id)
      .filter(Boolean);
    const myReviews =
      allBookingIds.length > 0
        ? await Review.find({
            bookingId: { $in: allBookingIds },
            reviewerId: user._id,
          })
            .select('bookingId')
            .lean()
        : [];
    const reviewedSet = new Set((myReviews as any[]).map((r) => String(r.bookingId)));

    // Format incoming bookings
    const formattedIncoming = incomingBookings.map((b) => {
      const scheduledDateIso = toScheduledDateIso(b.scheduledDate);
      const scheduledDateStr = new Date(b.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
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
        note:
          b.guestDetails?.notes ||
          richTextToPlain(b.guestDetails?.whatToDiscuss) ||
          'No special requirements listed.',
        amount: `${b.finalPrice} PKR`,
        status: b.status,
        scheduledDate: b.scheduledDate,
        scheduledDateIso,
        scheduledTime: b.scheduledTime || '',
        durationMins: duration,
        createdAt: b.createdAt || null,
        meetingUrl: b.meetingUrl,
        meetingStarted: Boolean(b.meetingStartedAt),
        meetingEnded: Boolean(b.meetingEndedAt),
        meetingEndsAt: b.meetingEndsAt || null,
        hasReviewed: reviewedSet.has(String(b._id)),
        bookingRef: b.bookingRef,
        isCreatorBooker: false,
      };
    });

    const formattedOutgoing = outgoingBookings.map((b) => {
      const scheduledDateIso = toScheduledDateIso(b.scheduledDate);
      const scheduledDateStr = new Date(b.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
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
        note:
          richTextToPlain(b.guestDetails?.whatToDiscuss) ||
          'No special requirements listed.',
        amount: `${b.finalPrice} PKR`,
        status: b.status,
        scheduledDate: b.scheduledDate,
        scheduledDateIso,
        scheduledTime: b.scheduledTime || '',
        durationMins: duration,
        createdAt: b.createdAt || null,
        meetingUrl: b.meetingUrl,
        meetingStarted: Boolean(b.meetingStartedAt),
        meetingEnded: Boolean(b.meetingEndedAt),
        meetingEndsAt: b.meetingEndsAt || null,
        hasReviewed: reviewedSet.has(String(b._id)),
        bookingRef: b.bookingRef,
        isCreatorBooker: true,
      };
    });

    // Nearest upcoming first; within the same day prefer newest bookings
    const allBookings = [...formattedIncoming, ...formattedOutgoing].sort((a, b) => {
      const dateDiff =
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      if (dateDiff !== 0) return dateDiff;
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createdB - createdA;
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
      bookings: allBookings,
    });
  } catch (error: any) {
    console.error('Creator dashboard stats API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

