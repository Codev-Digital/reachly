'use client';

import { useState, createContext, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { AnimatePresence, motion } from 'framer-motion';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import UserNavbar from '@/components/UserNavbar';
import OnboardingNavbar from '@/components/OnboardingNavbar';

export interface SessionQuestion {
  id?: string;
  _id?: string;
  type: 'multiple_choice' | 'short_answer';
  question: string;
  options?: string[];
  required?: boolean;
}

export interface SessionType {
  id: string;
  title: string;
  duration: string;
  price: number;
  discountedPrice?: number | null;
  description: string;
  features: string[];
  questions?: SessionQuestion[];
  isPackage?: boolean;
  packageSessions?: number;
  packagePeriod?: 'week' | 'month';
}

export interface BookingAnswer {
  questionId: string;
  question: string;
  answer: string | string[];
  type: 'multiple_choice' | 'short_answer';
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
  city?: string;
  country?: string;
  languages?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
  };
  stats?: {
    sessionsCompleted?: number;
    happyCustomers?: number;
    totalCategories?: number;
  };
}

interface BookingState {
  creator: CreatorInfo | null;
  selectedSession: SessionType | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  userDetails: UserDetails;
  /** Answers to the selected session's intake questions */
  answers: BookingAnswer[];
  step: number;
  bookingRef?: string;
}

const STORAGE_KEY = 'reachly_booking_state';
const DRAFT_KEY = 'reachly_booking_draft';

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
      answers: Array.isArray(parsed.answers) ? parsed.answers : [],
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
  answers: [],
  step: 1,
};

const BookingContext = createContext<{
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
  nextStep: () => void;
  prevStep: () => void;
  saveToStorage: () => void;
  saveDraft: () => void;
  isDraftSaved: boolean;
  userData: any;
} | null>(null);

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
}

export default function BookSessionLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [booking, setBookingRaw] = useState<BookingState>(emptyBooking);
  const [userData, setUserData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'creator' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const handleClose = () => {
    setShowLoginModal(false);
    window.location.href = '/explore-creators';
  };
  const lastDraftRef = useRef('');

  // On mount: restore from localStorage draft first, then sessionStorage
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const restored = deserializeBooking(draft);
        if (restored) {
          setBookingRaw(restored);
          lastDraftRef.current = draft;
          setIsDraftSaved(true);
          return;
        }
      }
      const session = sessionStorage.getItem(STORAGE_KEY);
      if (session) {
        const restored = deserializeBooking(session);
        if (restored) setBookingRaw(restored);
      }
    } catch { }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep sessionStorage in sync + mark draft dirty when booking changes
  useEffect(() => {
    try {
      const serialized = serializeBooking(booking);
      sessionStorage.setItem(STORAGE_KEY, serialized);
      if (isDraftSaved && lastDraftRef.current && serialized !== lastDraftRef.current) {
        setIsDraftSaved(false);
      }
    } catch { }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking]);

  // Check authentication status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('reachly_user_me_cache');
        if (cached) {
          const data = JSON.parse(cached);
          setIsLoggedIn(true);
          setUserData(data);
          const isCreator = 
            Boolean(data.creatorProfile) && 
            (data.user?.approvalStatus === 'approved' || data.user?.approvalStatus === 'active' || data.creatorProfile?.isProfileComplete === true);
          setUserRole(isCreator ? 'creator' : 'user');
        }
      } catch (e) {}
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUserData(data);
          try {
            sessionStorage.setItem('reachly_user_me_cache', JSON.stringify(data));
          } catch (e) {}
          
          const isCreator = 
            Boolean(data.creatorProfile) && 
            (data.user?.approvalStatus === 'approved' || data.user?.approvalStatus === 'active' || data.creatorProfile?.isProfileComplete === true);
          setUserRole(isCreator ? 'creator' : 'user');
        } else {
          setShowLoginModal(true);
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
        setShowLoginModal(true);
      }
    }
    checkAuth();
  }, []);

  // Stable identity: pages list it in effect dependencies, and a new function every render made
  // the step-1 effect refetch the creator in a loop.
  const setBooking: React.Dispatch<React.SetStateAction<BookingState>> = useCallback((action) => {
    setBookingRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      // If booking data changed after a draft was saved, mark draft as unsaved
      const nextSerialized = serializeBooking(next);
      if (lastDraftRef.current && nextSerialized !== lastDraftRef.current) {
        setIsDraftSaved(false);
      }
      return next;
    });
  }, []);

  const saveToStorage = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, serializeBooking(booking));
    } catch { }
  };

  const saveDraft = () => {
    try {
      const serialized = serializeBooking(booking);
      localStorage.setItem(DRAFT_KEY, serialized);
      lastDraftRef.current = serialized;
      setIsDraftSaved(true);
    } catch { }
  };  const nextStep = () => setBooking(b => ({ ...b, step: b.step + 1 }));
  const prevStep = () => setBooking(b => ({ ...b, step: b.step - 1 }));

  return (
    <BookingContext.Provider value={{ booking, setBooking, nextStep, prevStep, saveToStorage, saveDraft, isDraftSaved, userData }}>
      <div className="min-h-screen bg-[#F8F8FA] text-gray-900 flex flex-col overflow-x-hidden">
        {isLoggedIn ? (
          userRole === 'creator' ? (
            <CreatorDashboardNav 
              profilePhoto={userData?.creatorProfile?.profilePhoto || userData?.user?.profilePhoto} 
              displayName={userData?.creatorProfile?.displayName || userData?.user?.name} 
            />
          ) : (
            <UserNavbar 
              profilePhoto={userData?.user?.profilePhoto} 
              displayName={userData?.user?.name} 
            />
          )
        ) : (
          <div className="w-full">
            <OnboardingNavbar showAuthButtons={true} />
          </div>
        )}

        <main className="flex-1">{children}</main>
        <Footer />

        {showLoginModal && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[200] p-4 cursor-pointer"
            onClick={handleClose}
          >
            <div 
              className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Illustration */}
              <div className="w-40 sm:w-52 h-auto my-2">
                <img
                  src="/assets/login.png"
                  alt="Login Required"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
                Login Required
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
                Please log in or sign up to continue booking this session with the creator.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                <button
                  onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)}
                  className="w-full py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BookingContext.Provider>
  );
}

/** What the user actually pays: the discounted price when the creator set one. */
export const sessionPrice = (s: { price: number; discountedPrice?: number | null }) =>
  s.discountedPrice && s.discountedPrice > 0 && s.discountedPrice < s.price ? s.discountedPrice : s.price;
