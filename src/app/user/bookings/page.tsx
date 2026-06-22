'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';
import UserTopBar from '@/components/UserTopBar';
import RescheduleModal from '@/components/RescheduleModal';
import CancelBookingModal from '@/components/CancelBookingModal';

export default function UserBookings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [view, setView] = useState<'list' | 'details'>('list');

  // Real Data State
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch from API
  useEffect(() => {
    async function fetchBookings() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        let guestEmail = urlParams.get('email') || urlParams.get('guestEmail');

        // As a fallback for guests who just completed a booking
        if (!guestEmail) {
          try {
            const stored = sessionStorage.getItem('reachly_booking_state');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed?.userDetails?.email) guestEmail = parsed.userDetails.email;
            }
          } catch (e) { }
        }

        const endpoint = guestEmail
          ? `/api/user/bookings?guestEmail=${encodeURIComponent(guestEmail)}`
          : '/api/user/bookings';

        const res = await fetch(endpoint);
        const data = await res.json();

        if (res.ok) {
          setBookings(data.bookings || []);
        } else {
          setError(data.error || 'Failed to fetch bookings');
        }
      } catch (err) {
        setError('Network error checking bookings');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  // Filter Bookings Based on Tabs
  const pendingBookings = bookings.filter(b => b.status === 'Pending Approval');
  const upcomingBookings = bookings.filter(b => b.status === 'Upcoming');
  const pastBookings = bookings.filter(b => b.status === 'Past');
  const cancelledBookings = bookings.filter(b => b.originalStatus === 'cancelled');

  let visibleBookings = pendingBookings.length > 0 ? pendingBookings : upcomingBookings;
  if (activeTab === 'pending') visibleBookings = pendingBookings;
  if (activeTab === 'upcoming') visibleBookings = upcomingBookings;
  if (activeTab === 'past') visibleBookings = pastBookings;
  if (activeTab === 'cancelled') visibleBookings = cancelledBookings;

  const tabs = [
    { label: `Pending (${pendingBookings.length})`, value: 'pending' },
    { label: `Upcoming (${upcomingBookings.length})`, value: 'upcoming' },
    { label: `Past (${pastBookings.length})`, value: 'past' },
    { label: `Cancelled (${cancelledBookings.length})`, value: 'cancelled' },
  ];


  const handleViewDetails = (booking: any) => {
    setCurrentBooking(booking);
    setView('details');
  };

  const handleBackToList = () => {
    setView('list');
    setCurrentBooking(null);
  };

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

            {view === 'list' ? (
              <>
                <div className="mb-6">
                  <h1 className="font-serif text-4xl font-bold text-[#C8A97E] mb-4">My Bookings</h1>

                  <div className="flex gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans transition-all border ${activeTab === tab.value
                          ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border-[rgba(200,169,126,0.3)]'
                          : 'bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] opacity-70 border-transparent hover:opacity-100'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center p-12">
                      <svg className="animate-spin h-8 w-8 text-[#C8A97E]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    </div>
                  ) : error === 'Unauthorized' ? (
                    <div className="p-8 sm:p-12 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-3xl text-center flex flex-col items-center justify-center max-w-lg mx-auto mt-8">
                      <div className="w-16 h-16 bg-[rgba(200,169,126,0.1)] border border-[#C8A97E] rounded-full flex items-center justify-center mb-6">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0110 0v4"></path>
                        </svg>
                      </div>
                      <h3 className="text-[#C8A97E] font-serif text-3xl font-bold mb-3">Login to explore</h3>
                      <p className="text-[#F9F6F2] opacity-70 font-sans text-sm mb-8 leading-relaxed">
                        Please log in or sign up to view your personalized booking dashboard, manage sessions, and connect with your favorite creators.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <a href="/login?callbackUrl=/user/bookings" className="flex-1 bg-transparent border border-[rgba(200,169,126,0.5)] text-[#C8A97E] font-sans font-semibold py-3 px-6 rounded-full hover:bg-[rgba(200,169,126,0.1)] transition-all">
                          Log in
                        </a>
                        <a href="/signup?callbackUrl=/user/bookings" className="flex-1 bg-[#C8A97E] text-[#0C0C0C] font-sans font-semibold py-3 px-6 rounded-full hover:opacity-90 transition-all">
                          Sign up
                        </a>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-2xl">
                      <p className="text-red-400 font-sans text-sm">{error}</p>
                    </div>
                  ) : visibleBookings.length === 0 ? (
                    <div className="p-12 bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-2xl text-center">
                      <h3 className="text-[#F9F6F2] font-serif text-xl mb-2">No bookings found</h3>
                      <p className="text-[#F9F6F2] opacity-60 font-sans text-sm">You do not have any {activeTab} bookings at the moment.</p>
                    </div>
                  ) : (
                    visibleBookings.map((booking) => (
                      <div key={booking.id} className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={booking.image} alt={booking.creator} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {booking.tags?.map((tag: string, i: number) => (
                                  <span key={i} className="bg-[rgba(200,169,126,0.15)] text-[#C8A97E] px-2 py-0.5 rounded-full text-xs font-sans">{tag}</span>
                                ))}
                                <span className="text-xs font-sans text-[#F9F6F2] opacity-60">{booking.ref}</span>
                              </div>
                              <h3 className="font-serif text-xl font-semibold text-[#F9F6F2] mb-1">{booking.session}</h3>
                              <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-1">with <span className="font-semibold">{booking.creator}</span></p>
                              <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-3">{booking.date}</p>
                              <p className="font-sans text-sm text-[#C8A97E] font-medium">{booking.status}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap h-fit">
                            <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-full text-sm font-sans hover:bg-[#C8A97E] hover:text-[#0C0C0C] hover:border-transparent transition-all">
                              Join meet
                            </button>
                            {booking.status === 'Upcoming' && (
                              <>
                                <button
                                  onClick={() => {
                                    setCurrentBooking(booking);
                                    setShowRescheduleModal(true);
                                  }}
                                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-full text-sm font-sans hover:bg-[rgba(200,169,126,0.1)] transition-all"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => {
                                    setCurrentBooking(booking);
                                    setShowCancelModal(true);
                                  }}
                                  className="bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] text-[#f87171] px-4 py-2 rounded-full text-sm font-sans hover:bg-[rgba(248,113,113,0.2)] transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleViewDetails(booking)}
                              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-full text-sm font-sans hover:bg-[rgba(255,255,255,0.1)] transition-all"
                            >
                              View details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              currentBooking && (
                <>
                  <div className="mb-6">
                    <button
                      onClick={handleBackToList}
                      className="flex items-center gap-2 font-sans text-sm text-[#F9F6F2] opacity-70 hover:opacity-100 mb-4"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Back
                    </button>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-sans text-sm text-[#F9F6F2] opacity-70">My bookings</span>
                      <span className="text-[#F9F6F2] opacity-40">›</span>
                      <span className="font-sans text-sm text-[#C8A97E]">{currentBooking.ref}</span>
                    </div>
                  </div>

                  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={currentBooking.image} alt={currentBooking.creator} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {currentBooking.tags.map((tag: string, i: number) => (
                            <span key={i} className="bg-[rgba(200,169,126,0.15)] text-[#C8A97E] px-2 py-0.5 rounded-full text-xs font-sans">{tag}</span>
                          ))}
                          <span className="text-xs font-sans text-[#F9F6F2] opacity-60">{currentBooking.ref}</span>
                        </div>
                        <h3 className="font-serif text-xl font-semibold text-[#F9F6F2] mb-1">{currentBooking.session} with {currentBooking.creator}</h3>
                        <p className="font-sans text-sm text-[#F9F6F2] opacity-70">{currentBooking.date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                      <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-4">Session Details</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-1">Session type</p>
                          <p className="font-sans text-sm text-[#F9F6F2]">{currentBooking.sessionType}</p>
                        </div>
                        <div>
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-1">Duration</p>
                          <p className="font-sans text-sm text-[#F9F6F2]">{currentBooking.duration}</p>
                        </div>
                        <div>
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-1">Date</p>
                          <p className="font-sans text-sm text-[#F9F6F2]">{currentBooking.shortDate}</p>
                        </div>
                        <div>
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-1">Time</p>
                          <p className="font-sans text-sm text-[#F9F6F2]">{currentBooking.time}</p>
                        </div>
                      </div>

                      <div className="border-t border-[rgba(255,255,255,0.1)] pt-4 mb-4">
                        <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-2">Google Meet link</p>
                        <div className="flex items-center gap-2">
                          <button className="bg-[#C8A97E] text-[#0C0C0C] px-4 py-2 rounded-full text-sm font-sans font-medium flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join meet
                          </button>
                          <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-full text-sm font-sans flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy Link
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-2">Add to calendar</p>
                        <div className="flex items-center gap-2">
                          <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-full text-sm font-sans flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Google
                          </button>
                          <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-full text-sm font-sans flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="12" cy="14" r="4"></circle>
                              <line x1="12" y1="2" x2="12" y2="6"></line>
                            </svg>
                            Apple
                          </button>
                          <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-full text-sm font-sans flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16v-2"></path>
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                              <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                            Outlook
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                      <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-4">Payment Details</h3>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-60">Amount</p>
                          <p className="font-sans text-sm font-semibold text-[#C8A97E]">{currentBooking.price}</p>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-60">Payment method</p>
                          <p className="font-sans text-sm text-[#F9F6F2]">{currentBooking.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="border-t border-[rgba(255,255,255,0.1)] pt-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-60">Transaction ID</p>
                          <p className="font-sans text-sm text-[#F9F6F2]">{currentBooking.transactionId}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-60">Booked on</p>
                          <p className="font-sans text-sm text-[#F9F6F2]">{currentBooking.bookedOn}</p>
                        </div>
                      </div>
                      <button className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2.5 rounded-full text-sm font-sans flex items-center justify-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download Invoice
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-4">Pre-session Message</h3>
                    <textarea
                      rows={2}
                      placeholder="Send a message to your creator before the session (optional)..."
                      className="w-full bg-[#0C0C0C] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none resize-none mb-3"
                    />
                    <div className="flex justify-end">
                      <button className="bg-[#C8A97E] text-[#0C0C0C] px-6 py-2.5 rounded-full text-sm font-sans font-semibold">
                        Save message
                      </button>
                    </div>
                  </div>
                </>
              )
            )}
          </motion.main>
        </div>
      </div>

      {currentBooking && (
        <>
          <RescheduleModal
            isOpen={showRescheduleModal}
            onClose={() => {
              setShowRescheduleModal(false);
            }}
            currentSession={{
              name: currentBooking.session,
              date: currentBooking.date
            }}
          />
          <CancelBookingModal
            isOpen={showCancelModal}
            onClose={() => {
              setShowCancelModal(false);
            }}
            onConfirm={() => console.log('Booking cancelled!')}
            sessionName={currentBooking.session}
            creatorName={currentBooking.creator}
          />
        </>
      )}
    </div>
  );
}
