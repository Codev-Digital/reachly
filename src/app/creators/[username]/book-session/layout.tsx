'use client';

import { useState, createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { AnimatePresence, motion } from 'framer-motion';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import UserNavbar from '@/components/UserNavbar';
import OnboardingNavbar from '@/components/OnboardingNavbar';

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
  const [booking, setBookingRaw] = useState<BookingState>(emptyBooking);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'creator' | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
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
    async function checkAuth() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUserData(data);
          
          const isCreator = 
            (data.user?.approvalStatus && data.user?.approvalStatus !== 'none') || 
            (data.user?.onboardingStep && data.user?.onboardingStep > 0);
          setUserRole(isCreator ? 'creator' : 'user');
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
      }
    }
    checkAuth();
  }, []);

  const setBooking: React.Dispatch<React.SetStateAction<BookingState>> = (action) => {
    setBookingRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      // If booking data changed after a draft was saved, mark draft as unsaved
      const nextSerialized = serializeBooking(next);
      if (lastDraftRef.current && nextSerialized !== lastDraftRef.current) {
        setIsDraftSaved(false);
      }
      return next;
    });
  };

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
              profilePhoto={userData?.creatorProfile?.profilePhoto} 
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
      </div>
    </BookingContext.Provider>
  );
}
