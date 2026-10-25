import MeetingRecording from '@/models/MeetingRecording';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import { uploadToSupabase } from '@/lib/supabase';
import {
  getRecordingAccessLink,
  getTranscriptAccessLink,
  listRoomRecordings,
  listTranscripts,
  startCloudRecording,
  startRoomTranscription,
  stopCloudRecording,
  stopRoomTranscription,
} from '@/lib/daily';

async function partySnapshot(booking: any) {
  const [creatorUser, creatorProfile, clientUser, sessionType] = await Promise.all([
    User.findById(booking.creatorId).select('name profilePhoto email').lean(),
    CreatorProfile.findOne({ userId: booking.creatorId })
      .select('displayName username profilePhoto')
      .lean(),
    booking.userId
      ? User.findById(booking.userId).select('name profilePhoto email').lean()
      : Promise.resolve(null),
    SessionType.findById(booking.sessionTypeId).select('title duration').lean(),
  ]);

  const creatorName =
    (creatorProfile as any)?.displayName || (creatorUser as any)?.name || 'Creator';
  const creatorUsername = (creatorProfile as any)?.username || '';
  const creatorPhoto =
    (creatorProfile as any)?.profilePhoto || (creatorUser as any)?.profilePhoto || '';

  const userName =
    (clientUser as any)?.name ||
    booking.guestDetails?.fullName ||
    'Guest';
  const userEmail =
    (clientUser as any)?.email || booking.guestDetails?.email || '';
  const userPhoto = (clientUser as any)?.profilePhoto || '';

  return {
    creatorName,
    creatorUsername,
    creatorPhoto,
    userName,
    userEmail,
    userPhoto,
    sessionTitle: (sessionType as any)?.title || 'Session',
    sessionDurationMins: Math.max(1, Number((sessionType as any)?.duration) || 15),
  };
}

/** Create / refresh a MeetingRecording row when the creator starts the call. */
export async function ensureRecordingSession(bookingId: string) {
  const booking = await Booking.findById(bookingId).exec();
  if (!booking) return null;

  const snap = await partySnapshot(booking);
  const roomName = booking.meetingRoomName || '';

  let doc = await MeetingRecording.findOne({ bookingId: booking._id }).exec();
  if (!doc) {
    doc = new MeetingRecording({
      bookingId: booking._id,
      bookingRef: booking.bookingRef,
      creatorId: booking.creatorId,
      userId: booking.userId || null,
      ...snap,
      scheduledDate: booking.scheduledDate,
      scheduledTime: booking.scheduledTime,
      purchasedAt: (booking as any).createdAt,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      finalPrice: booking.finalPrice,
      meetingStartedAt: booking.meetingStartedAt,
      dailyRoomName: roomName,
      status: 'pending',
    });
  } else {
    Object.assign(doc, {
      ...snap,
      meetingStartedAt: booking.meetingStartedAt || doc.meetingStartedAt,
      dailyRoomName: roomName || doc.dailyRoomName,
      paymentStatus: booking.paymentStatus,
      finalPrice: booking.finalPrice,
    });
  }

  if (roomName && doc.status !== 'recording' && doc.status !== 'ready') {
    try {
      await startCloudRecording(roomName);
      doc.status = 'recording';
    } catch (err: any) {
      console.error('[recording] start cloud recording:', err?.message || err);
      // Room may already be recording from client startRecording()
      doc.status = 'recording';
      doc.error = err?.message || String(err);
    }
    try {
      await startRoomTranscription(roomName);
    } catch {
      /* optional */
    }
  }

  await doc.save();
  return doc;
}

/** Stop Daily recording/transcription and mark processing. */
export async function finalizeRecordingStop(bookingId: string) {
  const booking = await Booking.findById(bookingId).exec();
  if (!booking) return null;

  let doc = await MeetingRecording.findOne({ bookingId: booking._id }).exec();
  if (!doc) {
    doc = await ensureRecordingSession(bookingId);
  }
  if (!doc) return null;

  doc.meetingEndedAt = booking.meetingEndedAt || new Date();
  if (doc.meetingStartedAt && doc.meetingEndedAt) {
    doc.durationSeconds = Math.max(
      0,
      Math.round(
        (new Date(doc.meetingEndedAt).getTime() - new Date(doc.meetingStartedAt).getTime()) /
          1000
      )
    );
  }

  const roomName = doc.dailyRoomName || booking.meetingRoomName;
  if (roomName) {
    try {
      await stopCloudRecording(roomName);
    } catch (err) {
      console.warn('[recording] stop:', err);
    }
    try {
      await stopRoomTranscription(roomName);
    } catch {
      /* optional */
    }
  }

  if (doc.status !== 'ready') {
    doc.status = 'processing';
  }
  await doc.save();

  // Download may take a minute — kick off without blocking the hang-up response
  void ingestRecordingAssets(String(doc._id)).catch((err) =>
    console.error('[recording] ingest:', err)
  );

  return doc;
}

