'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DailyIframe, { DailyCall as DailyCallType } from '@daily-co/daily-js';
import { useRouter } from 'next/navigation';

export type DailyLeaveReason = 'left' | 'ended' | 'timeout';

interface DailyCallProps {
  url: string;
  /** Booking id / ref — used to end meeting & poll status */
  bookingId?: string;
  role?: 'creator' | 'user';
  /** Absolute end time ISO from server (started + duration + buffer) */
  meetingEndsAt?: string | null;
  onLeave?: (reason: DailyLeaveReason) => void;
}

function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export default function DailyCall({
  url,
  bookingId,
  role = 'user',
  meetingEndsAt,
  onLeave,
}: DailyCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCallType | null>(null);
  const leavingRef = useRef(false);
  const onLeaveRef = useRef(onLeave);
  const router = useRouter();

  const [remainingSec, setRemainingSec] = useState<number | null>(() => {
    if (!meetingEndsAt) return null;
    // Floor so a 20min session shows 19:59 right after start (not 20:00)
    return Math.max(0, Math.floor((new Date(meetingEndsAt).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  const endMeetingOnServer = useCallback(async () => {
    if (!bookingId) return;
    try {
      // Creator path also works; shared meeting POST handles both
      await fetch(`/api/user/bookings/${bookingId}/meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      });
      if (role === 'creator') {
        await fetch(`/api/creators/bookings/${bookingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endMeeting: true }),
        });
      }
    } catch (err) {
      console.error('[DailyCall] endMeeting:', err);
    }
  }, [bookingId, role]);

  const finish = useCallback(
    async (reason: DailyLeaveReason) => {
      if (leavingRef.current) return;
      leavingRef.current = true;

      if (reason === 'timeout' || (reason === 'left' && role === 'creator')) {
        await endMeetingOnServer();
      }

      try {
        const frame = callRef.current;
        if (frame) {
          try {
            await frame.leave();
          } catch {
            /* already left */
          }
          try {
            await frame.destroy();
          } catch {
            /* ignore */
          }
          callRef.current = null;
        }
      } catch {
        /* ignore */
      }

      if (onLeaveRef.current) onLeaveRef.current(reason);
      else router.push('/');
    },
    [endMeetingOnServer, role, router]
  );

  // Countdown from meetingEndsAt
  useEffect(() => {
    if (!meetingEndsAt) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.floor((new Date(meetingEndsAt).getTime() - Date.now()) / 1000)
      );
      setRemainingSec(left);
      if (left <= 0) {
        void finish('timeout');
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [meetingEndsAt, finish]);

  // Users poll so creator hang-up disconnects them
  useEffect(() => {
    if (!bookingId || role !== 'user') return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/user/bookings/${bookingId}/meeting`, {
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && data.meetingEnded) {
          void finish('ended');
        }
      } catch {
        /* ignore */
      }
    };

    const id = window.setInterval(poll, 3000);
    void poll();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [bookingId, role, finish]);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let newCallFrame: DailyCallType | null = DailyIframe.getCallInstance();

    const initFrame = async () => {
      try {
        if (newCallFrame) {
          await newCallFrame.destroy();
        }
        if (cancelled || !containerRef.current) return;

        newCallFrame = DailyIframe.createFrame(containerRef.current, {
          showLeaveButton: true,
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '12px',
          },
        });
        callRef.current = newCallFrame;

        const handleLeave = () => {
          if (leavingRef.current) return;
          void finish('left');
        };

        newCallFrame.on('left-meeting', handleLeave);
        await newCallFrame.join({ url });
      } catch (err) {
        console.error('[DailyCall] init:', err);
      }
    };

    void initFrame();

    return () => {
      cancelled = true;
      if (newCallFrame) {
        try {
          newCallFrame.destroy();
        } catch {
          /* ignore */
        }
      }
      callRef.current = null;
    };
    // Intentionally only re-init on url change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const timerLabel = remainingSec != null ? formatCountdown(remainingSec) : null;
  const urgent = remainingSec != null && remainingSec <= 60;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black p-0 backdrop-blur-md md:p-10">
      {timerLabel != null && (
        <div
          className={`absolute top-4 left-1/2 z-[10000] -translate-x-1/2 rounded-full px-5 py-2 font-mono text-base font-bold tracking-wider shadow-lg sm:text-lg ${
            urgent
              ? 'bg-red-500 text-white'
              : 'bg-white/95 text-gray-900'
          }`}
        >
          {timerLabel}
        </div>
      )}
      <div
        ref={containerRef}
        className="h-full w-full max-w-[1400px] overflow-hidden bg-[#1a1a1a] shadow-2xl md:rounded-[24px]"
      />
    </div>
  );
}
