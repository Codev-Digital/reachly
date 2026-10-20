'use client';

import { useCallback, useEffect, useState } from 'react';
import FormInput, { FormError } from '@/components/FormInput';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface Block {
  id: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  title: string;
}

const emptyForm = { date: '', time: '', durationMinutes: '60', title: '' };

/**
 * Sessions the creator booked outside Reachly. They are removed from the slots users
 * can book, so they can never clash with a Reachly booking.
 */
export default function OutsideSessions() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/creators/calendar-blocks');
      if (res.ok) setBlocks((await res.json()).blocks || []);
    } catch {}
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setForm(emptyForm);
      setError('');
    }
  };

  const add = async () => {
    setError('');
    if (!form.date || !form.time) {
      setError('Pick a date and a start time.');
      return;
    }
    if (!Number(form.durationMinutes)) {
      setError('Enter how long the session lasts.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/creators/calendar-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, durationMinutes: Number(form.durationMinutes) }),
      });
      if (res.ok) {
        handleOpenChange(false);
        load();
      } else {
        setError((await res.json()).error || 'Could not save.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    await fetch(`/api/creators/calendar-blocks?id=${id}`, { method: 'DELETE' }).catch(() => {});
  };

  return (
    <>
      <div className="w-full bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 mb-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-black">Sessions booked outside Reachly</h2>
            <p className="text-xs text-gray-400">Add them here so those times are hidden from your booking slots.</p>
          </div>
          <Button onClick={() => setOpen(true)} className="rounded-full px-5 py-2 text-xs">
            + Add outside session
          </Button>
        </div>

        {blocks.length > 0 && (
          <ul className="mt-4 divide-y divide-gray-50">
            {blocks.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-700">
                  <span className="font-semibold">
                    {new Date(b.date + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>{' '}
                  · {b.startTime} · {b.durationMinutes} min
                  {b.title && <span className="text-gray-400"> · {b.title}</span>}
                </span>
                <button onClick={() => remove(b.id)} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8">
          <DialogTitle className="text-left text-xl sm:text-2xl font-bold text-black">Add outside session</DialogTitle>
          <DialogDescription className="text-left text-gray-400 mt-1 mb-6">
            This time will be hidden from your booking slots, so nobody can book over it.
          </DialogDescription>

          <div className="space-y-4">
            <FormInput
              label="Date"
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Start time"
                required
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
              <FormInput
                label="Duration"
                required
                type="text"
                inputMode="numeric"
                maxLength={4}
                suffix="min"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value.replace(/\D/g, '') })}
              />
            </div>
            <FormInput
              label="Note (optional)"
              type="text"
              maxLength={100}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Client call"
            />
            {error && <FormError>{error}</FormError>}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" onClick={() => handleOpenChange(false)} className="px-6">
              Cancel
            </Button>
            <Button onClick={add} disabled={saving} className="px-6">
              {saving ? 'Saving...' : 'Block this time'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
