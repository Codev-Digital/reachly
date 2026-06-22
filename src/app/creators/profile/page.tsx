'use client';

import { motion } from 'framer-motion';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

const CreatorProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
      <CreatorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <CreatorSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            {/* Mobile sidebar toggle button */}
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
            <div className="mb-7">
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#C8A97E] mb-2">Manage Your Profile & Branding</h1>
              <p className="font-sans text-base text-[#F9F6F2] opacity-70">Edit your public profile, customize your branding, and control your visibility.</p>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-xl text-xs font-sans flex items-center gap-2 ${activeTab === 'profile'
                    ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border border-[rgba(200,169,126,0.3)]'
                    : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] opacity-70'
                  }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </button>

              <button
                onClick={() => setActiveTab('branding')}
                className={`px-4 py-2 rounded-xl text-xs font-sans flex items-center gap-2 ${activeTab === 'branding'
                    ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border border-[rgba(200,169,126,0.3)]'
                    : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] opacity-70'
                  }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
                Branding
              </button>

              <button
                onClick={() => setActiveTab('faq')}
                className={`px-4 py-2 rounded-xl text-xs font-sans flex items-center gap-2 ${activeTab === 'faq'
                    ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border border-[rgba(200,169,126,0.3)]'
                    : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] opacity-70'
                  }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                FAQ
              </button>

              <button
                onClick={() => setActiveTab('visibility')}
                className={`px-4 py-2 rounded-xl text-xs font-sans flex items-center gap-2 ${activeTab === 'visibility'
                    ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border border-[rgba(200,169,126,0.3)]'
                    : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] opacity-70'
                  }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                Visibility
              </button>
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <p className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-3">Profile photo</p>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-full flex items-center justify-center">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-5 py-2.5 rounded-xl text-sm font-sans">
                          Upload photo
                        </button>
                      </div>
                      <p className="text-xs font-sans text-[#F9F6F2] opacity-50 mt-2">JPG or PNG, max 50MB</p>
                    </div>

                    <div className="mb-5">
                      <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">Display Name</label>
                      <input
                        type="text"
                        placeholder="e.g Kainat Khan"
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl px-4 py-2.5 text-sm font-sans text-[#F9F6F2] outline-none"
                      />
                    </div>

                    <div className="mb-5">
                      <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">Short Bio (Tagline)</label>
                      <textarea
                        placeholder="A one-line summary of who you are and what you do."
                        rows={2}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl px-4 py-2.5 text-sm font-sans text-[#F9F6F2] outline-none resize-none"
                      />
                      <p className="text-xs font-sans text-[#F9F6F2] opacity-50 mt-1.5">Appears on your card in search results</p>
                    </div>

                    <div className="mb-5">
                      <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">Long Bio</label>
                      <textarea
                        placeholder="Tell followers your story, your expertise, and what they can expect from your sessions."
                        rows={4}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl px-4 py-2.5 text-sm font-sans text-[#F9F6F2] outline-none resize-none"
                      />
                      <p className="text-xs font-sans text-[#F9F6F2] opacity-50 mt-1.5">Up to 1000 characters</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">City</label>
                        <select className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl px-4 py-2.5 text-sm font-sans text-[#F9F6F2] outline-none">
                          <option>Choose your city</option>
                          <option>Karachi</option>
                          <option>Lahore</option>
                          <option>Islamabad</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">Country</label>
                        <input
                          type="text"
                          placeholder="Pakistan"
                          className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl px-4 py-2.5 text-sm font-sans text-[#F9F6F2] outline-none"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-3 block">Languages Spoken</label>
                      <div className="flex flex-wrap gap-2">
                        {['Urdu', 'English', 'Punjabi', 'Sindhi', 'Pashto'].map((lang) => (
                          <button
                            key={lang}
                            className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-3.5 py-1.5 rounded-full text-xs font-sans"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-3 block">Niche / Categories (max 3)</label>
                      <div className="flex flex-wrap gap-2">
                        {['Lifestyle', 'Tech', 'Fitness', 'Fashion', 'Business', 'Education', 'Beauty', 'Food'].map((niche) => (
                          <button
                            key={niche}
                            className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-3.5 py-1.5 rounded-full text-xs font-sans"
                          >
                            {niche}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-3 block">Social Links (optional)</label>
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="instagram.com/yourhandle"
                            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl pl-11 pr-4 py-2.5 text-sm font-sans text-[#F9F6F2] outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              placeholder="tiktok.com/yourhandle"
                              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl pl-11 pr-4 py-2.5 text-sm font-sans text-[#F9F6F2] outline-none"
                            />
                          </div>
                          <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                                <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              placeholder="youtube.com/yourhandle"
                              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl pl-11 pr-4 py-2.5 text-sm font-sans text-[#F9F6F2] outline-none"
                            />
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                              <rect x="2" y="9" width="4" height="12" />
                              <circle cx="4" cy="4" r="2" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="linkedin.com/in/yourprofile"
                            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl pl-11 pr-4 py-2.5 text-sm font-sans text-[#F9F6F2] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-3">Cover photo</p>
                    <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl p-8 flex items-center justify-center">
                      <div className="text-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="mx-auto mb-3">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <p className="text-sm font-sans text-[#F9F6F2] opacity-50">16:9 ratio recommended, drag to reposition (coming soon)</p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">Username / Handle</label>
                      <input
                        type="text"
                        placeholder="e.g @kainatkhan"
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl px-4 py-2.5 text-sm font-sans text-[#F9F6F2] outline-none"
                      />
                      <p className="text-xs font-sans text-[#F9F6F2] opacity-50 mt-1.5">reachly.sk/yourhandle</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-8">
                  <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-8 py-3 rounded-full text-sm font-sans flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button className="flex-1 bg-[#C8A97E] text-[#0C0C0C] py-3 rounded-full text-sm font-sans font-semibold hover:opacity-90 transition-all">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <>
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 mb-8">
                  <div className="mb-4">
                    <h3 className="font-serif text-lg font-bold text-[#C8A97E] mb-1">Custom Welcome Message</h3>
                    <p className="text-sm font-sans text-[#F9F6F2] opacity-60">This message appears on the booking confirmation page after a follower books a session with you. It is their first impression after committing.</p>
                  </div>
                  <textarea
                    placeholder="Thank you for booking a session with me! I am excited to work with you. Before our call, please think about one specific goal you want to achieve. See you soon!"
                    rows={4}
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl px-4 py-3 text-sm font-sans text-[#F9F6F2] outline-none resize-none"
                  />
                  <p className="text-xs font-sans text-[#F9F6F2] opacity-50 mt-2 text-right">160 / 500 characters</p>
                </div>

                <div className="flex items-center gap-4">
                  <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-8 py-3 rounded-full text-sm font-sans flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button className="flex-1 bg-[#C8A97E] text-[#0C0C0C] py-3 rounded-full text-sm font-sans font-semibold hover:opacity-90 transition-all">
                    Continue
                  </button>
                </div>
              </>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-3">
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-xl font-bold text-[#C8A97E]">How does the booking process work?</h3>
                    <div className="flex items-center gap-2">
                      <button className="text-[#C8A97E] p-1">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="text-[#F9F6F2] opacity-50 p-1">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-sans text-[#F9F6F2] opacity-80">We provide a full range of digital marketing services, including SEO, social media marketing, content marketing, PPC advertising, email marketing, web design, and analytics.</p>
                </div>

                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-[#F9F6F2]">What payment methods do you accept?</h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-[#F9F6F2]">Can I cancel or reschedule a session?</h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-[#F9F6F2]">How are creators verified?</h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'visibility' && (
              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                <p className="text-sm font-sans text-[#F9F6F2] opacity-60 mb-5">Control who can find your profile and whether new bookings are accepted.</p>

                <div className="space-y-4">
                  <div className="bg-[rgba(255,255,255,0.05)] border border-[#C8A97E] rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-[#C8A97E] rounded-full border-2 border-[#C8A97E] flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-[#141414] rounded-full" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#C8A97E] mb-1">Public</h4>
                        <p className="text-sm font-sans text-[#F9F6F2] opacity-60">Your profile is discoverable on Reachly search and explore. Anyone can find and book with you.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 border-2 border-[rgba(200,169,126,0.5)] rounded-full mt-0.5" />
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#F9F6F2] opacity-80 mb-1">Private</h4>
                        <p className="text-sm font-sans text-[#F9F6F2] opacity-60">Your profile is hidden from search. Only people with your direct booking link can view and book.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 border-2 border-[rgba(200,169,126,0.5)] rounded-full mt-0.5" />
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#F9F6F2] opacity-80 mb-1">Paused</h4>
                        <p className="text-sm font-sans text-[#F9F6F2] opacity-60">Your profile remains visible but booking is disabled. Useful when you are taking a break.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
