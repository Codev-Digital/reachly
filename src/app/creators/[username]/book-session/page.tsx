'use client';

import CreatorNavbar from '@/components/CreatorNavbar';
import Footer from '@/components/Footer';

export default function BookSessionPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#F9F6F2]">
      <CreatorNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-serif text-3xl font-bold mb-8 text-center">
          Book Your Session
        </h1>
        
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-8">
          <p className="text-center text-white/70">
            Booking flow coming soon!
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
