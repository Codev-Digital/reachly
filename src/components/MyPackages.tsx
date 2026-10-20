'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BookNextSessionModal, { type NextSessionTarget } from '@/components/BookNextSessionModal';

interface PackageItem {
  id: string;
  title: string;
  price: number;
  status: 'active' | 'completed';
  sessionsTotal: number;
  sessionsBooked: number;
  sessionsCompleted: number;
  creatorName: string;
  creatorUsername: string;
  creatorPhoto: string;
  sessionTypeId: string;
  canBookNext: boolean;
  nextNumber: number;
  sessions: { number: number; bookingRef: string; date: string; time: string; status: string }[];
}

export default function MyPackages({ nav }: { nav: React.ReactNode }) {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookingFor, setBookingFor] = useState<NextSessionTarget | null>(null);

  const load = () =>
    fetch('/api/user/packages')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setPackages(d?.packages || []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8FA] pb-12 text-black">
      {nav}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          My <span className="text-[#0012FF] font-black">Packages</span>
        </h1>
        <p className="text-sm text-gray-500 mb-8">Book your sessions one after another. The next one unlocks when the current one is completed.</p>

        {loading ? (
          // Keep the navbar mounted and only swap the content, like the other pages
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-56 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-sm">
            <p className="text-gray-500 font-semibold mb-4">You haven&apos;t bought a package yet.</p>
            <Link href="/explore-creators" className="inline-block bg-[#0012FF] text-white px-6 py-2.5 rounded-full text-sm font-bold">
              Explore creators
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {packages.map((p) => (
              <div key={p.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-5">
                  <img src={p.creatorPhoto} alt={p.creatorName} className="w-14 h-14 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold truncate">{p.title}</h2>
                    <p className="text-sm text-gray-500">with {p.creatorName} · PKR {p.price.toLocaleString()}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#EEF2FF] text-[#0012FF]'
                    }`}
                  >
                    {p.status === 'completed' ? 'Completed' : 'In progress'}
                  </span>
                </div>

                <div className="mb-2 flex justify-between text-xs font-semibold text-gray-500">
                  <span>{p.sessionsCompleted} of {p.sessionsTotal} sessions completed</span>
                  <span>{p.sessionsTotal - p.sessionsBooked} left to book</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-5">
                  <div
                    className="h-full bg-[#0012FF] rounded-full transition-all"
                    style={{ width: `${(p.sessionsCompleted / p.sessionsTotal) * 100}%` }}
                  />
                </div>

                {p.sessions.length > 0 && (
                  <ul className="space-y-1.5 mb-5 text-sm">
                    {p.sessions.map((s) => (
                      <li key={s.bookingRef} className="flex items-center justify-between text-gray-600">
                        <span className="font-semibold">Session {s.number}</span>
                        <span>
                          {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {s.time}
                        </span>
                        <span className={`text-xs font-bold capitalize ${s.status === 'completed' ? 'text-emerald-600' : 'text-[#0012FF]'}`}>
                          {s.status === 'completed' ? 'Completed' : 'Upcoming'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {p.status === 'active' &&
                  (p.canBookNext ? (
                    <button
                      onClick={() =>
                        setBookingFor({
                          id: p.id,
                          title: p.title,
                          creatorUsername: p.creatorUsername,
                          sessionTypeId: p.sessionTypeId,
                          nextNumber: p.nextNumber,
                          sessionsTotal: p.sessionsTotal,
                        })
                      }
                      className="inline-block bg-[#0012FF] hover:bg-[#000EB4] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors cursor-pointer"
                    >
                      Book session {p.nextNumber}
                    </button>
                  ) : (
                    <p className="text-xs font-semibold text-gray-400">
                      Session {p.nextNumber} unlocks after session {p.sessionsBooked} is completed.
                    </p>
                  ))}
              </div>
            ))}
          </div>
        )}
      </main>

      <BookNextSessionModal
        target={bookingFor}
        onClose={() => setBookingFor(null)}
        onBooked={() => {
          setLoading(true);
          load();
        }}
      />
    </div>
  );
}