async function downloadToBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const ab = await res.arrayBuffer();
  return { buffer: Buffer.from(ab), contentType };
}

/** Pull finished Daily assets into Supabase and mark ready. */
export async function ingestRecordingAssets(recordingDocId: string, attempt = 0) {
  const doc = await MeetingRecording.findById(recordingDocId).exec();
  if (!doc) return null;
  if (doc.status === 'ready' && doc.videoUrl) return doc;

  const roomName = doc.dailyRoomName;
  if (!roomName) {
    doc.status = 'failed';
    doc.error = 'Missing Daily room name';
    await doc.save();
    return doc;
  }

  try {
    // Wait briefly for Daily to finish processing on early attempts
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, Math.min(15000, 3000 * attempt)));
    }

    const recordings = await listRoomRecordings(roomName);
    const latest =
      recordings
        .slice()
        .sort(
          (a, b) =>
            new Date(b.start_ts || b.created_at || 0).getTime() -
            new Date(a.start_ts || a.created_at || 0).getTime()
        )[0] || null;

    if (!latest?.id) {
      if (attempt < 8) {
        return ingestRecordingAssets(recordingDocId, attempt + 1);
      }
      doc.status = 'failed';
      doc.error = 'No Daily recording found yet';
      await doc.save();
      return doc;
    }

    doc.dailyRecordingId = String(latest.id);
    if (latest.duration) doc.durationSeconds = Math.round(Number(latest.duration));

    const access = await getRecordingAccessLink(String(latest.id), 3600);
    const downloadUrl = access?.download_link;
    if (!downloadUrl) throw new Error('No recording download link');

    const { buffer, contentType } = await downloadToBuffer(downloadUrl);
    const ext = contentType.includes('mp4')
      ? 'mp4'
      : contentType.includes('webm')
        ? 'webm'
        : 'mp4';
    const path = `recordings/${doc.creatorId}/${doc.bookingRef}/${doc.dailyRecordingId}.${ext}`;
    doc.videoUrl = await uploadToSupabase(buffer, contentType || `video/${ext}`, path);

    // Best-effort transcript
    try {
      const transcripts = await listTranscripts();
      const match =
        transcripts.find(
          (t) =>
            String(t.roomName || t.room_name || '') === roomName ||
            String(t.mtgSessionId || '') === String(latest.mtgSessionId || '')
        ) || transcripts.find((t) => String(t.status || '').includes('finished'));

      if (match?.transcriptId || match?.id) {
        const tid = String(match.transcriptId || match.id);
        doc.dailyTranscriptId = tid;
        const tAccess = await getTranscriptAccessLink(tid);
        const tUrl = tAccess?.download_link;
        if (tUrl) {
          const tFile = await downloadToBuffer(tUrl);
          const tPath = `recordings/${doc.creatorId}/${doc.bookingRef}/${tid}.vtt`;
          doc.transcriptUrl = await uploadToSupabase(
            tFile.buffer,
            tFile.contentType || 'text/vtt',
            tPath
          );
          try {
            doc.transcriptText = tFile.buffer.toString('utf8').slice(0, 200000);
          } catch {
            /* ignore */
          }
        }
      }
    } catch (err) {
      console.warn('[recording] transcript ingest skipped:', err);
    }

    doc.status = 'ready';
    doc.error = undefined;
    await doc.save();
    return doc;
  } catch (err: any) {
    console.error('[recording] ingest failed:', err);
    if (attempt < 8) {
      return ingestRecordingAssets(recordingDocId, attempt + 1);
    }
    doc.status = 'failed';
    doc.error = err?.message || String(err);
    await doc.save();
    return doc;
  }
}
