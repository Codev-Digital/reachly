'use client';

import { useState } from 'react';
import FormInput, { FormError } from '@/components/FormInput';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export interface OutsideBlock {
  id: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  title: string;
}

const emptyForm = { date: '', time: '', durationMinutes: '60', title: '' };

/**
 * Modal to add a session the creator booked outside Reachly. Those times are removed from the
 * slots users can book, so they can never clash with a Reachly booking.
 */
export default function OutsideSessionModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setForm(emptyForm);
      setError('');
      onClose();
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
        onSaved();
      } else {
        setError((await res.json()).error || 'Could not save.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
