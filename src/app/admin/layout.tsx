'use client';

import AdminNavbar from '@/components/AdminNavbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F8FA] text-black">
      <AdminNavbar />

      {/* Same container as AdminNavbar so the content lines up with the header card */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
