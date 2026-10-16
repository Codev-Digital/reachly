import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import SessionType from '@/models/SessionType';

// ── GET /api/creators/sessions ───────────────────────────────────────────────
// Ultra-fast lean fetch of all active session types for the logged-in creator
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select('_id').lean() as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // High performance indexed read (.lean() skips Mongoose document hydration)
    const sessions = await SessionType.find({
      userId: user._id,
      isActive: { $ne: false },
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      sessions: sessions.map((s: any) => ({
        ...s,
        id: s._id.toString(),
      })),
    });
  } catch (error: any) {
    console.error('GET /api/creators/sessions error:', error);
    return NextResponse.json({ error: 'Server error fetching sessions' }, { status: 500 });
  }
}

// ── POST /api/creators/sessions ──────────────────────────────────────────────
// Creates a new session type with discounted pricing and question builder support
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const {
      title,
      description,
      duration,
      price,
      discountedPrice,
      questions,
      features,
      maxBookings,
    } = body;

    // ── Field Validations ──
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Session title is required.' }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Session description is required.' }, { status: 400 });
    }

    const durationNum = Number(duration);
    if (isNaN(durationNum) || durationNum < 1) {
      return NextResponse.json({ error: 'Duration must be at least 1 minute.' }, { status: 400 });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 1) {
      return NextResponse.json({ error: 'Price must be at least PKR 1.' }, { status: 400 });
    }

    let parsedDiscountedPrice: number | undefined = undefined;
    if (discountedPrice !== undefined && discountedPrice !== null && discountedPrice !== '') {
      parsedDiscountedPrice = Number(discountedPrice);
      if (isNaN(parsedDiscountedPrice) || parsedDiscountedPrice < 0) {
        return NextResponse.json({ error: 'Discounted price cannot be negative.' }, { status: 400 });
      }
      if (parsedDiscountedPrice > priceNum) {
        return NextResponse.json(
          { error: 'Discounted price cannot exceed regular price.' },
          { status: 400 }
        );
      }
    }

    // Validate and sanitize questions
    const sanitizedQuestions: any[] = [];
    if (Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q || !q.question || !q.question.trim()) continue;

        const qType = q.type === 'multiple_choice' ? 'multiple_choice' : 'short_answer';
        const sanitizedOptions = qType === 'multiple_choice' && Array.isArray(q.options)
          ? q.options.map((opt: any) => String(opt || '').trim()).filter(Boolean)
          : [];

        sanitizedQuestions.push({
          type: qType,
          question: q.question.trim(),
          options: sanitizedOptions,
          required: q.required !== false,
        });
      }
    }

    // Determine display order
    const lastSession = await SessionType.findOne({ userId: user._id })
      .sort({ order: -1 })
      .select('order')
      .lean();
    const nextOrder = lastSession && typeof lastSession.order === 'number' ? lastSession.order + 1 : 0;

    const newSession = await SessionType.create({
      userId: user._id,
      title: title.trim(),
      description: description.trim(),
      duration: durationNum,
      price: priceNum,
      discountedPrice: parsedDiscountedPrice,
      questions: sanitizedQuestions,
      features: Array.isArray(features) ? features.filter((f) => typeof f === 'string' && f.trim()) : [],
      maxBookings: maxBookings ? Number(maxBookings) : undefined,
      order: nextOrder,
      isActive: true,
    });

    // Ensure user onboardingStep reflects session creation
    if (user.onboardingStep < 3) {
      user.onboardingStep = 3;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      session: {
        ...newSession.toObject(),
        id: newSession._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('POST /api/creators/sessions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session type.' },
      { status: 500 }
    );
  }
}
