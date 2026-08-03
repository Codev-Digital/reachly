'use client';

import DailyCall from '@/components/DailyCall';
import { useState } from 'react';

export default function MeetingClient({ url }: { url: string }) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA] p-4">
        <div className="text-center bg-white p-8 sm:p-12 rounded-[32px] shadow-sm max-w-md w-full border border-gray-100 flex flex-col items-center">
          <div className="w-34 h-34 mb-6">
            <img src="/assets/meeting.png" alt="Meeting" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black mb-3 font-sans tracking-tight">Ready to join?</h1>
          <p className="text-gray-500 text-sm font-sans mb-8 leading-relaxed">
            Your meeting is ready. Make sure your camera and microphone are connected before joining.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="w-full bg-[#0012FF] text-white px-8 py-4 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#0012FF]/20"
          >
            Start Meeting
          </button>
        </div>
      </div>
    );
  }

  return <DailyCall url={url} />;
}
