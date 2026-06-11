
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Logo from '../components/Logo';
import HeroImage from '../components/HeroImage';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          {/* Left Content */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-16 flex flex-col justify-center">
            <div className="mb-8 sm:mb-12 lg:mb-16">
              <Logo />
            </div>
            
            <p className="font-sans text-[#C8A97E] text-xs sm:text-sm font-medium mb-3 sm:mb-4">Step 1 of 2</p>
            
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#C8A97E] mb-3 sm:mb-4">
                Welcome to Reach<span className="text-white">ly</span>
              </h1>
              <p className="font-sans text-[#F9F6F2] text-sm sm:text-base">
                What brings you here today? Choose your path below.
              </p>
            </div>

            {/* Path Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10 lg:mb-12">
              <div 
                className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-5 sm:p-6 md:p-8 cursor-pointer hover:border-opacity-50 transition-all"
                onClick={() => router.push('/signup?type=user')}
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
                    <Image
                      src="/Frame 2085668077.svg"
                      alt="User"
                      width={28}
                      height={28}
                      className="sm:w-8 sm:h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                      I want to book sessions
                    </h3>
                    <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm leading-5 sm:leading-6 opacity-80">
                      Find creators you admire and book personalized video calls to learn, grow, and connect.
                    </p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-6 sm:h-6">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#C8A97E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div 
                className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-5 sm:p-6 md:p-8 cursor-pointer hover:border-opacity-50 transition-all"
                onClick={() => router.push('/creator-onboarding/step-1')}
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
                    <Image
                      src="/Frame 2085668077.svg"
                      alt="Creator"
                      width={28}
                      height={28}
                      className="sm:w-8 sm:h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                      I want to be a creator
                    </h3>
                    <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm leading-5 sm:leading-6 opacity-80">
                      Share your knowledge, connect with your audience, and monetize your expertise through 1-on-1 sessions.
                    </p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-6 sm:h-6">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#C8A97E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-[rgba(200,169,126,0.15)]"></div>
              <p className="font-sans text-[#F9F6F2] text-sm sm:text-base pt-4 sm:pt-6 text-center">
                Already have an account? <span className="font-semibold text-[#C8A97E] cursor-pointer" onClick={() => router.push('/login')}>Log In</span>
              </p>
            </div>
          </div>

          {/* Right Side - Hero Image - Visible on tablets and larger */}
          <div className="hidden md:block lg:block">
            <div className="h-full min-h-[400px] md:min-h-[600px] lg:min-h-[800px]">
              <HeroImage />
            </div>
          </div>
          
          {/* Mobile Hero Image - Visible only on mobile */}
          <div className="block md:hidden mt-6">
            <div className="h-[350px] rounded-[20px] overflow-hidden">
              <HeroImage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
