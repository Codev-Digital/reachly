'use client';

import { useEffect, useState } from 'react';
import FormInput, { FormError } from '@/components/FormInput';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { formatISODay, pktTodayISO } from '@/lib/pkt';

export interface NextSessionTarget {
  id: string; // package purchase id
  title: string;
  creatorUsername: string;
  sessionTypeId: string;
  nextNumber: number;
  sessionsTotal: number;
}

/**
 * "Book session N" for a package: pick a date and one of the creator's free slots, done.
 * Name, contact details and answers are copied from the user's previous session on the server.
 */
export default function BookNextSessionModal({
  target,
  onClose,
  onBooked,
}: {
  target: NextSessionTarget | null;
  onClose: () => void;
  onBooked: () => void;
}) {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState<{ date: string; time: string } | null>(null);

  // Load the creator's free slots whenever the date changes
  useEffect(() => {
    if (!target || !date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setSlot('');
    fetch(`/api/creators/${target.creatorUsername}/availability?date=${date}&sessionId=${target.sessionTypeId}`)
      .then((r) => (r.ok ? r.json() : { slots: [] }))
      .then((d) => !cancelled && setSlots(d.slots || []))
      .catch(() => !cancelled && setSlots([]))
      .finally(() => !cancelled && setLoadingSlots(false));
    return () => {
      cancelled = true;
    };
  }, [target, date]);

  const reset = () => {
    setDate('');
    setSlots([]);
    setSlot('');
    setError('');
    setBooked(null);
  };

  const close = () => {
    const wasBooked = !!booked;
    reset();
    onClose();
    if (wasBooked) onBooked();
  };

  const confirm = async () => {
    if (!target || !date || !slot) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packagePurchaseId: target.id,
          username: target.creatorUsername,
          date,
          time: slot,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) setBooked({ date, time: slot });
      else setError(data.error || 'Could not book this session.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        {target && (
          <>
            <DialogTitle className="text-left text-xl sm:text-2xl font-bold text-black">
              {booked ? 'Session booked!' : `Book session ${target.nextNumber} of ${target.sessionsTotal}`}
            </DialogTitle>
            <DialogDescription className="text-left text-gray-400 mt-1 mb-6">
              {booked
                ? `Session ${target.nextNumber} of "${target.title}" is confirmed.`
                : 'Pick a day and one of the available times (Pakistan time). We’ll use the details from your previous session.'}
            </DialogDescription>

            {booked ? (
              <>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800 font-semibold">
                  {formatISODay(booked.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at{' '}
                  {booked.time} (Pakistan time)
                </div>
                <div className="mt-8 flex justify-end">
                  <Button onClick={close} className="px-8">
                    Done
                  </Button>
                </div>
              </>
            ) : (
              <>
                <FormInput
                  label="Date"
                  required
                  type="date"
                  min={pktTodayISO()}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setError('');
                  }}
                />

                <div className="mt-5">
                  <p className="mb-2 text-[12px] font-medium text-black">Available times</p>
                  {!date ? (
                    <p className="text-xs text-gray-400">Choose a date to see the creator&apos;s free times.</p>
                  ) : loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="h-10 rounded-xl bg-gray-200 animate-pulse" />
                      ))}
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-xs font-semibold text-gray-500">No free times on this day. Try another date.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSlot(s)}
                          className={`rounded-xl border py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                            slot === s
                              ? 'border-[#0012FF] bg-[#0012FF] text-white'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-[#0012FF]/50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {error && <FormError className="mt-4">{error}</FormError>}

                <div className="mt-8 flex justify-end gap-3">
                  <Button variant="outline" onClick={close} className="px-6">
                    Cancel
                  </Button>
                  <Button onClick={confirm} disabled={!date || !slot || saving} className="px-6">
                    {saving ? 'Booking...' : 'Confirm booking'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
