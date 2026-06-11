'use client';

import { useRouter } from 'next/navigation';
import CreatorNavbar from '@/components/CreatorNavbar';

export default function CreatorOnboardingStep1() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      {/* Header with Navbar */}
      <CreatorNavbar />

      {/* Progress Steps */}
      <div className="border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            <StepItem num={1} label="Welcome" status="active" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={2} label="Profile" status="upcoming" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={3} label="Sessions" status="upcoming" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={4} label="Pricing" status="upcoming" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={5} label="Availability" status="upcoming" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={6} label="Verification" status="upcoming" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={7} label="Go Live" status="upcoming" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
        {/* Top Section - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12 lg:mb-16">
          {/* Left Column - Text */}
          <div className="flex flex-col justify-center">
            <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm bg-[#141414] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full w-fit mb-4 sm:mb-6">
              Step 1 of 7
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              Welcome to <span className="text-[#C8A97E]">Reachly</span>, Creator
            </h1>
            <p className="font-sans text-[#F9F6F2] text-sm sm:text-base opacity-70 max-w-md">
              Let's set up your creator profile in 5 minutes and get you ready to earn.
            </p>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <img 
              src="/Group 2085668106.png" 
              alt="Hero" 
              className="w-full h-[300px] sm:h-[400px] lg:h-[600px] rounded-[20px] sm:rounded-[30px] object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C8A97E] rounded-full flex items-center justify-center mb-2 sm:mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="sm:w-8 sm:h-8">
                  <path d="M8 5v14l11-7z" fill="#0C0C0C" />
                </svg>
              </div>
              <p className="font-sans text-white text-xs sm:text-sm">30-second walkthrough</p>
              <p className="font-sans text-white text-xs opacity-60">(Coming soon)</p>
            </div>
          </div>
        </div>

        {/* What We Will Cover */}
        <div className="mb-8 sm:mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#C8A97E] mb-6 sm:mb-8">
            What we will cover
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {[
              { 
                title: 'Profile Setup', 
                desc: 'Photo, bio, links', 
                num: '01',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="sm:w-5 sm:h-5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 21c0-3.314 2.686-6 6-6s6 2.686 6 6" />
                </svg>
              },
              { 
                title: 'Session Types', 
                desc: 'What you offer', 
                num: '02',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="sm:w-5 sm:h-5">
                  <path d="M22 11.08V12c0 4.17-2.798 7.74-6.83 9.07-.23.42-.79.45-1.06.1l-2.2-2.83a1 1 0 0 1 .85-1.56c.24-.08.5-.11.77-.07 2.8.34 5.47-1.1 5.47-3.96V8c0-.55.45-1 1-1s1 .45 1 1v1.08" />
                  <path d="M18 11V6c0-2.21-1.79-4-4-4H5c-2.21 0-4 1.79-4 4v12c0 2.21 1.79 4 4 4h7" />
                  <path d="M9 11l2 2 4-4" />
                </svg>
              },
              { 
                title: 'Pricing', 
                desc: 'Set your rates', 
                num: '03',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="sm:w-5 sm:h-5">
                  <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                  <circle cx="9" cy="7" r="1" />
                  <path d="M9 8v6" />
                  <path d="M9 16h.01" />
                  <path d="M14 7h2" />
                  <path d="M14 12h2" />
                </svg>
              },
              { 
                title: 'Availability', 
                desc: 'When you are free', 
                num: '04',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="sm:w-5 sm:h-5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 21c0-3.314 2.686-6 6-6s6 2.686 6 6" />
                </svg>
              },
              { 
                title: 'Verification', 
                desc: 'ID & social proof', 
                num: '05',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="sm:w-5 sm:h-5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              },
              { 
                title: 'Go Live', 
                desc: 'Start earning', 
                num: '06',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="sm:w-5 sm:h-5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v-2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h-2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-xs sm:text-sm font-semibold text-[#F9F6F2]">
                      {item.title}
                    </h3>
                    <span className="text-xs font-serif text-[#C8A97E] opacity-60">{item.num}</span>
                  </div>
                  <p className="font-sans text-[#F9F6F2] text-xs opacity-60 mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="sm:w-5 sm:h-5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xs sm:text-sm font-semibold text-[#C8A97E]">
                PKR 45,000 / month
              </h3>
              <p className="font-sans text-[#F9F6F2] text-xs opacity-60 mt-1">
                Average earnings for active Pakistani creators on Reachly
              </p>
            </div>
          </div>
        </div>

        {/* Let's Go Button */}
        <button
          onClick={() => router.push('/creator-onboarding/step-2')}
          className="w-full bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-base hover:opacity-90 transition-all"
        >
          Let's go
        </button>
      </div>
    </div>
  );
}

function StepItem({ num, label, status }: { num: number; label: string; status: 'completed' | 'active' | 'upcoming' }) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2 min-w-[60px] sm:min-w-[80px]">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-serif text-sm sm:text-base font-semibold transition-all ${
        status === 'completed' 
          ? 'bg-[#141414] text-[#C8A97E] border border-[#C8A97E]' 
          : status === 'active' 
            ? 'bg-[#C8A97E] text-[#0C0C0C]' 
            : 'bg-[#141414] text-[#F9F6F2] border border-[rgba(200,169,126,0.3)] opacity-60'
      }`}>
        {status === 'completed' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2.5" className="sm:w-[22px] sm:h-[22px]">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : num}
      </div>
      <span className={`text-[10px] sm:text-xs font-sans font-medium text-center ${
        status === 'completed' || status === 'active' ? 'text-[#C8A97E]' : 'text-[#F9F6F2] opacity-60'
      }`}>
        {label}
      </span>
    </div>
  );
}
