import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import MeetingRecording from '@/models/MeetingRecording';
import { ingestRecordingAssets } from '@/lib/meetingRecording';

function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const docs = await MeetingRecording.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    for (const d of docs) {
      if (d.status === 'processing' || (d.status === 'recording' && d.meetingEndedAt)) {
        void ingestRecordingAssets(String(d._id)).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      role: 'admin',
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
    console.error('[GET /api/admin/recordings]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
