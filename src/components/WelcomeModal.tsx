'use client';

import Image from 'next/image';
import HeroImage from '@/app/components/HeroImage';

type WelcomePath = 'user' | 'creator';

const cards: { id: WelcomePath; title: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'user',
    title: 'I Want to Book Sessions',
    description: 'Find creators you admire and book personalized video calls to learn, grow and connect.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20" />
      </svg>
    ),
  },
  {
    id: 'creator',
    title: 'I Want to be a Creator',
    description: 'Share your knowledge, connect with your audience and monetize your expertise through 1-on-1 sessions.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="7" r="4" />
        <path d="M3 21v-1a6 6 0 0 1 6-6h1" />
        <path d="m18 14 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z" fill="#0012FF" />
      </svg>
    ),
  },
];

export default function WelcomeModal({
  firstName,
  onChoose,
  loading,
}: {
  firstName: string;
  onChoose: (path: WelcomePath) => void;
  loading: boolean;
}) {
  return (
    <div className="w-full max-w-7xl bg-white rounded-[32px] p-4 lg:p-6 shadow-xl border border-gray-100 min-h-[600px] lg:min-h-[700px] flex flex-col justify-between overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">
        {/* Left side */}
        <div className="lg:col-span-6 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
          <div className="mb-8">
            <Image
              src="/assets/logo1.png"
              alt="Reachly Logo"
              width={120}
              height={40}
              style={{ width: 'auto', height: '40px' }}
              priority
            />
          </div>

          <div className="my-auto max-w-xl mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="font-anton font-bold text-black text-2xl sm:text-3xl md:text-4xl leading-tight uppercase mb-3">
                Welcome to Reachly{firstName ? `, ${firstName}` : ''}
              </h1>
              <p className="font-sans text-gray-400 text-sm">
                What brings you here? Choose your path below.
              </p>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${loading ? 'pointer-events-none opacity-60' : ''}`}>
              {cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onChoose(card.id)}
                  className="group relative text-left rounded-2xl border border-gray-200 bg-white hover:bg-white active:bg-white p-5 sm:p-6 min-h-[200px] transition-all hover:border-[#0012FF] hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer focus:outline-none focus-visible:border-[#0012FF] focus-visible:ring-2 focus-visible:ring-[#0012FF]/20 !opacity-100"
                >
                  <span className="absolute top-4 right-4 text-[#0012FF] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17 17 7M8 7h9v9" />
                    </svg>
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-[#E8E8F8] flex items-center justify-center mb-6 transition-colors">
                    {card.icon}
                  </div>
                  <h2 className="font-sans font-bold text-base text-black mb-2">{card.title}</h2>
                  <p className="font-sans text-sm text-gray-400 leading-relaxed">{card.description}</p>
                </button>
              ))}
            </div>
          </div>
          <div />
        </div>

        {/* Right hero side */}
        <div className="hidden lg:block lg:col-span-6 relative">
          <div className="h-full min-h-[600px] lg:min-h-[700px]">
            <HeroImage />
          </div>
        </div>
      </div>
    </div>
  );
}
