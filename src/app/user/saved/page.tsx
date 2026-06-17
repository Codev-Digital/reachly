'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';
import UserTopBar from '@/components/UserTopBar';

export default function UserSaved() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('creators');

  const tabs = [
    { label: 'Creators (5)', value: 'creators' },
    { label: 'Collections (1)', value: 'collections' },
  ];

  const creators = [
    { name: 'Kainat Aslam', category: 'Lifestyle & Fashion', price: 'PKR 1,200', image: '/merium.png' },
    { name: 'Sana Mir', category: 'Health & Wellness', price: 'PKR 1,500', image: '/merium.png' },
    { name: 'Hamza Ali', category: 'Business & Career', price: 'PKR 2,000', image: '/merium.png' },
    { name: 'Ayesha Khan', category: 'Style & Fashion', price: 'PKR 1,000', image: '/merium.png' },
    { name: 'Omar Farooq', category: 'Fitness & Nutrition', price: 'PKR 1,800', image: '/merium.png' },
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

            <UserTopBar searchPlaceholder="Search Creators" />

            <div className="mb-6">
              <h1 className="font-serif text-4xl font-bold text-[#C8A97E] mb-4">Saved</h1>
              
              <div className="flex gap-2">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creators.map((creator, idx) => (
                <div key={idx} className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl overflow-hidden">
                  <div className="h-40 relative">
                    <img src="/yoga.jpg" alt="Yoga" className="w-full h-full object-cover" />
                    <button className="absolute top-3 right-3 w-8 h-8 bg-[#0C0C0C] rounded-full flex items-center justify-center text-[#C8A97E]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-sans text-sm font-medium text-[#F9F6F2]">{creator.name}</p>
                        <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{creator.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-sans text-sm text-[#C8A97E]">From {creator.price}</p>
                      <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-3 py-1.5 rounded-full text-xs font-sans">
                        View profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
