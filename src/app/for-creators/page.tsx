'use client';

import { useState } from 'react';
import Link from 'next/link';
import CreatorNavbar from '@/components/CreatorNavbar';
import Footer from '@/components/Footer';

export default function ForCreatorsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            <h2 className="font-serif text-3xl font-bold text-center mb-12">
              How to Get Started
            </h2>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
              {[
                { step: 1, title: 'Apply', desc: 'Fill out our simple application form.' },
                { step: 2, title: 'Get verified', desc: 'Complete our quick verification process.' },
                { step: 3, title: 'Set up your profile', desc: 'Create your profile and set your prices.' },
              ].map((item, i) => (
                <div key={i} className="text-center relative">
                  <div className="w-16 h-16 rounded-full bg-[#C8A97E] text-[#0C0C0C] flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm max-w-[200px]">{item.desc}</p>
                  {i < 2 && (
                    <div className="hidden lg:block absolute top-8 left-full w-16 h-0.5 bg-[rgba(200,169,126,0.3)]"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Creator Success Stories */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">
              Creator Success Stories
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { name: 'Kainat Aslam', role: 'Fashion Creator', earnings: 'PKR 35,200' },
                { name: 'Ahmed Khan', role: 'Business Coach', earnings: 'PKR 58,400' },
                { name: 'Sarah Ali', role: 'Fitness Trainer', earnings: 'PKR 42,800' },
              ].map((creator, i) => (
                <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img src="/merium.png" alt={creator.name} className="w-16 h-16 rounded-full" />
                    <div>
                      <h3 className="font-serif text-lg font-bold">{creator.name}</h3>
                      <p className="text-white/60 text-sm">{creator.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-4">
                    {[1,2,3,4,5].map(j => (
                      <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#C8A97E">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[#C8A97E] text-xl font-bold font-serif mb-2">{creator.earnings}</p>
                  <p className="text-white/50 text-xs">Earned in their first month</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Everything You Need to Succeed */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">
              Everything You Need to Succeed
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Secure Payments', icon: 'shield' }, 
                { name: 'Instant Payouts', icon: 'bank' }, 
                { name: 'Analytics Dashboard', icon: 'chart' }, 
                { name: 'Video Call Platform', icon: 'video' }
              ].map((item, i) => (
                <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                      {item.icon === 'shield' && (
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      )}
                      {item.icon === 'bank' && (
                        <>
                          <path d="M3 21h18" />
                          <path d="M3 10h18" />
                          <path d="M5 6l7-3 7 3" />
                        </>
                      )}
                      {item.icon === 'chart' && (
                        <>
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                        </>
                      )}
                      {item.icon === 'video' && (
                        <>
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </>
                      )}
                    </svg>
                  </div>
                  <p className="text-sm">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reachly vs Others */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">
              <span className="text-[#C8A97E]">Reachly</span> vs Others
            </h2>
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl overflow-hidden max-w-4xl mx-auto">
              <div className="grid grid-cols-3 border-b border-[rgba(255,255,255,0.1)]">
                <div className="p-4 text-sm font-semibold">Feature</div>
                <div className="p-4 text-sm font-semibold text-center text-[#C8A97E]">Reachly</div>
                <div className="p-4 text-sm font-semibold text-center text-white/50">Others</div>
              </div>
              {[
                'Creator payout', 'Local payment methods', 'Pakistan-first support', 'No hidden fees', 'Verified creators only'
              ].map((feature, i) => (
                <div key={i} className="grid grid-cols-3 border-b border-[rgba(255,255,255,0.1)] last:border-b-0">
                  <div className="p-4 text-sm text-white/80">{feature}</div>
                  <div className="p-4 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#C8A97E">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="p-4 flex items-center justify-center">
                    {i < 3 ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#C8A97E">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Creator FAQ */}
        <section className="py-16 border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">
              Creator <span className="text-[#C8A97E]">FAQ</span>
            </h2>
            <div className="space-y-3">
              {[
                { q: 'How do I get paid?', a: 'You get paid directly to your JazzCash or EasyPaisa account. Payouts are processed weekly.' },
                { q: 'What are the fees?', a: 'We take a 20% platform fee. You keep 80% of every session you do.' },
                { q: 'Can anyone join as a creator?', a: 'We accept creators from all niches as long as you have a genuine following and can provide value to your clients.' },
                { q: 'How do I set my prices?', a: 'You set your own prices! Most creators charge between PKR 1,000 and PKR 5,000 per session.' },
              ].map((faq, i) => (
                <div key={i} className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 py-5 text-left flex items-center justify-between">
                    <span className="font-semibold">{faq.q}</span>
                    {openFaq === i ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5">
                      <p className="text-white/70">{faq.a}</p>
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
                  Ready to start earning?
                </h2>
                <p className="text-white/70">
                  Join thousands of creators already monetizing their expertise on Reachly
                </p>
              </div>
              <div className="flex gap-4">
                <Link href="/creator-onboarding/step-1" className="bg-[#C8A97E] text-[#0C0C0C] font-semibold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-all">
                  Apply Now
                </Link>
              </div>
              <div className="flex gap-4">
                <img src="/merium-footer.png" alt="Creator" className="w-32 h-32 rounded-full object-cover" />
                <img src="/sara khan.png" alt="Creator" className="w-32 h-32 rounded-full object-cover -ml-12 border-4 border-[#0c0c0c]" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
