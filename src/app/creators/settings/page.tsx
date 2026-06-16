'use client';

import { motion } from 'framer-motion';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

export default function CreatorSettings() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('JazzCash');

  const tabs = ['Profile', 'Account', 'Notifications', 'Privacy', 'Payment', 'Deactivation'];

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
      <CreatorNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <CreatorSidebar />
          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Find a booking "
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
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C8A97E]">
                  <img src="/ahad raza mir.png" alt="Ahad" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h1 className="font-serif text-3xl font-bold text-[#C8A97E] mb-2">Account Settings</h1>
              <p className="font-sans text-sm text-[#F9F6F2] opacity-60">Manage your profile, security, notifications, and account preferences.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans transition-all border ${
                    activeTab === tab
                      ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border-[rgba(200,169,126,0.3)]'
                      : 'bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] opacity-70 border-transparent hover:opacity-100'
                  }`}
                >
                  {tab === 'Profile' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  {tab === 'Account' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  )}
                  {tab === 'Notifications' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  )}
                  {tab === 'Privacy' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  )}
                  {tab === 'Payment' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  )}
                  {tab === 'Deactivation' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'Profile' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6"
              >
                <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-6">Profile Information</h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                    <img src="/merium.png" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-sans text-sm text-[#F9F6F2] mb-1">Sarah Johnson</p>
                    <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-1">sarah@example.com</p>
                    <button className="font-sans text-xs text-[#C8A97E] flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      Change photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="font-sans text-xs text-[#C8A97E] opacity-90 block mb-2">Display Name</label>
                    <input
                      type="text"
                      defaultValue="Sarah Johnson"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-[#C8A97E] opacity-90 block mb-2">Email</label>
                    <input
                      type="text"
                      defaultValue="@sarah124"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="font-sans text-xs text-[#C8A97E] opacity-90 block mb-2">Phone</label>
                    <input
                      type="text"
                      defaultValue="+92 300 1234567"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-[#C8A97E] opacity-90 block mb-2">Location</label>
                    <input
                      type="text"
                      defaultValue="Karachi, Pakistan"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="font-sans text-xs text-[#C8A97E] opacity-90 block mb-2">Bio (128/500)</label>
                  <textarea
                    rows={3}
                    defaultValue="Tech enthusiast and aspiring content creator. Always looking to learn from the best."
                    className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 resize-none"
                  />
                  <p className="font-sans text-xs text-[#C8A97E] opacity-40 text-right mt-1">0/300</p>
                </div>

                <div className="flex justify-end">
                  <button className="flex items-center gap-2 bg-[#C8A97E] text-[#0C0C0C] px-6 py-2 rounded-full text-sm font-sans font-semibold">
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'Account' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6">
                  <h3 className="font-serif text-lg font-semibold text-[#C8A97E] mb-6">Phone (WhatsApp)</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="text"
                      defaultValue="sara@kemail.com"
                      className="flex-1 bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                    />
                    <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-4 py-2 rounded-lg text-xs font-sans text-[#F9F6F2]">
                      Verify
                    </button>
                  </div>
                </div>

                <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6">
                  <h3 className="font-serif text-lg font-semibold text-[#C8A97E] mb-6">Phone (WhatsApp)</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="text"
                      defaultValue="+92 300 1234567"
                      className="flex-1 bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                    />
                    <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-4 py-2 rounded-lg text-xs font-sans text-[#F9F6F2]">
                      Verify
                    </button>
                  </div>
                </div>

                <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6">
                  <h3 className="font-serif text-lg font-semibold text-[#C8A97E] mb-6">Change Password</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <input
                        type="password"
                        placeholder="Current password"
                        className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="flex items-center gap-2 bg-[#C8A97E] text-[#0C0C0C] px-6 py-2 rounded-full text-sm font-sans font-semibold">
                      Update Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Notifications' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6"
              >
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-1">Allow Notifications</h3>
                    <p className="font-sans text-xs text-[#F9F6F2] opacity-60">Choose how and where you want to receive notifications.</p>
                  </div>
                  <div className="w-12 h-6 bg-[rgba(255,255,255,0.1)] rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Privacy' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6">
                  <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-6">Privacy</h3>
                  
                  <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.05)]">
                    <div>
                      <p className="font-sans text-sm text-[#F9F6F2] mb-1">Hide reviews I left</p>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-60">Keep your reviews anonymous to other users</p>
                    </div>
                    <div className="w-12 h-6 bg-[rgba(255,255,255,0.1)] rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6">
                  <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-6">Data & Account</h3>
                  
                  <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.05)] mb-4">
                    <div>
                      <p className="font-sans text-sm text-[#F9F6F2] mb-1">Download my data</p>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-60">Get a copy of all your Reachly data</p>
                    </div>
                    <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-4 py-2 rounded-lg text-xs font-sans text-[#F9F6F2]">
                      Request Export
                    </button>
                  </div>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-[rgba(248,113,113,0.1)] text-[#f87171] px-4 py-2 rounded-lg text-xs font-sans"
                  >
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'Payment' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6">
                  <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-6">Payout Method</h3>
                  
                  <div className="mb-4">
                    <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-2">Payment Method</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {['JazzCash', 'EasyPaisa', 'Bank Transfer'].map((method) => (
                        <button
                          key={method}
                          onClick={() => setSelectedPaymentMethod(method)}
                          className={`px-3 py-1 rounded-lg text-xs font-sans transition-all border ${
                            selectedPaymentMethod === method
                              ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border-[rgba(200,169,126,0.3)]'
                              : 'bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] opacity-70 border-transparent hover:opacity-100'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">Account Title</label>
                    <input
                      type="text"
                      placeholder="Full name on CNIC"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                    />
                  </div>

                  {selectedPaymentMethod !== 'Bank Transfer' && (
                    <div className="mb-4">
                      <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">Registered Mobile Number</label>
                      <div className="flex items-center gap-2">
                        <div className="bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-xs font-sans text-[#F9F6F2] opacity-60">
                          PK +92
                        </div>
                        <input
                          type="text"
                          placeholder="321 4567890"
                          className="flex-1 bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                        />
                      </div>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-40 mt-2">Enter the number registered with your wallet.</p>
                    </div>
                  )}

                  {selectedPaymentMethod === 'Bank Transfer' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">Account Number</label>
                          <input
                            type="text"
                            placeholder="e.g 0123 45678901"
                            className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                          />
                        </div>
                        <div>
                          <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">IBAN</label>
                          <input
                            type="text"
                            placeholder="PK00000..."
                            className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">Bank Name</label>
                        <select className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50">
                          <option>Select your Bank</option>
                          <option>HBL</option>
                          <option>UBL</option>
                          <option>MCB</option>
                        </select>
                      </div>
                    </>
                  )}

                  <button className="flex items-center gap-2 bg-[#C8A97E] text-[#0C0C0C] px-6 py-2 rounded-full text-sm font-sans font-semibold">
                    Save Payment Method
                  </button>
                </div>

                <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-lg font-semibold text-[#F9F6F2]">KYC Documents</h3>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      { name: 'CNIC Front', date: 'Uploaded: 2026-03-01' },
                      { name: 'CNIC Back', date: 'Uploaded: 2026-03-01' },
                      { name: 'Bank Statement', date: 'Uploaded: 2026-05-05' },
                    ].map((doc, idx) => (
                      <div key={idx} className="bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-sans text-sm text-[#F9F6F2] mb-1">{doc.name}</p>
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{doc.date}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-sans bg-[rgba(74,222,128,0.1)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>

                  <button className="flex items-center gap-2 bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-full text-sm font-sans text-[#C8A97E]">
                    Upload New Document
                  </button>
                </div>

                <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6">
                  <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-6">Tax Information</h3>
                  
                  <div className="mb-2">
                    <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">NTN Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="1234567-8"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                    />
                  </div>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-40">Your NTN is used for annual income reporting. Reachly does not deduct tax.</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'Deactivation' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-2">Account Deactivation</h3>
                    <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-6 max-w-md">Temporarily disable your creator account. Your profile will be hidden, and no new bookings can be made. Existing bookings remain active.</p>
                  </div>
                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="bg-[rgba(248,113,113,0.1)] text-[#f87171] border border-[rgba(248,113,113,0.3)] px-4 py-2 rounded-lg text-xs font-sans"
                  >
                    Deactivate Account
                  </button>
                </div>
              </motion.div>
            )}

            {showDeleteModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 w-full max-w-md">
                  <h2 className="font-serif text-xl font-semibold text-[#F9F6F2] mb-2">Delete your account?</h2>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-6">This action cannot be undone. All your data, bookings, and reviews will be permanently deleted. Are you sure?</p>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-4 py-3 rounded-full text-sm font-sans text-[#F9F6F2]"
                    >
                      Cancel
                    </button>
                    <button className="flex-1 bg-[#f87171] text-[#0C0C0C] px-4 py-3 rounded-full text-sm font-sans font-semibold">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showDeactivateModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 w-full max-w-md">
                  <h2 className="font-serif text-xl font-semibold text-[#F9F6F2] mb-2">Deactivate Account</h2>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-6">Your profile will be hidden and no new bookings accepted. You can reactivate anytime within 14 days.</p>
                  
                  <div className="mb-4">
                    <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">Reason (optional)</label>
                    <select className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50">
                      <option>Select a reason</option>
                      <option>Taking a break</option>
                      <option>Not getting enough bookings</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="font-sans text-xs text-[#F9F6F2] opacity-60 block mb-2">Type DEACTIVATE to confirm</label>
                    <input
                      type="text"
                      placeholder="DEACTIVATE"
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowDeactivateModal(false)}
                      className="flex-1 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-4 py-3 rounded-full text-sm font-sans text-[#F9F6F2]"
                    >
                      Cancel
                    </button>
                    <button className="flex-1 bg-[#f87171] text-[#0C0C0C] px-4 py-3 rounded-full text-sm font-sans font-semibold">
                      Deactivate
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
