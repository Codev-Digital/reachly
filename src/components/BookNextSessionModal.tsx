'use client';

import { useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';
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
  const [lockedSlots, setLockedSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState('');
  const [reservationToken, setReservationToken] = useState('');
  const [reservingSlot, setReservingSlot] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState<{ date: string; time: string } | null>(null);

  const releaseReservation = (token: string) => {
    if (!target) return;
    void fetch(`/api/creators/${encodeURIComponent(target.creatorUsername)}/availability/reservations`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).catch((releaseError) => console.error('Unable to release package session slot:', releaseError));
  };

  // Load the creator's free slots whenever the date changes
  useEffect(() => {
    if (!target || !date) return;
    let cancelled = false;
    const loadSlots = async () => {
      try {
        const response = await fetch(
          `/api/creators/${target.creatorUsername}/availability?date=${date}&sessionId=${target.sessionTypeId}${
            reservationToken ? `&reservationToken=${encodeURIComponent(reservationToken)}` : ''
          }`,
          { cache: 'no-store' }
        );
        const data = response.ok ? await response.json() : { slots: [], lockedSlots: [] };
        if (!cancelled) {
          setSlots(data.slots || []);
          setLockedSlots(data.lockedSlots || []);
        }
      } catch {
        if (!cancelled) {
          setSlots([]);
          setLockedSlots([]);
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };
    void loadSlots();
    const interval = window.setInterval(loadSlots, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [target, date, reservationToken]);

  const reset = () => {
    if (reservationToken) releaseReservation(reservationToken);
    setDate('');
    setSlots([]);
    setLockedSlots([]);
    setSlot('');
    setReservationToken('');
    setReservingSlot(false);
    setLoadingSlots(false);
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
          reservationToken,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBooked({ date, time: slot });
        setReservationToken('');
      } else {
        setError(data.error || 'Could not book this session.');
        if (reservationToken) releaseReservation(reservationToken);
        setReservationToken('');
        setSlot('');
      }
    } catch {
      if (reservationToken) releaseReservation(reservationToken);
      setReservationToken('');
      setSlot('');
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
                    if (reservationToken) releaseReservation(reservationToken);
                    setDate(e.target.value);
                    setSlots([]);
                    setLockedSlots([]);
                    setSlot('');
                    setReservationToken('');
                    setLoadingSlots(Boolean(e.target.value));
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
                  ) : slots.length === 0 && lockedSlots.length === 0 ? (
                    <p className="text-xs font-semibold text-gray-500">No free times on this day. Try another date.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                      {[...slots, ...lockedSlots].map((s) => {
                        const isLocked = lockedSlots.includes(s);
                        return (
                        <button
                          key={s}
                          type="button"
                          disabled={reservingSlot}
                          onClick={async () => {
                            if (isLocked) {
                              toast.info('This slot is reserved by another user. Please choose another slot.');
                              return;
                            }
                            if (!target) return;
                            if (reservationToken) releaseReservation(reservationToken);
                            setReservationToken('');
                            setSlot('');
                            setReservingSlot(true);
                            const token = globalThis.crypto.randomUUID();
                            try {
                              const response = await fetch(
                                `/api/creators/${encodeURIComponent(target.creatorUsername)}/availability/reservations`,
                                {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    sessionId: target.sessionTypeId,
                                    date,
                                    time: s,
                                    token,
                                  }),
                                }
                              );
                              const data = await response.json();
                              if (!response.ok || !data.success) {
                                releaseReservation(token);
                                toast.error(data.error || 'This slot is no longer available.');
                                return;
                              }
                              setReservationToken(token);
                              setSlot(s);
                            } catch (error) {
                              console.error('Unable to reserve package session slot:', error);
                              releaseReservation(token);
                              toast.error('Unable to reserve this slot. Please try again.');
                            } finally {
                              setReservingSlot(false);
                            }
                          }}
                          className={`relative rounded-xl border py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                            isLocked
                              ? 'border-gray-200 bg-gray-50 text-gray-400'
                              : slot === s
                              ? 'border-[#0012FF] bg-[#0012FF] text-white'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-[#0012FF]/50'
                          }`}
                          aria-label={isLocked ? `${s}, reserved by another user` : s}
                        >
                          {s}
                          {isLocked && <LockKeyhole className="absolute right-1 top-1 h-3.5 w-3.5 text-gray-400" aria-hidden="true" />}
                        </button>
                        );
                      })}
                      </div>
                      {lockedSlots.length > 0 && (
                        <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
                          <LockKeyhole className="h-3 w-3" aria-hidden="true" />
                          Reserved slots are released after 15 minutes if not booked.
                        </p>
                      )}
                    </>
                  )}
                </div>

                {error && <FormError className="mt-4">{error}</FormError>}

                <div className="mt-8 flex justify-end gap-3">
                  <Button variant="outline" onClick={close} className="px-6">
                    Cancel
                  </Button>
                  <Button
                    onClick={confirm}
                    disabled={!date || !slot || lockedSlots.includes(slot) || saving || reservingSlot}
                    className="px-6"
                  >
                    {saving ? 'Booking...' : reservingSlot ? 'Reserving...' : 'Confirm booking'}
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
