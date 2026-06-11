'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Logo from '../components/Logo';
import HeroImage from '../components/HeroImage';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          {/* Left Content */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-16 flex flex-col justify-center">
            <div className="mb-10 sm:mb-12 lg:mb-16">
              <Logo />
            </div>
            
            <div className="max-w-md mx-auto w-full">
              <p className="font-sans text-[#C8A97E] text-xs sm:text-sm font-medium mb-3 sm:mb-4 text-center">What brings you here today?</p>
              
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#C8A97E] mb-3 sm:mb-4 text-center">
                Welcome!
              </h1>
              <p className="font-sans text-[#F9F6F2] text-base sm:text-lg mb-6 sm:mb-8 px-4 text-center">
                Choose your path below.
              </p>
              
              {/* Path Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
                <div 
                  className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-5 cursor-pointer hover:border-opacity-50 transition-all"
                  onClick={() => router.push('/welcome')}
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
                      <Image
                        src="/Frame 2085668077.svg"
                        alt="User"
                        width={28}
                        height={28}
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                        I want to book sessions
                      </h3>
                      <p className="font-sans text-[#F9F6F2] text-xs leading-5 opacity-80">
                        Find creators you admire and book personalized video calls.
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-5 cursor-pointer hover:border-opacity-50 transition-all"
                  onClick={() => router.push('/creator-onboarding/step-1')}
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
                      <Image
                        src="/Frame 2085668077.svg"
                        alt="Creator"
                        width={28}
                        height={28}
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                        I want to be a creator
                      </h3>
                      <p className="font-sans text-[#F9F6F2] text-xs leading-5 opacity-80">
                        Share your knowledge and monetize your expertise through 1-on-1 sessions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full border-2 border-[#C8A97E] text-[#C8A97E] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:bg-[#C8A97E] hover:text-[#0C0C0C] transition-all"
                >
                  Back to Login
                </button>
              </div>
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
