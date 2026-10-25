import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import { cleanSessionDescription } from '@/lib/sanitizeRichText';
import { sanitizeQuestions } from '@/lib/sessionQuestions';

// ── GET — load all saved session types for this user ─────────────────────────
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

    // Clear stale draft flags left by an older save path (completed sessions were marked draft)
    await SessionType.updateMany(
      { userId: user._id, isDraft: true, isActive: { $ne: false } },
      { $set: { isDraft: false } }
    );

    const sessionTypes = await SessionType.find({ userId: user._id }).sort({ order: 1 }).lean();

    return NextResponse.json({ sessionTypes });
  } catch (error: any) {
    console.error('GET step-3 error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// ── PUT — replace all session types and save (full replace strategy) ─────────
export async function PUT(req: NextRequest) {
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
    const { sessionTypes } = body;

    // ── Validate: at least one session required ───────────────────────────
    if (!sessionTypes || !Array.isArray(sessionTypes) || sessionTypes.length === 0) {
      return NextResponse.json(
        { error: 'Add at least one session type before continuing.', code: 'NO_SESSIONS' },
        { status: 422 }
      );
    }

    // ── Validate each session ────────────────────────────────────────────
    for (let i = 0; i < sessionTypes.length; i++) {
      const s = sessionTypes[i];
      const idx = i + 1;

      if (!s.title?.trim()) {
        return NextResponse.json(
          { error: `Session ${idx}: title is required.` },
          { status: 422 }
        );
      }
      const cleanDescription = cleanSessionDescription(s.description);
      if ('error' in cleanDescription) {
        return NextResponse.json(
          { error: `Session ${idx}: ${cleanDescription.error}` },
          { status: 422 }
        );
      }
      s.description = cleanDescription.value;
      const cleanQuestions = sanitizeQuestions(s.questions);
      if ('error' in cleanQuestions) {
        return NextResponse.json(
          { error: `Session ${idx}: ${cleanQuestions.error}` },
          { status: 422 }
        );
      }
      s.questions = cleanQuestions.value;
      const duration = Number(s.duration);
      if (isNaN(duration) || duration < 1 || duration > 1440 || !Number.isInteger(duration)) {
        return NextResponse.json(
          { error: `Session ${idx}: duration must be a whole number of minutes between 1 and 1440.` },
          { status: 422 }
        );
      }
      const price = Number(s.price);
      if (!price || price < 1) {
        return NextResponse.json(
          { error: `Session ${idx}: price must be at least PKR 1.` },
          { status: 422 }
        );
      }
      if (s.bufferTime !== undefined && s.bufferTime !== null && s.bufferTime !== '') {
        const buffer = Number(s.bufferTime);
        if (!Number.isInteger(buffer) || buffer < 0 || buffer > duration) {
          return NextResponse.json(
            { error: `Session ${idx}: buffer time must be a whole number of minutes and no longer than the session duration.` },
            { status: 422 }
          );
        }
      }
      // Older sessions may omit this field — default to 1 day notice
      const noticeRaw =
        s.minAdvanceDays === undefined || s.minAdvanceDays === null || s.minAdvanceDays === ''
          ? 1
          : Number(s.minAdvanceDays);
      if (!Number.isInteger(noticeRaw) || noticeRaw < 0 || noticeRaw > 90) {
        return NextResponse.json(
          { error: `Session ${idx}: minimum notice must be a whole number from 0 to 90 days.` },
          { status: 422 }
        );
      }
      s.minAdvanceDays = noticeRaw;
      if (s.isPackage) {
        const n = Number(s.packageSessions);
        if (!Number.isInteger(n) || n < 2 || n > 100) {
          return NextResponse.json(
            { error: `Session ${idx}: a package needs between 2 and 100 sessions.` },
            { status: 422 }
          );
        }
      }
      if (s.discountedPrice !== undefined && s.discountedPrice !== null && s.discountedPrice !== '') {
        const discounted = Number(s.discountedPrice);
        if (isNaN(discounted) || discounted < 1 || discounted >= price) {
          return NextResponse.json(
            { error: `Session ${idx}: discounted price must be at least PKR 1 and less than the session price.` },
            { status: 422 }
          );
        }
      }
    }

    // ── Sync: update existing sessions in place (ids must survive: bookings and
    //    package purchases point at them), insert new ones, remove the rest ────
    const toDoc = (s: any, index: number) => ({
      title: s.title.trim(),
      description: s.description.trim(),
      duration: Number(s.duration),
      price: Number(s.price),
      discountedPrice: s.discountedPrice !== undefined && s.discountedPrice !== null && s.discountedPrice !== ''
        ? Number(s.discountedPrice)
        : undefined,
      bufferTime: s.bufferTime ? Number(s.bufferTime) : 0,
      minAdvanceDays:
        s.minAdvanceDays === undefined || s.minAdvanceDays === null || s.minAdvanceDays === ''
          ? 1
          : Number(s.minAdvanceDays),
      questions: Array.isArray(s.questions) ? s.questions : [],
      features: (s.features || []).filter((f: string) => f?.trim()),
      maxBookings: s.maxBookings ? Number(s.maxBookings) : undefined,
      isPackage: !!s.isPackage,
      packageSessions: s.isPackage ? Number(s.packageSessions) : undefined,
      packagePeriod: (s.isPackage ? (s.packagePeriod === 'month' ? 'month' : 'week') : undefined) as 'week' | 'month' | undefined,
      order: index,
      // Keep offline sessions offline; otherwise publish as live
      isActive: s.isActive === false ? false : true,
      // Only mark draft when explicitly set (settings/publish saves clear draft)
      isDraft: s.isDraft === true,
    });

    const existing = await SessionType.find({ userId: user._id }).select('_id').lean();
    const existingIds = new Set(existing.map((e: any) => String(e._id)));
    const keptIds = new Set<string>();
    const saved: any[] = [];

    for (let i = 0; i < sessionTypes.length; i++) {
      const s = sessionTypes[i];
      const id = String(s._id || s.id || '');
      if (existingIds.has(id)) {
        keptIds.add(id);
        saved.push(await SessionType.findByIdAndUpdate(id, { $set: toDoc(s, i) }, { new: true, runValidators: true }));
      } else {
        saved.push(await SessionType.create({ userId: user._id, ...toDoc(s, i) }));
      }
    }

    const removedIds = [...existingIds].filter((id) => !keptIds.has(id));
    if (removedIds.length) await SessionType.deleteMany({ _id: { $in: removedIds } });

    // ── Ensure creator profile is reactivated if previously deactivated ──
    await CreatorProfile.updateOne(
      { userId: user._id, isDeactivated: true },
      { $set: { isDeactivated: false }, $unset: { deactivatedAt: '' } }
    );

    // ── Bump onboardingStep ───────────────────────────────────────────────
    if (user.onboardingStep < 3) {
      user.onboardingStep = 3;
      await user.save();
    }

    return NextResponse.json({ success: true, sessionTypes: saved });
  } catch (error: any) {
    console.error('PUT step-3 error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
