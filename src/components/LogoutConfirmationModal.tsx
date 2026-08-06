'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';

export default function LogoutConfirmationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[150] p-4">
      <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Illustration */}
        <div className="w-40 sm:w-52 h-auto my-2">
          <Image
            src="/assets/logout.webp"
            alt="Logout"
            width={220}
            height={160}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
          Are You Sure?
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
          Are you sure you want to logout of your account?
        </p>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full font-bold text-xs sm:text-sm text-center transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onClose();
              if (typeof window !== 'undefined') {
                document.cookie.split(";").forEach((c) => {
                  document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                localStorage.clear();
                sessionStorage.clear();
              }
              signOut({ callbackUrl: '/' });
            }}
            className="flex-1 py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-xs sm:text-sm text-center transition-all shadow-md active:scale-98 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
