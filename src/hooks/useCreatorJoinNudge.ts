'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { playMeetingBeep, resumeMeetingAudio } from '@/lib/meetingAudio';

/**
 * While the creator has the ready-to-join modal open:
 * - 20s: beep + toast asking them to press Join
 * - 30s: beep + auto-join (starts meeting + opens Daily)
 *
 * Session timer only starts when Join actually runs (server startMeeting).
 */
export function useCreatorJoinNudge(opts: {
  /** True while ready modal is open (selected booking, not yet in call) */
  waitingToJoin: boolean;
  /** Prevents double auto-join while start request is in flight */
  starting: boolean;
  /** Booking id so timers reset per meeting */
  bookingId?: string | null;
  onAutoJoin: () => void;
}) {
  const { waitingToJoin, starting, bookingId, onAutoJoin } = opts;
  const onAutoJoinRef = useRef(onAutoJoin);
  useEffect(() => {
    onAutoJoinRef.current = onAutoJoin;
  }, [onAutoJoin]);

  useEffect(() => {
    if (!waitingToJoin || starting || !bookingId) return;

    resumeMeetingAudio();

    const nudgeId = window.setTimeout(() => {
      playMeetingBeep({ frequency: 880, durationMs: 220, volume: 0.32 });
      toast('Please Press Join button', {
        position: 'top-right',
        duration: 6000,
      });
    }, 20_000);

    const autoJoinId = window.setTimeout(() => {
      playMeetingBeep({ frequency: 1040, durationMs: 260, volume: 0.35 });
      toast('Joining meeting…', {
        position: 'top-right',
        duration: 3000,
      });
      onAutoJoinRef.current();
    }, 30_000);

    return () => {
      window.clearTimeout(nudgeId);
      window.clearTimeout(autoJoinId);
    };
  }, [waitingToJoin, starting, bookingId]);
}
