'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';

export default function UserSettings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { label: 'Profile', value: 'profile' },
    { label: 'Account', value: 'account' },
    { label: 'Notifications', value: 'notifications' },
    { label: 'Privacy', value: 'privacy' },
    { label: 'Payment', value: 'payment' },
    { label: 'Deactivation', value: 'deactivation' },
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
              <h1 className="font-serif text-3xl font-bold text-[#C8A97E] mb-2">Account Settings</h1>
              <p className="font-sans text-sm text-[#F9F6F2] opacity-70">Manage your profile, security, notifications, and account preferences.</p>
            </div>

            <div className="flex gap-2 flex-wrap mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans transition-all border ${
                    activeTab === tab.value
                      ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border-[rgba(200,169,126,0.3)]'
                      : 'bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] opacity-70 border-transparent hover:opacity-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'profile' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img src="/ahad raza mir.png" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-xl text-sm font-sans">
                    Upload photo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="font-sans text-xs text-[#C8A97E] opacity-90 block mb-2">Display Name</label>
                    <input
                      type="text"
                      defaultValue="Bilal Khan"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-[#C8A97E] opacity-90 block mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="bilal@example.com"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="font-sans text-xs text-[#C8A97E] opacity-90 block mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+92 300 1234567"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-[#C8A97E] opacity-90 block mb-2">Location</label>
                    <input
                      type="text"
                      defaultValue="Karachi, Pakistan"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="bg-[#C8A97E] text-[#0C0C0C] px-6 py-2.5 rounded-full text-sm font-sans font-semibold">
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
