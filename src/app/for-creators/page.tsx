'use client';

import { useState } from 'react';
import Link from 'next/link';
import CreatorNavbar from '@/components/CreatorNavbar';
import Footer from '@/components/Footer';

export default function ForCreatorsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#F9F6F2]">
      <CreatorNavbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-[#C8A97E] text-sm uppercase tracking-widest mb-6 font-semibold">For Creators</p>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Turn your followers into<br />
                  <span className="text-[#C8A97E]">paid clients</span>
                </h1>
                <p className="text-white/70 text-lg mb-8 max-w-lg leading-relaxed">
                  Reachly gives you everything you need to monetize your expertise through 1-on-1 video sessions. Set your own prices, keep most of what you earn, and grow your brand while helping others.
                </p>
                <Link 
                  href="/creator-onboarding/step-1" 
                  className="inline-block bg-[#C8A97E] text-[#0C0C0C] font-semibold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-all"
                >
                  Apply as a Creator
                </Link>
              </div>
              
              <div className="relative flex justify-end">
                <div className="w-full max-w-md bg-[#111111] border border-[rgba(200,169,126,0.3)] rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <img src="/merium.png" alt="Creator" className="w-16 h-16 rounded-full object-cover" />
                      <div>
                        <p className="font-serif text-lg font-bold">Creator Dashboard</p>
                        <p className="text-white/60 text-sm">This month</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[rgba(200,169,126,0.1)] flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </div>
                        <p className="text-xs text-white/50">Earnings</p>
                      </div>
                      <p className="text-[#C8A97E] font-bold text-lg">PKR 142,500</p>
                    </div>
                    <div className="border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[rgba(200,169,126,0.1)] flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <p className="text-xs text-white/50">Bookings</p>
                      </div>
                      <p className="text-white font-bold text-lg">47 sessions</p>
                    </div>
                    <div className="border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[rgba(200,169,126,0.1)] flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#C8A97E">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </div>
                        <p className="text-xs text-white/50">Rating</p>
                      </div>
                      <p className="text-white font-bold text-lg">4.9 / 5</p>
                    </div>
                    <div className="border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[rgba(200,169,126,0.1)] flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <p className="text-xs text-white/50">New Fans</p>
                      </div>
                      <p className="text-white font-bold text-lg">+128</p>
                    </div>
                  </div>
                  <button className="w-full bg-[#C8A97E] text-[#0C0C0C] font-bold py-3 px-6 rounded-full text-sm flex items-center justify-center gap-2">
                    <span>+</span> PKR 12,800 this week
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Calculator */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-4xl font-bold text-center mb-4 text-[#C8A97E]">
              Earnings Calculator
            </h2>
            <p className="text-white/70 text-center mb-10 max-w-md mx-auto">
              Slide to see how much you could earn based on your session price and monthly bookings
            </p>
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-8 max-w-6xl mx-auto">
              <div className="grid sm:grid-cols-2 gap-12 mb-8">
                <div>
                  <label className="block text-base text-white/80 mb-4">Price per session</label>
                  <p className="text-[#C8A97E] text-3xl font-bold font-serif mb-4">PKR 3,600</p>
                  <div className="relative mb-2">
                    <div className="h-1 bg-[rgba(255,255,255,0.1)] rounded-full">
                      <div className="h-1 bg-[#C8A97E] rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <div className="absolute top-1/2 left-[70%] w-4 h-4 bg-white border-2 border-[#C8A97E] rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"></div>
                  </div>
                  <div className="flex justify-between text-xs text-white/50">
                    <span>PKR 500</span>
                    <span>PKR 5,000</span>
                  </div>
                </div>
                <div>
                  <label className="block text-base text-white/80 mb-4">Monthly Bookings</label>
                  <p className="text-[#C8A97E] text-3xl font-bold font-serif mb-4">20 sessions</p>
                  <div className="relative mb-2">
                    <div className="h-1 bg-[rgba(255,255,255,0.1)] rounded-full">
                      <div className="h-1 bg-[#C8A97E] rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <div className="absolute top-1/2 left-[40%] w-4 h-4 bg-white border-2 border-[#C8A97E] rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"></div>
                  </div>
                  <div className="flex justify-between text-xs text-white/50">
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>
              </div>
              <div className="w-full h-px bg-[rgba(255,255,255,0.1)] mb-8"></div>
              <div className="text-center">
                <p className="text-white/70 text-base mb-3">Your estimated monthly earnings</p>
                <p className="text-[#C8A97E] text-4xl font-bold font-serif mb-4">PKR 61,200</p>
                <p className="text-white/60 text-sm">After 15% platform fee. You keep 85% of every booking.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Creators Love Reachly */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-4xl font-bold text-center mb-4">
              <span className="text-[#C8A97E]">Why Creators Love</span> Reachly
            </h2>
            <div className="w-48 h-px bg-[rgba(200,169,126,0.5)] mx-auto mb-12"></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: 'Keep More You Earn', 
                  desc: '85% revenue share, the highest in Pakistan for creators like you.', 
                  icon: 'shield-check' 
                },
                { 
                  title: 'Safe and Secure', 
                  desc: 'Identity verification and escrow payments protect you and your clients.', 
                  icon: 'lock' 
                },
                { 
                  title: 'Grow Your Brand', 
                  desc: 'Every session is a chance to turn a client into a lifelong fan.', 
                  icon: 'trending' 
                },
                { 
                  title: 'Support', 
                  desc: 'Our creator success team is always one message away.', 
                  icon: 'headphones' 
                }
              ].map((item, i) => (
                <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[rgba(200,169,126,0.05)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center mx-auto mb-6">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                      {item.icon === 'shield-check' && (
                        <>
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="M9 12l2 2 4-4" />
                        </>
                      )}
                      {item.icon === 'lock' && (
                        <>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </>
                      )}
                      {item.icon === 'trending' && (
                        <>
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </>
                      )}
                      {item.icon === 'headphones' && (
                        <>
                          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                        </>
                      )}
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/60 text-base">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Get Started */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-4xl font-bold text-center mb-12">
              <span className="text-[#C8A97E]">How to Get</span> Started
            </h2>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
              {[
                { 
                  step: 'Step 01', 
                  title: 'Apply', 
                  desc: 'Fill out a short application with your social links and expertise areas.',
                  icon: 'edit'
                },
                { 
                  step: 'Step 02', 
                  title: 'Get Verified', 
                  desc: 'Our team reviews your application and verifies your identity within 48 hour.',
                  icon: 'check-circle'
                },
                { 
                  step: 'Step 03', 
                  title: 'Set Up and Earn', 
                  desc: 'Set your prices, define session types, and start accepting bookings immediately.',
                  icon: 'setup'
                },
              ].map((item, i) => (
                <div key={i} className="flex-1 text-center relative">
                  <div className="w-20 h-20 rounded-full bg-[rgba(200,169,126,0.05)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center mx-auto mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                      {item.icon === 'edit' && (
                        <>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </>
                      )}
                      {item.icon === 'check-circle' && (
                        <>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M9 12l2 2 4-4" />
                        </>
                      )}
                      {item.icon === 'setup' && (
                        <>
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </>
                      )}
                    </svg>
                  </div>
                  <p className="text-[#C8A97E] text-sm font-semibold mb-2">{item.step}</p>
                  <h3 className="font-serif text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/70 text-base max-w-xs mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Creator Success Stories */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-4xl font-bold text-center mb-12">
              Creator Success Stories
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { 
                  name: 'Jordan L', 
                  role: 'Fitness Coach', 
                  earnings: 'Earned PKR 285,000 in 3 months', 
                  quote: "Reachly has completely transformed how I monetize my audience. I used to rely only on brand deals, but now I earn a consistent monthly income from 1-on-1 sessions. My followers love the personal connection.",
                },
                { 
                  name: 'Jordan L', 
                  role: 'Fitness Coach', 
                  earnings: 'Earned PKR 20,000 in 3 months', 
                  quote: "As someone who gets hundreds of DMs daily, Reachly helps me give proper attention to people who really want to learn. The platform handles scheduling, payments, and reminders. I just show up and teach.",
                },
                { 
                  name: 'Jordan L', 
                  role: 'Fitness Coach', 
                  earnings: 'Earned PKR 350,000 in 3 months', 
                  quote: "The best part about Reachly is how easy it makes everything. My clients book, pay, and join calls without me managing anything. I have helped over 500 women start their fitness journeys through the platform.",
                },
              ].map((creator, i) => (
                <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <img src="/merium in creators section.png" alt={creator.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                      <h3 className="font-serif text-base font-bold">{creator.name}</h3>
                      <p className="text-white/60 text-xs">{creator.role}</p>
                    </div>
                  </div>
                  <p className="text-[#C8A97E] text-2xl font-bold font-serif mb-4">{creator.earnings}</p>
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">{creator.quote}</p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(j => (
                      <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#C8A97E">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Everything You Need to Succeed */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-4xl font-bold text-center mb-12">
              <span className="text-[#C8A97E]">Everything You Need to</span> Succeed
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: 'Smart Scheduling', 
                  desc: 'Connect your calendar and let fans book slots that work for you.', 
                  icon: 'clock' 
                },
                { 
                  title: 'Instant Payouts', 
                  desc: 'Withdraw your earnings weekly via bank transfer, JazzCash, or EasyPaisa.', 
                  icon: 'folder' 
                },
                { 
                  title: 'Analytics Dashboard', 
                  desc: 'Track bookings, revenue, ratings, and growth trends in real time.', 
                  icon: 'grid' 
                },
                { 
                  title: 'Video Call Platform', 
                  desc: 'Built-in HD video calls. No external apps needed, everything on Reachly.', 
                  icon: 'video-plus' 
                },
              ].map((item, i) => (
                <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-[rgba(200,169,126,0.05)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center mx-auto mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                      {item.icon === 'clock' && (
                        <>
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </>
                      )}
                      {item.icon === 'folder' && (
                        <>
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </>
                      )}
                      {item.icon === 'grid' && (
                        <>
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </>
                      )}
                      {item.icon === 'video-plus' && (
                        <>
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </>
                      )}
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/70 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reachly vs Others */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-4xl font-bold text-center mb-12">
              Reachly <span className="text-[#C8A97E]">vs Others</span>
            </h2>
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl overflow-hidden max-w-6xl mx-auto">
              <div className="grid grid-cols-3 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]">
                <div className="p-5 text-xl font-bold font-serif">Feature</div>
                <div className="p-5 text-xl font-bold font-serif text-center text-[#C8A97E]">Reachly</div>
                <div className="p-5 text-xl font-bold font-serif text-center text-white/70">Others</div>
              </div>
              {[
                { feature: 'Platform Fee', reachly: '15%', others: '20-30%' },
                { feature: 'Payout Speed', reachly: 'Weekly', others: 'Monthly' },
                { feature: 'Local Payments', reachly: 'JazzCash / EasyPaisa', others: 'Cards only' },
                { feature: 'Verification', reachly: '48 hours', others: 'Weeks' },
                { feature: 'Creator Support', reachly: 'Dedicated', others: 'Ticket-only' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 border-b border-[rgba(255,255,255,0.1)] last:border-b-0">
                  <div className="p-4 text-sm text-white/80">{row.feature}</div>
                  <div className="p-4 text-center text-[#C8A97E] font-semibold">{row.reachly}</div>
                  <div className="p-4 text-center text-white/60">{row.others}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Creator FAQ */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-4xl font-bold text-center mb-12">
              <span className="text-[#C8A97E]">Creator</span> FAQ
            </h2>
            <div className="space-y-4">
              {[
                { q: 'How much does it cost to join?', a: 'Absolutely nothing. There is no signup fee, no monthly subscription, and no hidden charges. You only pay our 15% platform fee when you actually get booked.' },
                { q: 'How do I get paid?', a: 'You get paid directly to your JazzCash or EasyPaisa account, or via bank transfer. Payouts are processed automatically every week.' },
                { q: 'What can I offer in sessions?', a: 'Anything you are good at! One-on-one coaching, Q&A calls, portfolio reviews, personal styling, tech help—your skills are your limit.' },
                { q: 'How long does verification take?', a: 'Our team reviews applications within 48 hours. Once verified, you can start accepting bookings immediately.' },
                { q: 'Can I set my own prices?', a: 'Of course! You are in full control. Set any price you want for your session types, and change them anytime.' },
              ].map((faq, i) => (
                <div 
                  key={i} 
                  className={`bg-[#141414] border rounded-xl overflow-hidden transition-all ${openFaq === i ? 'border-[#C8A97E]' : 'border-[rgba(255,255,255,0.15)]'}`}
                >
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-8 py-6 text-left flex items-center justify-between">
                    <span className={`font-semibold text-lg ${openFaq === i ? 'text-[#C8A97E]' : 'text-white'}`}>
                      {faq.q}
                    </span>
                    {openFaq === i ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-8 pb-6">
                      <p className="text-white/80 text-base leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="font-serif text-3xl font-bold mb-3">
                  <span className="text-[#C8A97E]">Ready</span> to start earning?
                </h2>
                <p className="text-white/70">
                  Join thousands of creators already monetizing their expertise on Reachly
                </p>
                <br />
                <div className="flex gap-4">
                <Link href="/creator-onboarding/step-1" className="bg-[#C8A97E] text-[#0C0C0C] font-semibold px-10 py-3 rounded-full text-sm hover:opacity-90 transition-all">
                  Apply Now
                </Link>
              </div>
              </div>
              
              <div className="flex gap-5">
                <img src="/merium-footer.png" alt="Creator" className="w-32 h-32 rounded-full object-cover" />
                <img src="/sara khan.png" alt="Creator" className="w-32 h-32 rounded-full object-cover -ml-12 " />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
