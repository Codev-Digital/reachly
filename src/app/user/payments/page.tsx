'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';

export default function UserPayments() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const payments = [
    {
      id: 1,
      creator: 'Kainat Aslam',
      session: 'Live Training Session',
      amount: 'PKR 1,200',
      date: 'Sat, 5 Jul 2025',
      status: 'Completed',
      method: 'JazzCash',
    },
    {
      id: 2,
      creator: 'Sana Mir',
      session: 'Yoga Class',
      amount: 'PKR 1,500',
      date: 'Wed, 2 Jul 2025',
      status: 'Completed',
      method: 'EasyPaisa',
    },
    {
      id: 3,
      creator: 'Hamza Ali',
      session: 'Startup Mentoring',
      amount: 'PKR 2,000',
      date: 'Mon, 30 Jun 2025',
      status: 'Completed',
      method: 'Bank Transfer',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
      <CreatorNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <UserSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
          />

          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden mb-4 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg p-2 text-[#C8A97E]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="mb-6">
              <h1 className="font-serif text-4xl font-bold text-[#C8A97E] mb-4">Payment History</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-2">Total Spent</p>
                  <p className="font-serif text-3xl font-bold text-[#C8A97E]">PKR 8,100</p>
                </div>
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-2">This Month</p>
                  <p className="font-serif text-3xl font-bold text-[#C8A97E]">PKR 4,700</p>
                </div>
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-2">Sessions Booked</p>
                  <p className="font-serif text-3xl font-bold text-[#C8A97E]">12</p>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
              <h3 className="font-serif text-xl font-bold text-[#F9F6F2] mb-4">Transactions</h3>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.1)]">
                    <div>
                      <p className="font-sans text-base text-[#F9F6F2]">{payment.session} with {payment.creator}</p>
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-60">{payment.date} • {payment.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-sans text-base font-semibold text-[#C8A97E]">{payment.amount}</p>
                      <p className={`font-sans text-xs ${
                        payment.status === 'Completed' ? 'text-[#34d399]' : 'text-[#f87171]'
                      }`}>
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
