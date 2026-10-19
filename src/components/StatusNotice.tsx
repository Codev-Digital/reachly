"use client";

import Link from "next/link";
import OnboardingNavbar from "@/components/OnboardingNavbar";

/** Full-page notice for locked-out accounts (rejected / suspended / deleted). */
export default function StatusNotice({
  title,
  message,
  reason,
  supportHref,
  showNavbar = true,
}: {
  title: string;
  message: string;
  reason?: string;
  supportHref: string;
  showNavbar?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#F7F7FA] flex flex-col justify-between">
      {showNavbar ? (
        <OnboardingNavbar />
      ) : (
        <div className="px-6 py-5">
          <Link href="/">
            <img src="/assets/logo1.png" alt="Reachly" className="h-9 w-auto" />
          </Link>
        </div>
      )}
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="bg-white border border-gray-200/80 rounded-3xl p-8 sm:p-12 text-center max-w-2xl w-full shadow-sm">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-8">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h1 className="font-anton text-2xl sm:text-3xl text-gray-950 mb-4 tracking-wide uppercase">{title}</h1>
          <p className="font-sans text-gray-500 text-sm sm:text-base font-medium mb-6 leading-relaxed max-w-lg mx-auto">
            {message}
          </p>
          {reason && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-2xl p-4 mb-6">
              <span className="font-semibold">Reason:</span> {reason}
            </p>
          )}
          <Link
            href={supportHref}
            className="inline-block w-full bg-[#0012FF] text-white hover:bg-[#0010d0] font-bold py-2.5 px-8 rounded-full text-xs transition-colors shadow-sm"
          >
            Contact Support
          </Link>
        </div>
      </div>
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs font-bold text-gray-400 select-none">
        &copy; {new Date().getFullYear()} Reachly. All rights reserved.
      </footer>
    </div>
  );
}
