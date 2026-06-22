'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorPendingApproval() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (!res.ok) {
          router.push('/auth/login');
          return;
        }
        const data = await res.json();
        
        // If user is not pending, redirect appropriately
        if (data.user.approvalStatus !== 'pending') {
          if (data.user.approvalStatus === 'approved') {
            router.push('/creators/dashboard');
          } else {
            // If rejected, maybe redirect to a different page?
            router.push('/');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <p className="text-[#C8A97E] font-serif text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-2xl p-8 sm:p-12 text-center">
          {/* Icon */}
          <div className="mx-auto w-24 h-24 rounded-full bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center mb-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#C8A97E] mb-4">
            Your Request Is Sent!
          </h1>

          {/* Description */}
          <p className="font-sans text-[#F9F6F2] text-base sm:text-lg opacity-70 mb-8 leading-relaxed">
            Thank you for submitting your application to Reachly. Our team will review your profile and get back to you shortly. You'll receive an email notification once your account is approved.
          </p>

          {/* Info Card */}
          <div className="bg-[#0C0C0C] border border-[rgba(200,169,126,0.1)] rounded-xl p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0 mt-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-2">
                  What Happens Next?
                </h3>
                <ul className="space-y-2 text-sm font-sans text-[#F9F6F2] opacity-70">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C8A97E] mt-1">•</span>
                    Our admin team will review your profile within 24-48 hours
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C8A97E] mt-1">•</span>
                    You'll receive an approval email with next steps
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C8A97E] mt-1">•</span>
                    Once approved, you can start accepting bookings immediately
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Button to Refresh/Check Status */}
          <button
            onClick={() => window.location.reload()}
            className="w-full font-serif font-semibold py-4 px-8 rounded-full text-base bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] text-[#C8A97E] hover:bg-[rgba(200,169,126,0.2)] transition-all"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}