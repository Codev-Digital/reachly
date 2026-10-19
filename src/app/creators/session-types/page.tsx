'use client';

import { motion } from 'framer-motion';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';
import FormInput from '@/components/FormInput';
import { richTextToPlain } from '@/lib/richText';

const DARK_LABEL = 'text-sm font-sans font-normal leading-normal text-[#F9F6F2] opacity-70';
const DARK_INPUT =
  'bg-[rgba(255,255,255,0.03)] border-[rgba(200,169,126,0.2)] focus:border-[rgba(200,169,126,0.2)] rounded-xl py-2.5 text-[#F9F6F2]';

const CreatorSessionTypes = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenuIndex, setShowMenuIndex] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sessionTypes = [
    { id: 1, title: 'Style Consultation', duration: 30, price: 1200, description: 'A personalised style session where we analyse your wardrobe, discuss your style goals, and build a', included: ['Wardrobe analysis', 'Style goal setting', 'Personalised shopping list'], bookings: 47, rating: 4.8, active: true, priceRange: '1 to 5' },
    { id: 2, title: 'Style Consultation', duration: 30, price: 1200, description: 'A personalised style session where we analyse your wardrobe, discuss your style goals, and build a', included: ['Wardrobe analysis', 'Style goal setting', 'Personalised shopping list'], bookings: 47, rating: 4.8, active: true, priceRange: '1 to 5' },
    { id: 3, title: 'Style Consultation', duration: 30, price: 1200, description: 'A personalised style session where we analyse your wardrobe, discuss your style goals, and build a', included: ['Wardrobe analysis', 'Style goal setting', 'Personalised shopping list'], bookings: 47, rating: 4.8, active: true, priceRange: '1 to 5' },
    { id: 4, title: 'Style Consultation', duration: 30, price: 1200, description: 'A personalised style session where we analyse your wardrobe, discuss your style goals, and build a', included: ['Wardrobe analysis', 'Style goal setting', 'Personalised shopping list'], bookings: 47, rating: 4.8, active: false, priceRange: '1 to 5' },
    { id: 5, title: 'Style Consultation', duration: 30, price: 1200, description: 'A personalised style session where we analyse your wardrobe, discuss your style goals, and build a', included: ['Wardrobe analysis', 'Style goal setting', 'Personalised shopping list'], bookings: 47, rating: 4.8, active: true, priceRange: '1 to 5' },
  ];

  const durations = [15, 20, 25, 30, 35];

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#C8A97E] mb-2">Your Session Types</h1>
                <p className="font-sans text-base text-[#F9F6F2] opacity-70">Manage what you offer to followers. Active sessions appear on your public profile.</p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-[#C8A97E] text-[#0C0C0C] px-5 py-2 rounded-xl text-sm font-sans font-medium hover:opacity-90 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Session Type
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sessionTypes.map((session, index) => (
                <div
                  key={session.id}
                  className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-2xl p-6 relative"
                >
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setShowMenuIndex(showMenuIndex === index ? null : index)}
                      className="text-[#F9F6F2] opacity-50 hover:opacity-100"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="6" r="1" />
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="18" r="1" />
                      </svg>
                    </button>

                    {showMenuIndex === index && (
                      <div className="absolute right-0 top-8 bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-3 min-w-[140px] z-10">
                        <button className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm font-sans text-[#F9F6F2] opacity-70 hover:opacity-100 hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-all">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                        <button className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm font-sans text-[#F9F6F2] opacity-70 hover:opacity-100 hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-all">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          Duplicate
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteModal(true);
                            setShowMenuIndex(null);
                          }}
                          className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm font-sans text-[#f87171] opacity-90 hover:opacity-100 hover:bg-[rgba(248,113,113,0.1)] rounded-lg transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[rgba(200,169,126,0.1)] rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#F9F6F2]">{session.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-sans text-[#C8A97E] flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                          </svg>
                          {session.duration} min
                        </span>
                        <span className="text-sm font-sans text-[#C8A97E] flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          PKR {session.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-4 leading-relaxed">{richTextToPlain(session.description)}...</p>

                  <div className="mb-4">
                    <p className="text-sm font-sans text-[#C8A97E] font-medium mb-2">What is included</p>
                    <div className="space-y-1">
                      {session.included.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-sans text-[#F9F6F2] opacity-70">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {item}
                        </div>
                      ))}
                      {session.included.length > 2 && (
                        <div className="text-xs font-sans text-[#C8A97E] opacity-80">+{session.included.length - 2} more</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-sans text-[#F9F6F2] opacity-60 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                        {session.bookings} bookings
                      </span>
                      <span className="text-xs font-sans text-[#F9F6F2] opacity-60 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {session.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-5 ${session.active ? 'bg-[#C8A97E]' : 'bg-[rgba(255,255,255,0.1)]'} rounded-full relative`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-[#0C0C0C] rounded-full ${session.active ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                      <span className="text-xs font-sans text-[#F9F6F2] opacity-60">{session.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>

                  <button className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] px-4 py-2 rounded-xl text-sm font-sans flex items-center justify-center gap-2 opacity-80">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    {session.priceRange}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </motion.main>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-50">
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-7 w-full max-w-lg">
            <h3 className="font-serif text-2xl font-bold text-[#F9F6F2] mb-5">Add Session Type</h3>

            <div className="space-y-4 mb-6">
              <FormInput
                type="text"
                label="Title"
                className={DARK_INPUT}
                labelClassName={DARK_LABEL}
                placeholder=""
              />

              <div>
                <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">Description</label>
                <textarea
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(200,169,126,0.2)] rounded-xl px-4 py-2.5 text-[#F9F6F2] text-sm font-sans outline-none resize-none h-20"
                  placeholder=""
                />
              </div>

              <div>
                <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">Duration (min)</label>
                <div className="flex gap-2">
                  {durations.map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setSelectedDuration(duration)}
                      className={`flex-1 py-2 rounded-xl text-sm font-sans transition-all ${duration === selectedDuration
                          ? 'bg-[#C8A97E] text-[#0C0C0C]'
                          : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2]'
                        }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>

              <FormInput
                type="text"
                label="Price (PKR)"
                defaultValue="1200"
                className={DARK_INPUT}
                labelClassName={DARK_LABEL}
                placeholder=""
              />

              <FormInput
                type="text"
                label="Max bookings per day"
                defaultValue="No limit"
                className={DARK_INPUT}
                labelClassName={DARK_LABEL}
                placeholder=""
              />

              <div>
                <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">What is included</label>
                <div className="flex gap-2">
                  <FormInput
                    type="text"
                    wrapperClassName="flex-1"
                    className={DARK_INPUT}
                    placeholder=""
                  />
                  <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.2)] text-[#C8A97E] px-3 rounded-xl">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] py-2.5 rounded-full text-sm font-sans font-medium hover:bg-[rgba(255,255,255,0.1)] transition-all"
              >
                Cancel
              </button>
              <button className="flex-1 bg-[#C8A97E] text-[#0C0C0C] py-2.5 rounded-full text-sm font-sans font-medium hover:opacity-90 transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-50">
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-7 w-full max-w-md">
            <h3 className="font-serif text-2xl font-bold text-[#F9F6F2] mb-2">Delete Session Type</h3>
            <p className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-6">Are you sure you want to delete Confidence Coaching?</p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] py-2.5 rounded-full text-sm font-sans font-medium hover:bg-[rgba(255,255,255,0.1)] transition-all"
              >
                Cancel
              </button>
              <button className="flex-1 bg-[#f87171] text-[#0C0C0C] py-2.5 rounded-full text-sm font-sans font-medium hover:opacity-90 transition-all">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorSessionTypes;
