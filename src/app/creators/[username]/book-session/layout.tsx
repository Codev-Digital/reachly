'use client';

import { useState, createContext, useContext, ReactNode } from 'react';
import CreatorNavbar from '@/components/CreatorNavbar';
import Footer from '@/components/Footer';

interface SessionType {
  id: string;
  title: string;
  duration: string;
  price: number;
  description: string;
  features: string[];
}

interface BookingState {
  selectedSession: SessionType | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  step: number;
}

const BookingContext = createContext<{
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
  nextStep: () => void;
  prevStep: () => void;
} | null>(null);

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
}

export default function BookSessionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [booking, setBooking] = useState<BookingState>({
    selectedSession: null,
    selectedDate: null,
    selectedTime: null,
    step: 1,
  });

  const nextStep = () => setBooking(b => ({ ...b, step: b.step + 1 }));
  const prevStep = () => setBooking(b => ({ ...b, step: b.step - 1 }));

  return (
    <BookingContext.Provider value={{ booking, setBooking, nextStep, prevStep }}>
      <div className="min-h-screen bg-[#0c0c0c] text-[#F9F6F2] flex flex-col">
        <CreatorNavbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </BookingContext.Provider>
  );
}
