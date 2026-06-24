'use client';

import { motion } from 'framer-motion';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

export default function CreatorBookingLinks() {
  const [activeTab, setActiveTab] = useState('All Types');
  const [sourceFilter, setSourceFilter] = useState('Instagram');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const shareTemplates = [
    { name: 'Instagram Bio', icon: 'instagram', text: 'Book a personal style session with me on Reachly! DM me' },
    { name: 'Instagram Story', icon: 'instagramStory', text: 'Swipe up to book a 1-on-1 session with me! Style consu...' },
    { name: 'WhatsApp Status', icon: 'whatsapp', text: 'Book a personal style session with me on Reachly! Style advice...' },
    { name: 'X/Twitter', icon: 'twitter', text: 'Book a personal style session with me on Reachly. DM me' },
  ];

  const trackableLinks = [
    { source: 'Instagram', url: 'https://www.instagram.dev/services-instagram', clicks: 342 },
    { source: 'Youtube', url: 'http://shop.youtube.com/products-youtube', clicks: 342 },
    { source: 'Podcast', url: 'http://shop.custom.org/login-custom', clicks: 342 },
  ];

  const promoCodes = [
    { name: 'STYLE20', discount: '20% off', uses: '23 / 50 used', expiry: 'Expires 2026-08-30', status: 'Active' },
    { name: 'STYLE20', discount: '20% off', uses: '23 / 50 used', expiry: 'Expires 2026-08-30', status: 'Active' },
    { name: 'STYLE20', discount: '20% off', uses: '23 / 50 used', expiry: 'Expires 2026-08-30', status: 'Active' },
  ];

  const sources = ['Instagram', 'Youtube', 'Podcast', 'WhatsApp', 'Newsletter', 'Custom'];

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Find a booking"
                  className="w-full bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-full px-5 py-3 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none focus:border-[#C8A97E]"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] px-5 py-2 rounded-full text-sm font-sans text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Booking Link
                </button>
                <button className="w-10 h-10 rounded-full bg-[#141414] border border-[rgba(200,169,126,0.3)] flex items-center justify-center text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C8A97E] bg-[#141414] flex items-center justify-center flex-shrink-0">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={displayName} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : displayName ? (
                    <span className="text-[#C8A97E] font-serif text-sm font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#C8A97E] mb-2">Booking Link & Promo Tools</h1>
                <p className="font-sans text-sm text-[#F9F6F2] opacity-60">Share your booking page and grow your audience.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-5 py-2 rounded-lg text-sm font-sans text-[#F9F6F2]">
                  Mark all as read
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                    className="flex items-center justify-between gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-xl text-sm font-sans min-w-[140px] hover:border-[#C8A97E] transition-all"
                  >
                    {activeTab}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {showSourceDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl overflow-hidden z-10 shadow-lg">
                      {['All Types', 'Active', 'Inactive'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab);
                            setShowSourceDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-sans transition-colors ${activeTab === tab
                            ? 'bg-[#C8A97E] text-[#0C0C0C]'
                            : 'text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)]'
                            }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Your Booking Link Section */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5 mb-6">
              <h3 className="font-serif text-lg font-semibold text-[#C8A97E] mb-4">Your Booking Link</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] flex items-center gap-2">
                  <span className="opacity-60">reachly.ph/</span>
                  <span>ayeshakhan</span>
                </div>
                <button className="flex items-center gap-2 bg-[#C8A97E] text-[#0C0C0C] px-5 py-3 rounded-lg text-sm font-sans font-semibold">
                  Copy link
                </button>
              </div>
            </div>

            {/* QR Code & Share Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* QR Code */}
              <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5">
                <h3 className="font-serif text-2xl font-bold text-[#C8A97E] mb-4">QR Code</h3>
                <div className="flex items-center gap-4">
                  <div className="w-40 h-40 bg-white rounded-lg p-2 flex items-center justify-center">
                    <svg width="140" height="140" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#ffffff" />
                      {/* QR code pattern */}
                      {Array.from({ length: 10 }).map((_, i) =>
                        Array.from({ length: 10 }).map((_, j) => (
                          <rect
                            key={`${i}-${j}`}
                            x={i * 10}
                            y={j * 10}
                            width="8"
                            height="8"
                            fill={Math.random() > 0.5 ? '#000' : '#fff'}
                          />
                        ))
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-base text-[#F9F6F2] mb-4">
                      Print this QR code on business cards, flyers, or display it at events. Followers can scan to book instantly.
                    </p>
                    <button className="flex items-center gap-2 bg-[#C8A97E] text-[#0C0C0C] px-4 py-2 rounded-lg text-sm font-sans">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download QR or PNG
                    </button>
                  </div>
                </div>
              </div>

              {/* Share Templates */}
              <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-2">
                <h3 className="font-serif text-2xl font-bold text-[#C8A97E] mb-4">Share Templates</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {shareTemplates.map((template, idx) => (
                    <div key={idx} className="bg-[#0C0C0C] border border-[rgba(200,169,126,0.2)] rounded-lg p-2 flex flex-col items-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-[rgba(200,169,126,0.1)] rounded-full mb-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                          {template.icon === 'instagram' && (
                            <>
                              <rect x="2" y="2" width="20" height="20" rx="5" />
                              <circle cx="12" cy="12" r="4" />
                              <circle cx="17.5" cy="6.5" r="1" />
                            </>
                          )}
                          {template.icon === 'instagramStory' && (
                            <>
                              <rect x="2" y="2" width="20" height="20" rx="5" />
                              <circle cx="12" cy="12" r="4" />
                              <circle cx="17.5" cy="6.5" r="1" />
                            </>
                          )}
                          {template.icon === 'whatsapp' && (
                            <>
                              <circle cx="12" cy="12" r="10" />
                              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </>
                          )}
                          {template.icon === 'twitter' && (
                            <>
                              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                            </>
                          )}
                        </svg>
                      </div>
                      <p className="font-sans text-xs text-[#F9F6F2] text-center opacity-70 mb-3">{template.name}</p>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-60 text-center mb-3 flex-grow">{template.text}</p>
                      <button className="w-full flex items-center justify-center gap-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-3 py-2 rounded-full text-xs font-sans text-[#F9F6F2] opacity-70 hover:opacity-100">
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Embed Widget */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#C8A97E] mb-1">Embed Widget</h3>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-60">Add this widget to your website to visitors book session directly.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#C8A97E] text-[#0C0C0C] px-4 py-2 rounded-lg text-sm font-sans">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Book on Reachly
                </button>
              </div>
            </div>

            {/* Generate Trackable Links */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#C8A97E] mb-1">Generate Trackable Links</h3>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-60">Track performance across platforms with custom campaigns links</p>
                </div>
              </div>

              {/* Form */}
              <div className="flex flex-wrap items-end gap-3 mb-5">
                <div className="flex-1 min-w-[200px]">
                  <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">Source</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                      className="w-full flex items-center justify-between bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2]"
                    >
                      {sourceFilter}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {showSourceDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl overflow-hidden z-10 shadow-lg">
                        {sources.map((source) => (
                          <button
                            key={source}
                            onClick={() => {
                              setSourceFilter(source);
                              setShowSourceDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-sans transition-colors ${sourceFilter === source
                              ? 'bg-[#C8A97E] text-[#0C0C0C]'
                              : 'text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)]'
                              }`}
                          >
                            {source}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">Campaign Name (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. summer 2026"
                    className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                  />
                </div>
                <button className="bg-[#C8A97E] text-[#0C0C0C] px-5 py-3 rounded-lg text-sm font-sans font-semibold">
                  Generate link
                </button>
              </div>

              {/* Trackable Links List */}
              <div className="border border-[rgba(255,255,255,0.1)] rounded-lg overflow-hidden">
                <div className="hidden sm:grid grid-cols-4 gap-4 px-4 py-3 border-b border-[rgba(255,255,255,0.1)] text-xs font-sans text-[#F9F6F2] opacity-60">
                  <span>Source</span>
                  <span>Trackable Links</span>
                  <span className="text-right">Clicks</span>
                  <span className="text-right">Action</span>
                </div>
                {trackableLinks.map((link, idx) => (
                  <div key={idx} className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 px-4 py-3 border-b border-[rgba(255,255,255,0.1)] last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[rgba(255,255,255,0.05)] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                          {link.source === 'Instagram' && (
                            <>
                              <rect x="2" y="2" width="20" height="20" rx="5" />
                              <circle cx="12" cy="12" r="4" />
                              <circle cx="17.5" cy="6.5" r="1" />
                            </>
                          )}
                          {link.source === 'Youtube' && (
                            <>
                              <polygon points="23 7 16 10 16 14 23 17 23 7" />
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </>
                          )}
                          {link.source === 'Podcast' && (
                            <>
                              <path d="M12 2L2 7l10 5 10-5-10-5z" />
                              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                            </>
                          )}
                        </svg>
                      </div>
                      <span className="text-sm font-sans text-[#F9F6F2]">{link.source}</span>
                    </div>
                    <div className="text-sm font-sans text-[#F9F6F2] opacity-70 break-all sm:truncate">{link.url}</div>
                    <div className="text-right text-sm font-sans text-[#F9F6F2]">{link.clicks}</div>
                    <div className="text-right">
                      <button className="flex items-center justify-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] w-16 h-8 rounded-lg text-xs font-sans text-[#F9F6F2] opacity-70 hover:opacity-100">
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Codes */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#C8A97E] mb-1">Promo Codes</h3>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-60">Create and manage promo codes for your sessions.</p>
                </div>
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="flex items-center gap-2 bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-lg text-sm font-sans text-[#C8A97E]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create Promo Code
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {promoCodes.map((code, idx) => (
                  <div key={idx} className="bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-serif text-xl font-bold text-[#C8A97E]">{code.name}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-sans bg-[rgba(74,222,128,0.1)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]">
                        {code.status}
                      </span>
                    </div>
                    <p className="font-sans text-sm text-[#F9F6F2] mb-1">{code.discount}</p>
                    <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-4">{code.uses}</p>
                    <p className="font-sans text-xs text-[#F9F6F2] opacity-40 mb-3">{code.expiry}</p>
                    <button className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-4 py-2 rounded-lg text-xs font-sans text-[#F9F6F2] opacity-70 hover:opacity-100">
                      Stop Generatable
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Promo Code Modal */}
            {showPromoModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 w-full max-w-lg">
                  <h2 className="font-serif text-2xl font-bold text-[#F9F6F2] mb-6">Create Promo Code</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-2 block">Code</label>
                      <input
                        type="text"
                        placeholder="e.g. STYLE20"
                        defaultValue="STYLE20"
                        className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                      />
                    </div>

                    <div>
                      <label className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-2 block">Type</label>
                      <select className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2]">
                        <option>% off</option>
                        <option>Fixed amount</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-2 block">Value</label>
                      <input
                        type="text"
                        placeholder="10"
                        defaultValue="10"
                        className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                      />
                    </div>

                    <div>
                      <label className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-2 block">Expiry Date</label>
                      <input
                        type="date"
                        className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2]"
                      />
                    </div>

                    <div>
                      <label className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-2 block">Usage Limit</label>
                      <input
                        type="text"
                        placeholder="50"
                        defaultValue="50"
                        className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                      />
                    </div>

                    <div>
                      <label className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-2 block">Applicable Sessions</label>
                      <div className="flex flex-wrap gap-2">
                        <button className="bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-lg text-sm font-sans text-[#C8A97E]">Content Strategy</button>
                        <button className="bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-lg text-sm font-sans text-[#C8A97E]">Style Consultation</button>
                        <button className="bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-lg text-sm font-sans text-[#C8A97E]">Wardrobe Capsule Planning</button>
                        <button className="bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-lg text-sm font-sans text-[#C8A97E]">Confidence Coaching</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-8">
                    <button
                      onClick={() => setShowPromoModal(false)}
                      className="flex-1 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-4 py-3 rounded-full text-sm font-sans text-[#F9F6F2]">
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowPromoModal(false)}
                      className="flex-1 bg-[#C8A97E] text-[#0C0C0C] px-4 py-3 rounded-full text-sm font-sans font-semibold">
                      Create Code
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
