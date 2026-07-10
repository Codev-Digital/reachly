'use client';

import { useState, useEffect } from 'react';
import LoadingAnimation from '@/components/LoadingAnimation';
import { motion } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';
import UserTopBar from '@/components/UserTopBar';
import LoginToExplore from '@/components/LoginToExplore';

export default function UserSaved() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const filters = ['All', 'Fitness', 'Lifestyle', 'Fashion', 'Tech', 'Business', 'Beauty', 'Education', 'Food'];

  const creators = [
    { id: 1, name: 'Kainat Aslam', username: '@kainataslam.ka', tag: 'Influencer', rating: 4.9, bio: 'Ayesha Khan is one of Pakistan’s leading fashion and lifestyle content creators...', price: '1200', image: '/merium in creators section.png', cover: '/merium.png' },
    { id: 2, name: 'Kainat Aslam', username: '@kainataslam.ka', tag: 'Influencer', rating: 4.9, bio: 'Ayesha Khan is one of Pakistan’s leading fashion and lifestyle content creators...', price: '1200', image: '/merium in creators section.png', cover: '/merium.png' },
    { id: 3, name: 'Kainat Aslam', username: '@kainataslam.ka', tag: 'Influencer', rating: 4.9, bio: 'Ayesha Khan is one of Pakistan’s leading fashion and lifestyle content creators...', price: '1200', image: '/merium in creators section.png', cover: '/merium.png' },
    { id: 4, name: 'Kainat Aslam', username: '@kainataslam.ka', tag: 'Influencer', rating: 4.9, bio: 'Ayesha Khan is one of Pakistan’s leading fashion and lifestyle content creators...', price: '1200', image: '/merium in creators section.png', cover: '/merium.png' },
    { id: 5, name: 'Kainat Aslam', username: '@kainataslam.ka', tag: 'Influencer', rating: 4.9, bio: 'Ayesha Khan is one of Pakistan’s leading fashion and lifestyle content creators...', price: '1200', image: '/merium in creators section.png', cover: '/merium.png' },
    { id: 6, name: 'Kainat Aslam', username: '@kainataslam.ka', tag: 'Influencer', rating: 4.9, bio: 'Ayesha Khan is one of Pakistan’s leading fashion and lifestyle content creators...', price: '1200', image: '/merium in creators section.png', cover: '/merium.png' },
  ];

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) return <LoadingAnimation />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] pb-12">
        <CreatorNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-8">
            <UserSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            <main className="flex-1">
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
              <LoginToExplore />
            </main>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="font-serif text-4xl font-bold text-[#C8A97E] mb-4">Saved Creators</h1>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all border whitespace-nowrap ${
                      activeFilter === filter
                        ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border-[rgba(200,169,126,0.3)]'
                        : 'bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] opacity-70 border-transparent hover:opacity-100'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creators.map((creator) => (
                <div key={creator.id} className="bg-[#1A1A1A] border border-[rgba(200,169,126,0.3)] rounded-2xl overflow-hidden group">
                  <div className="h-56 relative">
                    <img src={creator.cover} alt={creator.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 bg-[#0C0C0C] px-2.5 py-1 rounded-full text-xs font-sans text-[#C8A97E]">
                      {creator.tag}
                    </div>
                    <button className="absolute top-4 right-4 w-8 h-8 bg-[#0C0C0C] rounded-full flex items-center justify-center text-[#C8A97E]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-[#F9F6F2]">{creator.name}</h3>
                        <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{creator.username}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8A97E">
                          <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                        </svg>
                        <span className="font-sans text-xs text-[#F9F6F2] opacity-70">{creator.rating}</span>
                      </div>
                    </div>
                    <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-3 line-clamp-2">
                      {creator.bio}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-sans text-sm text-[#F9F6F2]">
                        Starting from <span className="font-semibold text-[#C8A97E]">{creator.price}</span>
                      </p>
                    </div>
                    <button className="w-full mt-3 bg-[#C8A97E] text-[#0C0C0C] px-4 py-2.5 rounded-full text-sm font-sans font-semibold hover:opacity-90 transition-all">
                      Book Now
                    </button>
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