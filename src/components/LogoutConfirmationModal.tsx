'use client';

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
  <div className="fixed inset-0 bg-[rgba(0,0,0,0.15)] backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="font-serif text-xl font-semibold text-[#F9F6F2] mb-2">Are you sure you want to logout?</h2>
        <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-6">
          You will be signed out of your Reachly account.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2.5 rounded-full text-sm font-sans"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              signOut({ callbackUrl: '/' });
            }}
            className="flex-1 bg-[#C8A97E] text-[#0C0C0C] px-4 py-2.5 rounded-full text-sm font-sans font-semibold hover:opacity-90 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
