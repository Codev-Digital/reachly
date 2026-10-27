import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';

type RouteContext = { params: Promise<{ id: string }> };

async function resolveUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const email = session.user.email?.toLowerCase().trim();
  let user = null;
  if (email) user = await User.findOne({ email });
  if (!user && (session.user as any).id) {
    user = await User.findById((session.user as any).id).exec();
  }
  return { user, email, session };
}

async function findOwnedBooking(id: string, user: any, email?: string | null) {
  let booking = null;
  if (mongoose.isValidObjectId(id)) {
    booking = await Booking.findById(id).exec();
  }
  if (!booking) {
    booking = await Booking.findOne({ bookingRef: id }).exec();
  }
  if (!booking) return { booking: null, forbidden: false };

  const isCreator = booking.creatorId?.toString() === user._id.toString();
  const isUser =
    booking.userId?.toString() === user._id.toString() ||
    booking.guestDetails?.email?.toLowerCase().trim() === email;
  if (!isCreator && !isUser) return { booking: null, forbidden: true };
  return { booking, forbidden: false, isCreator };
}

async function meetingPayload(booking: any) {
  let creatorName = 'Your creator';
  try {
    const profile = await CreatorProfile.findOne({ userId: booking.creatorId })
      .select('displayName')
      .lean();
    if (profile?.displayName) creatorName = profile.displayName;
    else {
      const creator = await User.findById(booking.creatorId).select('name').lean();
      if (creator?.name) creatorName = creator.name;
    }
  } catch {
    /* keep fallback */
  }

  const sessionType = await SessionType.findById(booking.sessionTypeId)
    .select('duration bufferTime')
    .lean();
  const durationMins = Math.max(1, Number((sessionType as any)?.duration) || 15);
  const bufferMins = Math.max(0, Number((sessionType as any)?.bufferTime) || 0);
  const totalMeetingMins = durationMins + bufferMins;

  const meetingStarted = Boolean(booking.meetingStartedAt);

  // Timer end exists only after creator pressed Join (meetingStartedAt set)
  let meetingEndsAt: Date | string | null = null;
  if (meetingStarted) {
    meetingEndsAt = booking.meetingEndsAt || null;
    if (!meetingEndsAt && booking.meetingStartedAt) {
      meetingEndsAt = new Date(
        new Date(booking.meetingStartedAt).getTime() + totalMeetingMins * 60 * 1000
      );
    }
  }

  // Live call status: ended when hang-up/timer wrote meetingEndedAt, or timer hit 0
  const endsAtMs = meetingEndsAt ? new Date(meetingEndsAt).getTime() : null;
  const meetingEnded =
    Boolean(booking.meetingEndedAt) ||
    (meetingStarted && endsAtMs != null && endsAtMs <= Date.now());

  const remainingMs =
    endsAtMs != null ? Math.max(0, endsAtMs - Date.now()) : null;

  return {
    success: true,
    meetingStarted,
    meetingStartedAt: booking.meetingStartedAt || null,
    meetingEndsAt,
    meetingEndedAt: booking.meetingEndedAt || null,
    meetingEnded,
    remainingMs,
    durationMins,
    bufferMins,
    totalMeetingMins,
    meetingUrl: booking.meetingUrl || null,
    bookingRef: booking.bookingRef,
    creatorName,
    status: booking.status,
  };
}

/**
 * GET — meeting join / timer status for booking owner or creator.
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const auth = await resolveUser();
    if (!auth?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await context.params;
    const { booking, forbidden } = await findOwnedBooking(id, auth.user, auth.email);
    if (forbidden) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.status === 'pending' || booking.paymentStatus === 'pending') {
      return NextResponse.json({ error: 'Meeting is unavailable while booking is pending admin verification.' }, { status: 400 });
    }

    // Auto-complete if timer already expired (persist endsAt if missing)
    if (!booking.meetingEndedAt && booking.meetingStartedAt) {
      const sessionType = await SessionType.findById(booking.sessionTypeId)
        .select('duration bufferTime')
        .lean();
      const durationMins = Math.max(1, Number((sessionType as any)?.duration) || 15);
      const bufferMins = Math.max(0, Number((sessionType as any)?.bufferTime) || 0);
      const endsAt = booking.meetingEndsAt
        ? new Date(booking.meetingEndsAt)
        : new Date(
            new Date(booking.meetingStartedAt).getTime() +
              (durationMins + bufferMins) * 60 * 1000
          );
      if (endsAt.getTime() <= Date.now()) {
        if (!booking.meetingEndsAt) booking.meetingEndsAt = endsAt;
        booking.meetingEndedAt = new Date();
        if (booking.status === 'confirmed' || booking.status === 'pending') {
          booking.status = 'completed';
        }
        await booking.save();
      }
    }

    return NextResponse.json(await meetingPayload(booking));
  } catch (err) {
    console.error('[GET /api/user/bookings/:id/meeting]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST — end the meeting (timer expiry or creator hang-up).
 * Body: { action: 'end' }
 * Creator end disconnects everyone; timer end works from either side.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const auth = await resolveUser();
    if (!auth?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await context.params;
    const { booking, forbidden, isCreator } = await findOwnedBooking(
      id,
      auth.user,
      auth.email
    );
    if (forbidden) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    if (body?.action !== 'end') {
      return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
    }

    const now = Date.now();
    const storedEndsAt = booking.meetingEndsAt
      ? new Date(booking.meetingEndsAt)
      : null;
    let timerExpired = storedEndsAt != null && storedEndsAt.getTime() <= now;

    // Fallback if endsAt was never persisted but session already started
    if (!timerExpired && booking.meetingStartedAt) {
      const sessionType = await SessionType.findById(booking.sessionTypeId)
        .select('duration bufferTime')
        .lean();
      const durationMins = Math.max(1, Number((sessionType as any)?.duration) || 15);
      const bufferMins = Math.max(0, Number((sessionType as any)?.bufferTime) || 0);
      const startedAt = new Date(booking.meetingStartedAt);
      const endsAt =
        storedEndsAt ??
        new Date(startedAt.getTime() + (durationMins + bufferMins) * 60 * 1000);
      timerExpired = endsAt.getTime() <= now;
      if (timerExpired && !booking.meetingEndsAt) {
        booking.meetingEndsAt = endsAt;
      }
    }

    // Only creator (or expired timer) can force-end for everyone
    if (!isCreator && !timerExpired && !booking.meetingEndedAt) {
      // User leaving early does not end the room for the creator
      return NextResponse.json({
        success: true,
        meetingEnded: Boolean(booking.meetingEndedAt),
        endedForAll: false,
      });
    }

    if (!booking.meetingEndedAt) {
      booking.meetingEndedAt = new Date();
      if (booking.status === 'confirmed' || booking.status === 'pending') {
        booking.status = 'completed';
      }
      await booking.save();
    }

    try {
      const { finalizeRecordingStop } = await import('@/lib/meetingRecording');
      await finalizeRecordingStop(String(booking._id));
    } catch (recErr) {
      console.error('[meeting end] recording finalize:', recErr);
    }

    return NextResponse.json({
      success: true,
      meetingEnded: true,
      endedForAll: true,
      meetingEndedAt: booking.meetingEndedAt,
    });
  } catch (err) {
    console.error('[POST /api/user/bookings/:id/meeting]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
