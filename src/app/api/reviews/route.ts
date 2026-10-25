import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import Review from '@/models/Review';

const COMMENT_MAX = 250;

/**
 * POST — submit a post-meeting review.
 * Body: { bookingId, rating?, comment?, sessionDurationMins? }
 * - Users: rating (1–5) and comment (1–250 chars) are required.
 * - Creators: rating and comment are optional (skip allowed with empty body fields).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const email = session.user.email?.toLowerCase().trim();
    let user = null;
    if (email) user = await User.findOne({ email });
    if (!user && (session.user as any).id) {
      user = await User.findById((session.user as any).id).exec();
    }
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const bookingIdRaw = body?.bookingId || body?.bookingRef;
    if (!bookingIdRaw || typeof bookingIdRaw !== 'string') {
      return NextResponse.json({ error: 'Booking id is required.' }, { status: 400 });
    }

    let booking = null;
    if (mongoose.isValidObjectId(bookingIdRaw)) {
      booking = await Booking.findById(bookingIdRaw).exec();
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingRef: bookingIdRaw }).exec();
    }
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const isCreator = booking.creatorId?.toString() === user._id.toString();
    const isUser =
      booking.userId?.toString() === user._id.toString() ||
      booking.guestDetails?.email?.toLowerCase().trim() === email;

    if (!isCreator && !isUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const reviewerRole = isCreator ? 'creator' : 'user';
    const revieweeId = isCreator
      ? booking.userId || null
      : booking.creatorId;

    let rating: number | null = null;
    if (body?.rating != null && body.rating !== '') {
      const n = Number(body.rating);
      if (!Number.isInteger(n) || n < 1 || n > 5) {
        return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
      }
      rating = n;
    }

    const comment =
      typeof body?.comment === 'string' ? body.comment.trim().slice(0, COMMENT_MAX) : '';

    if (reviewerRole === 'user') {
      if (!rating) {
        return NextResponse.json({ error: 'Please select a star rating.' }, { status: 422 });
      }
      if (!comment) {
        return NextResponse.json({ error: 'Please write a short review.' }, { status: 422 });
      }
    }

    let sessionDurationMins: number | null = null;
    if (body?.sessionDurationMins != null && body.sessionDurationMins !== '') {
      const d = Number(body.sessionDurationMins);
      if (Number.isFinite(d) && d > 0) sessionDurationMins = Math.round(d);
    }

    // Creators may dismiss without submitting — treat empty optional skip as success no-op
    if (reviewerRole === 'creator' && !rating && !comment) {
      if (booking.status === 'confirmed' || booking.status === 'pending') {
        booking.status = 'completed';
        await booking.save();
      }
      return NextResponse.json({ success: true, skipped: true });
    }

    const existing = await Review.findOne({
      bookingId: booking._id,
      reviewerRole,
    }).exec();

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      if (sessionDurationMins) existing.sessionDurationMins = sessionDurationMins;
      await existing.save();
    } else {
      await Review.create({
        bookingId: booking._id,
        bookingRef: booking.bookingRef || '',
        reviewerId: user._id,
        reviewerRole,
        revieweeId,
        rating,
        comment,
        ...(sessionDurationMins != null ? { sessionDurationMins } : {}),
      });
    }

    if (booking.status === 'confirmed' || booking.status === 'pending') {
      booking.status = 'completed';
      await booking.save();
    }

    // Notify creator when a user leaves a review
    if (reviewerRole === 'user' && booking.creatorId) {
      try {
        const { invalidateCreatorsListCache } = await import('@/lib/creatorsListCache');
        invalidateCreatorsListCache();
      } catch {
        /* ignore cache clear failures */
      }
      try {
        const Notification = (await import('@/models/Notification')).default;
        const clientName = user.name || booking.guestDetails?.fullName || 'A client';
        await new Notification({
          userId: booking.creatorId,
          title: 'New Review',
          message: `${clientName} left a ${rating}-star review on your session.`,
          type: 'review',
          read: false,
          time: 'Just now',
        }).save();
      } catch (notifErr) {
        console.error('[POST /api/reviews] notification:', notifErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'You already reviewed this session.' }, { status: 409 });
    }
    console.error('[POST /api/reviews]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
