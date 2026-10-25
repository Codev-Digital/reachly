import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import MeetingRecording from '@/models/MeetingRecording';
import { ingestRecordingAssets } from '@/lib/meetingRecording';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, context: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const email = session.user.email.toLowerCase().trim();
    const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
    const isAdmin = adminEmails.includes(email);

    const user = await User.findOne({ email }).select('_id').lean();
    if (!user && !isAdmin) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await context.params;
    const doc = await MeetingRecording.findById(id).exec();
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (!isAdmin) {
      const uid = String((user as any)._id);
      if (String(doc.creatorId) !== uid && String(doc.userId || '') !== uid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const updated = await ingestRecordingAssets(String(doc._id));
    return NextResponse.json({
      success: true,
      recording: updated
        ? {
            id: String(updated._id),
            status: updated.status,
            videoUrl: updated.videoUrl,
            transcriptUrl: updated.transcriptUrl,
            transcriptText: updated.transcriptText,
            error: updated.error,
          }
        : null,
    });
  } catch (err) {
    console.error('[POST /api/recordings/:id/refresh]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
