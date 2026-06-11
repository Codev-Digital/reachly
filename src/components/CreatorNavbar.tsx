'use client';

import { useRouter } from 'next/navigation';
import Logo from '@/app/components/Logo';

export default function CreatorNavbar() {
  const router = useRouter();

  return (
    <header className="border-b border-[rgba(255,255,255,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex justify-between items-center">
          <Logo />
          <div className="hidden lg:flex gap-4 xl:gap-6 items-center">
            <a href="#" className="font-sans text-[#F9F6F2] text-sm hover:text-[#C8A97E] transition">Explore Creators</a>
            <a href="#" className="font-sans text-[#F9F6F2] text-sm hover:text-[#C8A97E] transition">How it Works</a>
            <a href="#" className="font-sans text-[#C8A97E] text-sm">For Creators</a>
            <a href="#" className="font-sans text-[#F9F6F2] text-sm hover:text-[#C8A97E] transition">About</a>
            <div className="flex gap-3">
              <button 
                onClick={() => router.push('/login')}
                className="border border-[rgba(200,169,126,0.3)] text-[#C8A97E] px-4 py-1.5 rounded-full font-semibold text-sm"
              >
                Login
              </button>
              <button 
                onClick={() => router.push('/signup')}
                className="bg-[#C8A97E] text-[#0C0C0C] px-4 py-1.5 rounded-full font-semibold text-sm"
              >
                Sign up
              </button>
            </div>
          </div>
          {/* Mobile menu button */}
          <button className="lg:hidden text-[#C8A97E] text-2xl">☰</button>
        </div>
      </div>
    </header>
  );
}
