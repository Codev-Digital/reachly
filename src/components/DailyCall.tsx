'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DailyIframe, { DailyCall as DailyCallType } from '@daily-co/daily-js';
import { useRouter } from 'next/navigation';
import { Clock, Volume2, VolumeX } from 'lucide-react';
import { playMeetingBeep, resumeMeetingAudio } from '@/lib/meetingAudio';

/** unavailable = call never joined (e.g. already over) — do not open review */
export type DailyLeaveReason = 'left' | 'ended' | 'timeout' | 'unavailable';

interface DailyCallProps {
  url: string;
  /** Booking id / ref — used to end meeting & poll status */
  bookingId?: string;
  role?: 'creator' | 'user';
  /** Absolute end time ISO from server (started + duration + buffer) — only after creator Join */
  meetingEndsAt?: string | null;
  onLeave?: (reason: DailyLeaveReason) => void;
  /** User tried to enter before creator pressed Join */
  onWaitingForCreator?: (creatorName: string) => void;
}

type BeepMuteMsg = { type: 'reachly-beep-mute'; muted: boolean };

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
  onWaitingForCreator,
}: DailyCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCallType | null>(null);
  const leavingRef = useRef(false);
  const joinedRef = useRef(false);
  const onLeaveRef = useRef(onLeave);
  const onWaitingRef = useRef(onWaitingForCreator);
  const beeped30Ref = useRef(false);
  const continuousBeepRef = useRef<number | null>(null);
  const mutedRef = useRef(false);
  const router = useRouter();

  // Timer end time is armed only after creator Join (server meetingEndsAt) + local join
  const [endsAtIso, setEndsAtIso] = useState<string | null>(null);
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [timerArmed, setTimerArmed] = useState(false);
  const [beepMuted, setBeepMuted] = useState(false);

  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    onWaitingRef.current = onWaitingForCreator;
  }, [onWaitingForCreator]);

  useEffect(() => {
    mutedRef.current = beepMuted;
    if (beepMuted && continuousBeepRef.current != null) {
      window.clearInterval(continuousBeepRef.current);
      continuousBeepRef.current = null;
    }
  }, [beepMuted]);

  // Sync prop → local end time (do not show countdown until we have joined the room)
  useEffect(() => {
    if (meetingEndsAt) {
      setEndsAtIso(String(meetingEndsAt));
      beeped30Ref.current = false;
    }
  }, [meetingEndsAt]);

  // Unlock audio on first pointer (browsers block until gesture)
  useEffect(() => {
    const unlock = () => resumeMeetingAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    unlock();
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const stopContinuousBeep = useCallback(() => {
    if (continuousBeepRef.current != null) {
      window.clearInterval(continuousBeepRef.current);
      continuousBeepRef.current = null;
    }
  }, []);

  const startContinuousBeep = useCallback(() => {
    if (continuousBeepRef.current != null || mutedRef.current) return;
    playMeetingBeep({ frequency: 1040, durationMs: 160, volume: 0.32 });
    continuousBeepRef.current = window.setInterval(() => {
      if (mutedRef.current) return;
      playMeetingBeep({ frequency: 1040, durationMs: 160, volume: 0.32 });
    }, 700);
  }, []);

  const endMeetingOnServer = useCallback(async () => {
    if (!bookingId) return;
    try {
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
      stopContinuousBeep();

      // Never end/review if we never actually joined the room
      const effective: DailyLeaveReason =
        !joinedRef.current && reason !== 'unavailable' ? 'unavailable' : reason;

      if (
        effective === 'timeout' ||
        effective === 'ended' ||
        (effective === 'left' && role === 'creator')
      ) {
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

      if (onLeaveRef.current) onLeaveRef.current(effective);
      else router.push('/');
    },
    [endMeetingOnServer, role, router, stopContinuousBeep]
  );

  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  // Fetch authoritative end time (do not treat pre-join as a reviewable end)
  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;

    const sync = async () => {
      try {
        const res = await fetch(`/api/user/bookings/${bookingId}/meeting`, { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (cancelled || !res.ok) return;
        if (data.meetingEnded) {
          // Already over before we entered — close UI, no review popup
          void finishRef.current(joinedRef.current ? 'ended' : 'unavailable');
          return;
        }
        if (data.meetingEndsAt) {
          setEndsAtIso(String(data.meetingEndsAt));
        }
      } catch {
        /* ignore */
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  // Countdown + beeps + hard end at 0 — only after creator started + we joined
  useEffect(() => {
    if (!endsAtIso || !timerArmed) return;
    beeped30Ref.current = false;
    stopContinuousBeep();

    const tick = () => {
      if (!joinedRef.current) return;

      const left = Math.max(
        0,
        Math.floor((new Date(endsAtIso).getTime() - Date.now()) / 1000)
      );
      setRemainingSec(left);

      if (!mutedRef.current) {
        if (left <= 30 && left > 10 && !beeped30Ref.current) {
          beeped30Ref.current = true;
          playMeetingBeep({ frequency: 780, durationMs: 220, volume: 0.3 });
        }
        if (left <= 10 && left > 0) {
          startContinuousBeep();
        } else {
          stopContinuousBeep();
        }
      } else {
        stopContinuousBeep();
      }

      if (left <= 0) {
        stopContinuousBeep();
        void finishRef.current('timeout');
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => {
      window.clearInterval(id);
      stopContinuousBeep();
    };
  }, [endsAtIso, timerArmed, startContinuousBeep, stopContinuousBeep]);

  // Both sides poll so hang-up / remote timeout disconnects everyone quickly
  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/user/bookings/${bookingId}/meeting`, {
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled || !res.ok) return;
        if (data.meetingEnded) {
          void finishRef.current(joinedRef.current ? 'ended' : 'unavailable');
          return;
        }
        if (data.meetingEndsAt && !endsAtIso) {
          setEndsAtIso(String(data.meetingEndsAt));
        }
      } catch {
        /* ignore */
      }
    };

    const id = window.setInterval(poll, 1500);
    void poll();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [bookingId, endsAtIso]);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let newCallFrame: DailyCallType | null = DailyIframe.getCallInstance() ?? null;

    const initFrame = async () => {
      try {
        if (newCallFrame) {
          await newCallFrame.destroy();
        }
        if (cancelled || !containerRef.current) return;

        // Gate: users cannot enter (or start timer) until creator pressed Join
        let resolvedEndsAt: string | null = meetingEndsAt ? String(meetingEndsAt) : null;
        if (bookingId) {
          const res = await fetch(`/api/user/bookings/${bookingId}/meeting`, {
            cache: 'no-store',
          });
          const data = await res.json().catch(() => ({}));
          if (cancelled) return;
          if (res.ok) {
            if (data.meetingEnded) {
              void finish('unavailable');
              return;
            }
            if (role === 'user' && !data.meetingStarted) {
              onWaitingRef.current?.(data.creatorName || 'Your creator');
              void finish('unavailable');
              return;
            }
            if (data.meetingEndsAt) {
              resolvedEndsAt = String(data.meetingEndsAt);
              setEndsAtIso(resolvedEndsAt);
            }
          }
        }

        // Creator must have meetingEndsAt from startMeeting — no timer without it
        if (role === 'creator' && !resolvedEndsAt) {
          console.error('[DailyCall] missing meetingEndsAt — Join did not start the session');
          void finish('unavailable');
          return;
        }

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

        const handleAppMessage = (ev: { data?: BeepMuteMsg }) => {
          const data = ev?.data;
          if (!data || data.type !== 'reachly-beep-mute') return;
          setBeepMuted(Boolean(data.muted));
        };

        newCallFrame.on('left-meeting', handleLeave);
        newCallFrame.on('app-message', handleAppMessage as (ev: unknown) => void);
        await newCallFrame.join({ url });
        if (cancelled) return;
        joinedRef.current = true;

        // Arm session timer only after Join + in-room
        if (resolvedEndsAt) {
          setEndsAtIso(resolvedEndsAt);
          setRemainingSec(
            Math.max(0, Math.floor((new Date(resolvedEndsAt).getTime() - Date.now()) / 1000))
          );
          setTimerArmed(true);
        }
        resumeMeetingAudio();
      } catch (err) {
        console.error('[DailyCall] init:', err);
      }
    };

    void initFrame();

    return () => {
      cancelled = true;
      stopContinuousBeep();
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

  const toggleBeepMute = () => {
    if (role !== 'creator') return;
    const next = !beepMuted;
    setBeepMuted(next);
    try {
      callRef.current?.sendAppMessage({ type: 'reachly-beep-mute', muted: next } satisfies BeepMuteMsg, '*');
    } catch {
      /* ignore */
    }
  };

  const timerLabel =
    timerArmed && remainingSec != null ? formatCountdown(remainingSec) : null;
  const critical = remainingSec != null && remainingSec <= 10;
  const warning = remainingSec != null && remainingSec <= 30 && !critical;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0b] p-0 md:p-8">
      {timerLabel != null && (
        <div className="absolute top-4 left-4 z-[10000] flex items-center gap-2 sm:top-5 sm:left-5">
          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-xl transition-colors ${
              critical
                ? 'border-red-500/50 bg-red-600 text-white shadow-red-900/40'
                : warning
                  ? 'border-amber-400/40 bg-amber-500 text-white shadow-amber-900/30'
                  : 'border-white/10 bg-zinc-900/90 text-white shadow-black/40'
            }`}
            aria-live="polite"
            aria-label={`Time remaining ${timerLabel}`}
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                critical
                  ? 'bg-white/20'
                  : warning
                    ? 'bg-white/20'
                    : 'bg-white/10'
              }`}
            >
              <Clock className={`size-4 ${critical ? 'animate-pulse' : ''}`} strokeWidth={2.25} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                {critical ? 'Ending soon' : warning ? 'Wrap up' : 'Session time'}
              </span>
              <span className="mt-1.5 font-mono text-lg font-bold tracking-[0.08em] tabular-nums sm:text-xl">
                {timerLabel}
              </span>
            </div>
          </div>

          {role === 'creator' && (
            <button
              type="button"
              onClick={toggleBeepMute}
              className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-lg backdrop-blur-xl transition-colors cursor-pointer ${
                beepMuted
                  ? 'border-white/15 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'border-white/10 bg-zinc-900/90 text-white hover:bg-zinc-800'
              }`}
              title={beepMuted ? 'Unmute end-of-session beeps' : 'Mute end-of-session beeps for everyone'}
              aria-label={beepMuted ? 'Unmute beeps' : 'Mute beeps'}
            >
              {beepMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          )}

          {beepMuted && role === 'user' && (
            <div className="flex h-11 items-center rounded-2xl border border-white/10 bg-zinc-900/80 px-3 text-[11px] font-medium text-zinc-400">
              Beeps muted by creator
            </div>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="h-full w-full max-w-[1400px] overflow-hidden bg-[#111113] shadow-2xl md:rounded-2xl md:ring-1 md:ring-white/10"
      />
    </div>
  );
}
