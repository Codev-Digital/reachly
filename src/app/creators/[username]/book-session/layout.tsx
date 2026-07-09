'use client';

import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export interface SessionType {
  id: string;
  title: string;
  duration: string;
  price: number;
  description: string;
  features: string[];
}

interface UserDetails {
  fullName: string;
  email: string;
  whatsapp: string;
  notes: string;
  heardFrom: string;
  whatToDiscuss: string;
  proceedAs: 'guest' | 'login' | 'signup';
}

export interface CreatorInfo {
  id: string;
  name: string;
  username: string;
  displayName: string;
  profilePhoto: string;
  coverPhoto?: string;
  shortBio: string;
  niches: string[];
}

interface BookingState {
  creator: CreatorInfo | null;
  selectedSession: SessionType | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  userDetails: UserDetails;
  step: number;
  bookingRef?: string;
}

const STORAGE_KEY = 'reachly_booking_state';

function serializeBooking(b: BookingState) {
  return JSON.stringify({
    ...b,
    selectedDate: b.selectedDate ? b.selectedDate.toISOString() : null,
  });
}

function deserializeBooking(raw: string): BookingState | null {
  try {
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      selectedDate: parsed.selectedDate ? new Date(parsed.selectedDate) : null,
    };
  } catch {
    return null;
  }
}

const emptyBooking: BookingState = {
  creator: null,
  selectedSession: null,
  selectedDate: null,
  selectedTime: null,
  userDetails: {
    fullName: '',
    email: '',
    whatsapp: '',
    notes: '',
    heardFrom: '',
    whatToDiscuss: '',
    proceedAs: 'guest',
  },
  step: 1,
};

const BookingContext = createContext<{
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
  nextStep: () => void;
  prevStep: () => void;
  saveToStorage: () => void;
} | null>(null);

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
}

export default function BookSessionLayout({ children }: { children: ReactNode }) {
  const [booking, setBookingRaw] = useState<BookingState>(emptyBooking);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'creator' | null>(null);

  // On mount, try to restore from sessionStorage (for auth redirect return)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const restored = deserializeBooking(saved);
        if (restored) {
          setBookingRaw(restored);
        }
      }
    } catch { }
  }, []);

  // Keep sessionStorage in sync whenever booking changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, serializeBooking(booking));
    } catch { }
  }, [booking]);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUserRole(data.user?.role || 'user');
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
      }
    }
    checkAuth();
  }, []);

  const setBooking: React.Dispatch<React.SetStateAction<BookingState>> = (action) => {
    setBookingRaw(action);
  };

  const saveToStorage = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, serializeBooking(booking));
    } catch { }
  };

  const nextStep = () => setBooking(b => ({ ...b, step: b.step + 1 }));
  const prevStep = () => setBooking(b => ({ ...b, step: b.step - 1 }));

  return (
    <BookingContext.Provider value={{ booking, setBooking, nextStep, prevStep, saveToStorage }}>
      <div className="min-h-screen bg-[#F8F8FA] text-gray-900 flex flex-col">
        {/* Public Header */}
        <header className="bg-white border-b border-gray-200/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/assets/logo1.png"
                alt="Reachly"
                className="object-contain h-8 w-auto"
              />
            </Link>

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="/explore-creators" className="text-sm font-semibold text-gray-600 hover:text-[#0012FF] transition-colors">
                Explore Creators
              </Link>
              <Link href="/explore-creators" className="text-sm font-semibold text-gray-600 hover:text-[#0012FF] transition-colors">
                Events
              </Link>
              <Link href="/for-creators" className="text-sm font-semibold text-gray-600 hover:text-[#0012FF] transition-colors">
                For Creators
              </Link>
              <Link href="/about" className="text-sm font-semibold text-gray-600 hover:text-[#0012FF] transition-colors">
                About
              </Link>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link
                  href={userRole === 'creator' ? '/creators/dashboard' : '/user/dashboard'}
                  className="bg-[#0012FF] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#0010d0] transition-all shadow-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-bold text-gray-700 hover:text-[#0012FF] transition-colors px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-[#0012FF] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#0010d0] transition-all shadow-sm"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </BookingContext.Provider>
  );
}
