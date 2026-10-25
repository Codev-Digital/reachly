import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import MeetingRecording from '@/models/MeetingRecording';
import { ingestRecordingAssets } from '@/lib/meetingRecording';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email.toLowerCase().trim() })
      .select('_id')
      .lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const CreatorProfile = (await import('@/models/CreatorProfile')).default;
    const creatorProfile = await CreatorProfile.findOne({ userId: (user as any)._id })
      .select('_id')
      .lean();
    const isCreator = Boolean(creatorProfile);
    // Creators see sessions they hosted; users see sessions they booked
    const filter = isCreator
      ? { creatorId: (user as any)._id }
      : { userId: (user as any)._id };

    const docs = await MeetingRecording.find(filter).sort({ createdAt: -1 }).limit(100).lean();

    // Kick off ingest for any still-processing items (non-blocking)
    for (const d of docs) {
      if (d.status === 'processing' || (d.status === 'recording' && d.meetingEndedAt)) {
        void ingestRecordingAssets(String(d._id)).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      role: isCreator ? 'creator' : 'user',
      recordings: docs.map((d: any) => ({
        id: String(d._id),
        bookingRef: d.bookingRef,
        status: d.status,
        creatorName: d.creatorName,
        creatorUsername: d.creatorUsername,
        creatorPhoto: d.creatorPhoto,
        userName: d.userName,
        userEmail: d.userEmail,
        userPhoto: d.userPhoto,
        sessionTitle: d.sessionTitle,
        sessionDurationMins: d.sessionDurationMins,
        scheduledDate: d.scheduledDate,
        scheduledTime: d.scheduledTime,
        purchasedAt: d.purchasedAt,
        paymentMethod: d.paymentMethod,
        paymentStatus: d.paymentStatus,
        finalPrice: d.finalPrice,
        meetingStartedAt: d.meetingStartedAt,
        meetingEndedAt: d.meetingEndedAt,
        durationSeconds: d.durationSeconds,
        videoUrl: d.videoUrl,
        transcriptUrl: d.transcriptUrl,
        transcriptText: d.transcriptText,
        error: d.error,
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    console.error('[GET /api/recordings]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
