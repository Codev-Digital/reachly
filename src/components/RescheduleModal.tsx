'use client';

import { useState } from 'react';

export default function RescheduleModal({
  isOpen,
  onClose,
  currentSession,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentSession?: { name: string; date: string };
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="font-serif text-xl font-semibold text-[#F9F6F2] mb-2">Reschedule Session</h2>
        <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-6">
          Pick a new date and time for your {currentSession?.name} Session with {currentSession?.name.split(' ')[0]} {currentSession?.name.split(' ')[1]}. They will be notified to confirm
        </p>

        <div className="mb-4">
          <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">Current session</label>
          <div className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.2)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] opacity-70">
            {currentSession?.date}
          </div>
        </div>

        <div className="mb-4">
          <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">New date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">New time</label>
          <div className="relative">
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none appearance-none"
            >
              <option value="">Select a time</option>
              <option value="12:00 AM">12:00 AM</option>
              <option value="12:15 AM">12:15 AM</option>
              <option value="12:30 AM">12:30 AM</option>
              <option value="12:45 AM">12:45 AM</option>
              <option value="01:00 AM">01:00 AM</option>
              <option value="01:15 AM">01:15 AM</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">Reason (optional)</label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none resize-none"
            placeholder="Let them know why you need to reschedule..."
          />
          <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mt-1 text-right">{reason.length}/200</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2.5 rounded-full text-sm font-sans"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#C8A97E] text-[#0C0C0C] px-4 py-2.5 rounded-full text-sm font-sans font-semibold hover:opacity-90 transition-all"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}
