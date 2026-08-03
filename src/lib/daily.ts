export async function createMeetingRoom(bookingRef: string, scheduledDate: Date, durationMinutes: number) {
  const DAILY_API_KEY = process.env.DAILY_API_KEY;
  if (!DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY is missing in environment variables');
  }

  // Set the room to become active 5 minutes before the scheduled time
  const notBefore = Math.floor(scheduledDate.getTime() / 1000) - (5 * 60);

  // Set the room to expire (close) 15 minutes after the duration ends
  const exp = Math.floor(scheduledDate.getTime() / 1000) + (durationMinutes * 60) + (15 * 60);

  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: `reachly-${bookingRef.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      properties: {
        enable_chat: true,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to create Daily.co room:', response.status, errorBody);
    throw new Error('Failed to create meeting room');
  }

  const data = await response.json();
  return {
    url: data.url,
    name: data.name,
  };
}
