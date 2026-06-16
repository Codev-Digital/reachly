'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Logo from '@/app/components/Logo';

export default function CreatorNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="border-b border-[rgba(255,255,255,0.08)] bg-[#0c0c0c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="font-serif text-2xl font-bold">
            <span className="text-[#C8A97E]">Reach</span>
            <span className="text-[#F9F6F2]">ly</span>
          </Link>
          <div className="hidden lg:flex gap-8 xl:gap-10 items-center">
                    <Link 
                      href="/explore-creators" 
                      className={`font-inter text-base font-medium leading-none tracking-normal transition-colors ${pathname === '/explore-creators' ? 'text-[#C8A97E]' : 'text-[#F9F6F2] hover:text-[#C8A97E]'}`}
                    >
                      Explore Creators
                    </Link>
                    <Link 
                      href="/how-it-works" 
                      className={`font-inter text-base font-medium leading-none tracking-normal transition-colors ${pathname === '/how-it-works' ? 'text-[#C8A97E]' : 'text-[#F9F6F2] hover:text-[#C8A97E]'}`}
                    >
                      How it Works
                    </Link>
                    <Link 
                      href="/for-creators" 
                      className={`font-inter text-base font-medium leading-none tracking-normal transition-colors ${pathname === '/for-creators' ? 'text-[#C8A97E]' : 'text-[#F9F6F2] hover:text-[#C8A97E]'}`}
                    >
                      For Creators
                    </Link>
                    <Link 
                      href="/about" 
                      className={`font-inter text-base font-medium leading-none tracking-normal transition-colors ${pathname === '/about' ? 'text-[#C8A97E]' : 'text-[#F9F6F2] hover:text-[#C8A97E]'}`}
                    >
                      About
                    </Link>
            <div className="flex gap-3">
              <button 
                onClick={() => router.push('/login')}
                className="border border-[rgba(200,169,126,0.5)] text-[#C8A97E] px-5 py-2 rounded-full font-semibold text-sm hover:bg-[rgba(200,169,126,0.1)] transition-all"
              >
                Login
              </button>
              <button 
                onClick={() => router.push('/signup')}
                className="bg-[#C8A97E] text-[#0C0C0C] px-5 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
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
