'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';
import UserTopBar from '@/components/UserTopBar';
import LoginToExplore from '@/components/LoginToExplore';


export default function UserSettings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bio, setBio] = useState('Tech enthusiast and aspiring content creator. Always looking to learn from the best.');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const tabs = [
    { label: 'Profile', icon: true },
    { label: 'Account', icon: true },
    { label: 'Notifications', icon: true },
    { label: 'Privacy', icon: true },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#C8A97E]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

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
              <h1 className="font-serif text-4xl font-bold text-[#C8A97E] mb-4">Account Settings</h1>
              
              <div className="flex gap-2 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab.label)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans transition-all border ${
                      activeTab === tab.label
                        ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border-[rgba(200,169,126,0.3)]'
                        : 'bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] opacity-70 border-transparent hover:opacity-100'
                    }`}
                  >
                    {tab.icon && (
                      <>
                        {tab.label === 'Profile' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="8" r="3" />
                            <path d="M4 20c1-4 5-6 8-6s7 2 8 6" />
                          </svg>
                        )}
                        {tab.label === 'Account' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M5 21v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1" />
                          </svg>
                        )}
                        {tab.label === 'Notifications' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
                          </svg>
                        )}
                        {tab.label === 'Privacy' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                          </svg>
                        )}
                      </>
                    )}
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'Profile' && (
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <h3 className="font-serif text-lg font-bold text-[#F9F6F2] mb-4">Profile Information</h3>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img src="/merium in creators section.png" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#C8A97E] rounded-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0C0C0C" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="font-sans text-sm text-[#F9F6F2]">Sarah Johnson</p>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-70">sarah@example.com</p>
                      <button className="text-xs text-[#C8A97E] font-sans">Change photo</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="font-sans text-xs text-[#F9F6F2] opacity-70 block mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Sarah Johnson"
                        className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-sans text-xs text-[#F9F6F2] opacity-70 block mb-2">Username</label>
                      <input
                        type="text"
                        defaultValue="sarah124"
                        className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="font-sans text-xs text-[#F9F6F2] opacity-70 block mb-2">Bio</label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none resize-none"
                    />
                    <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mt-1 text-right">{bio.length}/300</p>
                  </div>

                  <div className="mb-6">
                    <label className="font-sans text-xs text-[#F9F6F2] opacity-70 block mb-2">Location</label>
                    <input
                      type="text"
                      defaultValue="Karachi, Pakistan"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-[#C8A97E] text-[#0C0C0C] px-6 py-2.5 rounded-full text-sm font-sans font-semibold">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'Account' && (
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#C8A97E] mb-3">Email Address</h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          defaultValue="sara@email.com"
                          className="flex-1 bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                        />
                        <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-3 py-2 rounded-lg text-xs font-sans">
                          Verify
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#C8A97E] mb-3">Phone (WhatsApp)</h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="tel"
                          defaultValue="+92 300 1234567"
                          className="flex-1 bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                        />
                        <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-3 py-2 rounded-lg text-xs font-sans">
                          Verify
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#C8A97E] mb-3">Change Password</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="password"
                          placeholder="Current password"
                          className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button className="bg-[#C8A97E] text-[#0C0C0C] px-6 py-2.5 rounded-full text-sm font-sans font-semibold">
                        Update Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Notifications' && (
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#F9F6F2] mb-1">Allow Notifications</h3>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-70">Choose how and where you want to receive notifications.</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-[rgba(255,255,255,0.1)] peer-checked:bg-[#C8A97E] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#0C0C0C] after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Privacy' && (
                <div className="space-y-4">
                  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-bold text-[#F9F6F2] mb-4">Privacy</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.1)]">
                        <div>
                          <h4 className="font-serif text-base font-semibold text-[#F9F6F2] mb-1">Public profile</h4>
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-70">Allow others to see your profile and activity</p>
                        </div>
                        <div className="relative">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-[rgba(255,255,255,0.1)] peer-checked:bg-[#C8A97E] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#0C0C0C] after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-serif text-base font-semibold text-[#F9F6F2] mb-1">Hide reviews I left</h4>
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-70">Keep your reviews anonymous to other users</p>
                        </div>
                        <div className="relative">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-[rgba(255,255,255,0.1)] peer-checked:bg-[#C8A97E] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#0C0C0C] after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-bold text-[#F9F6F2] mb-4">Data & Account</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.1)]">
                        <div>
                          <h4 className="font-serif text-base font-semibold text-[#F9F6F2] mb-1">Download my data</h4>
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-70">Get a copy of all your Reachly data</p>
                        </div>
                        <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-3 py-2 rounded-lg text-xs font-sans">
                          Request Export
                        </button>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="bg-[rgba(248,113,113,0.1)] text-[#f87171] px-4 py-2 rounded-lg text-xs font-sans font-semibold"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.main>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-serif text-xl font-semibold text-[#F9F6F2] mb-2">Delete your account?</h2>
            <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-6">
              This action cannot be undone. All your data, bookings, and reviews will be permanently deleted. Are you sure?
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2.5 rounded-full text-sm font-sans"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-[#f87171] text-[#0C0C0C] px-4 py-2.5 rounded-full text-sm font-sans font-semibold hover:opacity-90 transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
