'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface GuestLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'booking' | 'favourites';
  callbackUrl?: string;
}

export default function GuestLoginModal({
  isOpen,
  onClose,
  mode = 'booking',
  callbackUrl,
}: GuestLoginModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    const url = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login';
    router.push(url);
  };

  const handleSignup = () => {
    const url = callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/signup';
    router.push(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="guest-login-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] p-4 cursor-pointer"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer z-10"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Illustration */}
            <div className="w-40 sm:w-52 h-auto my-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mode === 'booking' ? '/assets/login.png' : '/assets/favourites.png'}
                alt={mode === 'booking' ? 'Login Required' : 'Save to Favourites'}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
              {mode === 'booking' ? 'Login Required' : 'Save to Favourites'}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
              {mode === 'booking'
                ? 'Please log in or sign up to continue booking this event with the creator.'
                : 'Create a free account or log in to save your favourite creators and access them anytime.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              <button
                onClick={handleLogin}
                className="w-full py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={handleSignup}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
