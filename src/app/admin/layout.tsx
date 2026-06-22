'use client';

import CreatorNavbar from '@/components/CreatorNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <CreatorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hamburger Button - Visible on all screens */}
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg p-2 text-[#C8A97E]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex gap-8">
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
