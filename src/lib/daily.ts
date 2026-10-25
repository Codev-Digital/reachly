const DAILY_API = 'https://api.daily.co/v1';

function dailyKey() {
  const key = process.env.DAILY_API_KEY;
  if (!key) throw new Error('DAILY_API_KEY is missing in environment variables');
  return key;
}

async function dailyFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${DAILY_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${dailyKey()}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg = data?.error || data?.info || text || `Daily API ${res.status}`;
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    (err as any).status = res.status;
    (err as any).body = data;
    throw err;
  }
  return data;
}

export async function createMeetingRoom(
  bookingRef: string,
  scheduledDate: Date,
  durationMinutes: number
) {
  // reserved for future nbf/exp if needed
  void scheduledDate;
  void durationMinutes;

  const data = await dailyFetch('/rooms', {
    method: 'POST',
    body: JSON.stringify({
      name: `reachly-${bookingRef.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      properties: {
        enable_chat: true,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
        // Cloud recording (requires Daily paid plan with recording enabled)
        enable_recording: 'cloud',
        // Store live transcripts when transcription is used
        enable_transcription_storage: true,
      },
    }),
  });

  return {
    url: data.url as string,
    name: data.name as string,
  };
}

export async function startCloudRecording(roomName: string) {
  return dailyFetch(`/rooms/${encodeURIComponent(roomName)}/recordings/start`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'cloud',
      width: 1280,
      height: 720,
      layout: { preset: 'default', max_cam_streams: 5 },
    }),
  });
}

export async function stopCloudRecording(roomName: string) {
  try {
    return await dailyFetch(`/rooms/${encodeURIComponent(roomName)}/recordings/stop`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  } catch (err: any) {
    // Already stopped / no active recording — treat as soft success
    if (err?.status === 400 || err?.status === 404) return null;
    throw err;
  }
}

export async function startRoomTranscription(roomName: string) {
  try {
    return await dailyFetch(`/rooms/${encodeURIComponent(roomName)}/transcription/start`, {
      method: 'POST',
      body: JSON.stringify({
        language: 'en',
        model: 'nova-2-general',
        punctuate: true,
      }),
    });
  } catch (err) {
    console.warn('[daily] transcription start skipped:', err);
    return null;
  }
}

export async function stopRoomTranscription(roomName: string) {
  try {
    return await dailyFetch(`/rooms/${encodeURIComponent(roomName)}/transcription/stop`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  } catch {
    return null;
  }
}

export async function listRoomRecordings(roomName: string) {
  const data = await dailyFetch(
    `/recordings?room_name=${encodeURIComponent(roomName)}&limit=20`
  );
  return (data?.data || data || []) as any[];
}

export async function getRecordingAccessLink(recordingId: string, validForSecs = 3600) {
  return dailyFetch(
    `/recordings/${encodeURIComponent(recordingId)}/access-link?valid_for_secs=${validForSecs}`
  );
}

export async function listTranscripts() {
  try {
    const data = await dailyFetch('/transcript?limit=50');
    return (data?.data || data || []) as any[];
  } catch {
    return [];
  }
}

export async function getTranscriptAccessLink(transcriptId: string) {
  return dailyFetch(`/transcript/${encodeURIComponent(transcriptId)}/access-link`);
}
