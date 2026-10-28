import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import Booking from '@/models/Booking';
import { cleanSessionDescription } from '@/lib/sanitizeRichText';

// ── GET /api/creators/sessions/[id] ──────────────────────────────────────────
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select('_id').lean() as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sessionDoc = await SessionType.findOne({
      _id: id,
      userId: user._id,
    }).lean() as any;

    if (!sessionDoc) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      session: {
        ...sessionDoc,
        id: sessionDoc._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('GET /api/creators/sessions/[id] error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ── PUT /api/creators/sessions/[id] ──────────────────────────────────────────
// Targeted update preserving MongoDB _id so existing bookings are never orphaned
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select('_id').lean() as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingSession = await SessionType.findOne({ _id: id, userId: user._id });
    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      duration,
      bufferTime,
      price,
      discountedPrice,
      questions,
      features,
      maxBookings,
      order,
      isActive,
      isDraft,
    } = body;

    const updatePayload: any = {};

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        return NextResponse.json({ error: 'Session title is required.' }, { status: 400 });
      }
      updatePayload.title = title.trim();
    }

    if (description !== undefined) {
      const cleanDescription = cleanSessionDescription(description);
      if ('error' in cleanDescription) {
        return NextResponse.json({ error: cleanDescription.error }, { status: 400 });
      }
      updatePayload.description = cleanDescription.value;
    }

    if (duration !== undefined) {
      const dur = Number(duration);
      if (isNaN(dur) || dur < 1) {
        return NextResponse.json({ error: 'Duration must be at least 1 minute.' }, { status: 400 });
      }
      updatePayload.duration = dur;
    }

    if (bufferTime !== undefined) {
      const buffer = bufferTime === null || bufferTime === '' ? 0 : Number(bufferTime);
      if (!Number.isInteger(buffer) || buffer < 0) {
        return NextResponse.json(
          { error: 'Buffer time must be a whole number of 0 or more minutes.' },
          { status: 400 }
        );
      }
      updatePayload.bufferTime = buffer;
    }

    const currentPrice = price !== undefined ? Number(price) : existingSession.price;
    if (price !== undefined) {
      if (isNaN(currentPrice) || currentPrice < 1) {
        return NextResponse.json({ error: 'Price must be at least PKR 1.' }, { status: 400 });
      }
      updatePayload.price = currentPrice;
    }

    if (discountedPrice !== undefined) {
      if (discountedPrice === null || discountedPrice === '') {
        updatePayload.discountedPrice = undefined;
      } else {
        const discPrice = Number(discountedPrice);
        if (isNaN(discPrice) || discPrice < 0) {
          return NextResponse.json({ error: 'Discounted price cannot be negative.' }, { status: 400 });
        }
        if (discPrice > currentPrice) {
          return NextResponse.json(
            { error: 'Discounted price cannot exceed regular price.' },
            { status: 400 }
          );
        }
        updatePayload.discountedPrice = discPrice;
      }
    }

    if (Array.isArray(questions)) {
      const sanitizedQuestions: any[] = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q || !q.question || !q.question.trim()) continue;

        const qType = q.type === 'multiple_choice' ? 'multiple_choice' : 'short_answer';
        const sanitizedOptions = qType === 'multiple_choice' && Array.isArray(q.options)
          ? q.options.map((opt: any) => String(opt || '').trim()).filter(Boolean)
          : [];

        sanitizedQuestions.push({
          ...(q._id || q.id ? { _id: q._id || q.id } : {}),
          type: qType,
          question: q.question.trim(),
          options: sanitizedOptions,
          required: q.required !== false,
        });
      }
      updatePayload.questions = sanitizedQuestions;
    }

    if (Array.isArray(features)) {
      updatePayload.features = features.filter((f) => typeof f === 'string' && f.trim());
    }

    if (maxBookings !== undefined) {
      updatePayload.maxBookings = maxBookings ? Number(maxBookings) : undefined;
    }

    if (typeof order === 'number') {
      updatePayload.order = order;
    }

    if (typeof isActive === 'boolean') {
      updatePayload.isActive = isActive;
    }

    if (typeof isDraft === 'boolean') {
      updatePayload.isDraft = isDraft;
    }

    const updatedSession = await SessionType.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    ).exec();

    // Check remaining active sessions to keep creator profile deactivation state in sync
    const remainingActiveCount = await SessionType.countDocuments({
      userId: user._id,
      isActive: { $ne: false },
    });

    let isDeactivated = false;
    if (remainingActiveCount === 0) {
      await CreatorProfile.updateOne(
        { userId: user._id, isDeactivated: { $ne: true } },
        { $set: { isDeactivated: true, deactivatedAt: new Date() } }
      );
      isDeactivated = true;
    } else {
      await CreatorProfile.updateOne(
        { userId: user._id, isDeactivated: true },
        { $set: { isDeactivated: false }, $unset: { deactivatedAt: '' } }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        ...updatedSession!.toObject(),
        id: updatedSession!._id.toString(),
      },
      isDeactivated,
      remainingActiveSessions: remainingActiveCount,
    });
  } catch (error: any) {
    console.error('PUT /api/creators/sessions/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update session.' },
      { status: 500 }
    );
  }
}

// ── DELETE /api/creators/sessions/[id] ───────────────────────────────────────
// Safe deletion: checks for existing bookings to prevent broken foreign key references
// Deactivates creator profile when last active session is removed
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select('_id').lean() as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sessionDoc = await SessionType.findOne({ _id: id, userId: user._id });
    if (!sessionDoc) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    // A creator must always keep at least one active session - the last one can't be deleted
    if (sessionDoc.isActive !== false) {
      const activeCount = await SessionType.countDocuments({
        userId: user._id,
        isActive: { $ne: false },
      });
      if (activeCount <= 1) {
        return NextResponse.json(
          {
            error: "Your last session can't be deleted. Add another session first, then delete this one.",
            code: 'LAST_SESSION',
          },
          { status: 409 }
        );
      }
    }

    // Check if bookings exist referencing this session
    const hasBookings = await Booking.exists({ sessionTypeId: id });

    if (hasBookings) {
      // Soft-delete to preserve booking history and financial records
      await SessionType.findByIdAndUpdate(id, { $set: { isActive: false } });
    } else {
      // If no bookings reference it, hard delete
      await SessionType.findByIdAndDelete(id);
    }

    // Check remaining active sessions for this creator
    const remainingActiveCount = await SessionType.countDocuments({
      userId: user._id,
      isActive: { $ne: false },
    });

    let isDeactivated = false;
    if (remainingActiveCount === 0) {
      await CreatorProfile.updateOne(
        { userId: user._id },
        { $set: { isDeactivated: true, deactivatedAt: new Date() } }
      );
      isDeactivated = true;
    }

    return NextResponse.json({
      success: true,
      message: hasBookings
        ? 'Session deactivated (preserved for past bookings).'
        : 'Session deleted successfully.',
      isDeactivated,
      remainingActiveSessions: remainingActiveCount,
    });
  } catch (error: any) {
    console.error('DELETE /api/creators/sessions/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete session.' },
      { status: 500 }
    );
  }
}
