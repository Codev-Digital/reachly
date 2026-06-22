'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function CreatorNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/me')
        .then(res => res.json())
        .then(data => setUserData(data))
        .catch(err => console.error('Error fetching user data:', err));
    }
  }, [status]);

  const handleDashboardClick = async () => {
    let currentUserData = userData;
    // If user data not loaded yet, fetch it
    if (!currentUserData) {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          currentUserData = await res.json();
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        return;
      }
    }

    if (currentUserData) {
      // Check if user is pending approval first
      if (currentUserData.user.approvalStatus === 'pending') {
        router.push('/creators/pending-approval');
        return;
      }
      
      // If user has a creator profile and it's complete and approved → go to creator dashboard
      if (currentUserData.creatorProfile && currentUserData.creatorProfile.isProfileComplete && currentUserData.user.approvalStatus === 'approved') {
        router.push('/creators/dashboard');
        return;
      }
      
      // If user has a creator profile but it's not complete OR onboardingStep >0 → go to creator onboarding
      if (currentUserData.creatorProfile || currentUserData.user.onboardingStep > 0) {
        // But first check if they're not pending (we did that already)
        router.push('/creator-onboarding/step-1');
        return;
      }

      // Otherwise, go to user dashboard
      router.push('/user/dashboard');
    }
  };

  const menuVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <header className="border-b border-[rgba(255,255,255,0.08)] bg-[#0C0C0C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Top Navbar */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl font-bold">
            <span className="text-[#C8A97E]">Reach</span>
            <span className="text-[#F9F6F2]">ly</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex gap-8 xl:gap-10 items-center">
            <Link
              href="/explore-creators"
              className={`font-inter text-base font-medium transition-colors ${
                pathname === '/explore-creators'
                  ? 'text-[#C8A97E]'
                  : 'text-[#F9F6F2] hover:text-[#C8A97E]'
              }`}
            >
              Explore Creators
            </Link>

            <Link
              href="/how-it-works"
              className={`font-inter text-base font-medium transition-colors ${
                pathname === '/how-it-works'
                  ? 'text-[#C8A97E]'
                  : 'text-[#F9F6F2] hover:text-[#C8A97E]'
              }`}
            >
              How it Works
            </Link>

            <Link
              href="/for-creators"
              className={`font-inter text-base font-medium transition-colors ${
                pathname === '/for-creators'
                  ? 'text-[#C8A97E]'
                  : 'text-[#F9F6F2] hover:text-[#C8A97E]'
              }`}
            >
              For Creators
            </Link>

            <Link
              href="/about"
              className={`font-inter text-base font-medium transition-colors ${
                pathname === '/about'
                  ? 'text-[#C8A97E]'
                  : 'text-[#F9F6F2] hover:text-[#C8A97E]'
              }`}
            >
              About
            </Link>

            {status === 'authenticated' ? (
              <button
                onClick={handleDashboardClick}
                className="bg-[#C8A97E] text-[#0C0C0C] px-5 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Dashboard
              </button>
            ) : (
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
            )}
          </div>

          {/* Mobile Hamburger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center"
          >
            <div className="relative w-6 h-6">
              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { rotate: 45, top: 12 }
                    : { rotate: 0, top: 4 }
                }
                transition={{ duration: 0.3 }}
                className="absolute left-0 w-6 h-[2px] bg-[#C8A97E] rounded-full"
              />

              <motion.span
                animate={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                  x: isMobileMenuOpen ? -10 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-3 w-6 h-[2px] bg-[#C8A97E] rounded-full"
              />

              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { rotate: -45, top: 12 }
                    : { rotate: 0, top: 20 }
                }
                transition={{ duration: 0.3 }}
                className="absolute left-0 w-6 h-[2px] bg-[#C8A97E] rounded-full"
              />
            </div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="lg:hidden overflow-hidden mt-6"
            >
              <motion.div
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-4 pb-4"
              >
                <motion.div variants={itemVariants}>
                  <Link
                    href="/explore-creators"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block font-inter text-base font-medium ${
                      pathname === '/explore-creators'
                        ? 'text-[#C8A97E]'
                        : 'text-[#F9F6F2]'
                    }`}
                  >
                    Explore Creators
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link
                    href="/how-it-works"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block font-inter text-base font-medium ${
                      pathname === '/how-it-works'
                        ? 'text-[#C8A97E]'
                        : 'text-[#F9F6F2]'
                    }`}
                  >
                    How it Works
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link
                    href="/for-creators"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block font-inter text-base font-medium ${
                      pathname === '/for-creators'
                        ? 'text-[#C8A97E]'
                        : 'text-[#F9F6F2]'
                    }`}
                  >
                    For Creators
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link
                    href="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block font-inter text-base font-medium ${
                      pathname === '/about'
                        ? 'text-[#C8A97E]'
                        : 'text-[#F9F6F2]'
                    }`}
                  >
                    About
                  </Link>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex gap-3 pt-3"
                >
                  {status === 'authenticated' ? (
                    <button
                      onClick={() => {
                        handleDashboardClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex-1 bg-[#C8A97E] text-[#0C0C0C] px-5 py-2 rounded-full font-semibold text-sm"
                    >
                      Dashboard
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          router.push('/login');
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex-1 border border-[rgba(200,169,126,0.5)] text-[#C8A97E] px-5 py-2 rounded-full font-semibold text-sm"
                      >
                        Login
                      </button>

                      <button
                        onClick={() => {
                          router.push('/signup');
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex-1 bg-[#C8A97E] text-[#0C0C0C] px-5 py-2 rounded-full font-semibold text-sm"
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}