/** Shared Web Audio helpers for meeting beeps (timer + join nudge). */

function getAudioContext(): AudioContext | null {
  try {
    const w = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
      __reachlyAudioCtx?: AudioContext;
    };
    const Ctx = w.AudioContext || w.webkitAudioContext;
    if (!Ctx) return null;
    if (!w.__reachlyAudioCtx || w.__reachlyAudioCtx.state === 'closed') {
      w.__reachlyAudioCtx = new Ctx();
    }
    return w.__reachlyAudioCtx;
  } catch {
    return null;
  }
}

export function resumeMeetingAudio() {
  const ctx = getAudioContext();
  if (ctx?.state === 'suspended') void ctx.resume();
}

/** Attention beep via shared Web Audio context. */
export function playMeetingBeep(opts?: {
  frequency?: number;
  durationMs?: number;
  volume?: number;
}) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = opts?.frequency ?? 880;
    const vol = opts?.volume ?? 0.28;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    const dur = (opts?.durationMs ?? 200) / 1000;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.start(now);
    osc.stop(now + dur);
  } catch {
    /* ignore — autoplay / unsupported */
  }
}
