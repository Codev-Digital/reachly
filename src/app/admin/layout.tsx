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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
