'use client';

import Link from 'next/link';
import { useState } from 'react';
import CreatorNavbar from '@/components/CreatorNavbar';
import Footer from '@/components/Footer';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const topCreators = [
    { img: '/ayeza jhan.png', name: 'Ayeza Khan', role: 'Actress' },
    { img: '/fawad khan.png', name: 'Fawad Khan', role: 'Actor' },
    { img: '/Mahira Khan.png', name: 'Mahira Khan', role: 'Actress' },
    { img: '/sara khan in creators.png', name: 'Sarah Khan', role: 'Actress' },
    { img: '/Humayun saeed.png', name: 'humayun', role: 'Actor' },
    { img: '/merium in creators section.png', name: 'Merium', role: 'Influencer' },
  ];

  const creators = [
   
    { img: '/ahad raza mir.png', name: 'Ahad Raza Mir', role: 'Actor & Singer' },

    { img: '/sara khan.png', name: 'Sara Khan', role: 'Actress' },
    { img: '/merium.png', name: 'Merium Pervaiz', role: 'Content Creator' },
   
  ];

  const categories = [
    { img: '/lifestyle.png', name: 'Lifestyle', icon: 'heart' },
    { img: '/tech.png', name: 'Tech', icon: 'microscope' },
    { img: '/fitness.png', name: 'Fitness', icon: 'dumbbell' },
    { img: '/fashion.jpg', name: 'Fashion', icon: 'award' },
    { img: '/business.jpg', name: 'Business', icon: 'briefcase' },
    { img: '/education.jpg', name: 'Education', icon: 'book' },
    { img: '/beauty.png', name: 'Beauty', icon: 'camera' },
    { img: '/food.jpg', name: 'Food', icon: 'utensils' },
  ];

  return (
<div className="min-h-screen bg-[#0C0C0C]">
  <CreatorNavbar />

  {/* Hero Section */}
  <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-14 overflow-hidden">
    {/* Background decorative elements */}
    <div
      className="absolute top-0 left-0 w-64 h-64 opacity-20"
      style={{
        backgroundImage:
          "radial-gradient(circle, #C8A97E 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    />

    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero Container */}
      <div className="relative bg-gradient-to-br from-[rgba(20,20,20,1)] to-[rgba(12,12,12,1)] border border-[rgba(200,169,126,0.15)] rounded-[36px] p-6 sm:p-8 lg:p-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left Content */}
          <div>
            {/* Top small text */}
            <p className="font-sans text-xs sm:text-sm text-[#C8A97E] tracking-widest uppercase mb-4">
              Pakistan&apos;s First Creator Booking Platform
            </p>

            {/* Main Heading */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#F9F6F2] mb-5 leading-tight">
              Book a 1 on 1 with your{" "}
              <span className="text-[#C8A97E]">
                favorite creator
              </span>
            </h1>

            {/* Description */}
            <p className="font-sans text-sm sm:text-base text-[#F9F6F2] opacity-70 max-w-md mb-8">
              Connect directly with Pakistan&apos;s top creators through
              personalized video sessions. Pay securely with JazzCash or
              EasyPaisa.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/welcome"
                className="bg-[#C8A97E] text-[#0C0C0C] font-sans font-semibold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-all"
              >
                Explore Creators
              </Link>

              <Link
                href="/signup?type=creator"
                className="border border-[rgba(200,169,126,0.5)] text-[#C8A97E] font-sans font-semibold px-6 py-3 rounded-full text-sm hover:bg-[rgba(200,169,126,0.1)] transition-all"
              >
                Become a Creator
              </Link>
            </div>
          </div>

          {/* Right side with image */}
          <div className="relative">
            {/* Decorative SVG circles */}
            <div className="absolute -top-8 -left-8 opacity-30">
              <img src="/Ellipse 3.svg" alt="" />
            </div>

            <div className="absolute -bottom-4 -right-4 opacity-40">
              <img src="/Ellipse 3 (1).svg" alt="" />
            </div>

            {/* Creator Image */}
            <div className="relative">
              <div className="rounded-tr-[80px] rounded-tl-[20px] rounded-br-[20px] rounded-bl-[80px] overflow-hidden">
                <img
                  src="/ahad raza mir.png"
                  alt="Ahad Raza Mir"
                  className="w-full h-auto"
                />
              </div>

              {/* Top Left SVG Tag */}
              <div className="absolute top-6 -left-8 sm:-left-10 z-20">
                <img
                  src="/ahad raza mir svg.svg"
                  alt="Creator Tag"
                  className="w-36 sm:w-44 lg:w-48"
                />
              </div>

              {/* Bottom Right SVG Tag */}
           <div className="absolute -bottom-20 -right-4 sm:-right-6 z-20">
  <img
    src="/actor and singer svg.svg"
    alt="Creator Info"
    className="w-40 sm:w-48 lg:w-52"
  />
</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>


      {/* Top Creators */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-48 h-48 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #C8A97E 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #C8A97E 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F9F6F2] mb-3">
              Pakistan&apos;s <span className="text-[#C8A97E]">Top Creators</span>
            </h2>
            <p className="font-sans text-sm text-[#F9F6F2] opacity-70">
              Connect, Collaborate and create with the most trusted voices across Pakistan
            </p>
          </div>

          {/* Creators carousel */}
          <div className="relative">
            {/* Left arrow */}
            <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-[rgba(200,169,126,0.5)] flex items-center justify-center hover:bg-[rgba(200,169,126,0.1)] transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Creators grid */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 px-14">
              {topCreators.map((creator, i) => (
                <div key={i} className="group relative">
                  {/* Creator card */}
                  <div className={`bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-4 transition-all ${i === 2 ? 'shadow-[0_0_30px_rgba(200,169,126,0.2)] border-[#C8A97E]' : ''}`}>
                    <div className="relative mb-4">
                      <img 
                        src={creator.img} 
                        alt={creator.name} 
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-transparent group-hover:border-[#C8A97E] transition-all" 
                      />
                      {/* Verified badge */}
                   {/* Verified badge */}
<div className="absolute top-0 right-0 w-7 h-7 bg-[#C8A97E] rounded-full flex items-center justify-center border-2 border-[#141414]">
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0C0C0C"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 13l4 4L19 7" />
  </svg>
</div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-serif text-sm font-semibold text-[#F9F6F2] mb-1">{creator.name}</h3>
                      <div className="bg-[rgba(255,255,255,0.05)] rounded-full px-3 py-1">
                        <p className="font-sans text-[10px] text-[#F9F6F2] opacity-60">{creator.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right arrow */}
            <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-[rgba(200,169,126,0.5)] flex items-center justify-center hover:bg-[rgba(200,169,126,0.1)] transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F6F2] mb-3">
              How It Works?
            </h2>
          </div>

<div className="grid md:grid-cols-3 gap-8">
  {[
    {
      icon: 'search',
      title: 'Browse Creators',
      desc: "Explore our curated directory of Pakistan's top creators across every niche imaginable. Filter by category, price, rating, or language to find your perfect match.",
    },
    {
      icon: 'calendar',
      title: 'Choose your Session',
      desc: 'Pick a session type that fits your goals and budget. From quick 15-minute advice calls to deep 60-minute coaching sessions, there is something for everyone.',
    },
    {
      icon: 'video',
      title: 'Connect and Learn',
      desc: 'Pay securely with Jazz Cash or Easy Paisa, pick a time slot, and join your video call. Take notes, ask questions, and level up your skills with personalized guidance.',
    },
  ].map((step, i) => (
    <div key={i} className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#141414] border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C8A97E"
          strokeWidth="1.5"
        >
          {step.icon === 'search' && (
            <>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </>
          )}

          {step.icon === 'calendar' && (
            <>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </>
          )}

          {step.icon === 'video' && (
            <>
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </>
          )}
        </svg>
      </div>

      {/* Title + Line */}
      <h3 className="font-serif text-lg font-semibold text-[#FFFFFF] mb-3 flex flex-col items-center">
        {step.title}

        <span className="w-[74px] border-t border-[#C8A97E] mt-2"></span>
      </h3>

      <p
        className="text-[#FFFFFF] opacity-60 max-w-xs mx-auto"
        style={{
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '22px',
          letterSpacing: '0%',
          textAlign: 'center',
        }}
      >
        {step.desc}
      </p>
    </div>
  ))}
</div>
        </div>
      </section>

      {/* Featured Creators */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F6F2]">
              Featured Creators
            </h2>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full border border-[rgba(200,169,126,0.5)] flex items-center justify-center hover:bg-[rgba(200,169,126,0.1)] transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button className="w-10 h-10 rounded-full border border-[rgba(200,169,126,0.5)] flex items-center justify-center hover:bg-[rgba(200,169,126,0.1)] transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {creators.map((creator, i) => (
              <div key={i} className="group bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl overflow-hidden hover:border-[#C8A97E] transition-all">
                <div className="relative">
                  <img src={creator.img} alt={creator.name} className="w-full aspect-[3/4] object-cover" />
                 <div className="absolute top-3 left-3 bg-[#C8A97E] text-[#0C0C0C] px-3 py-1 rounded-full text-[10px] font-medium font-sans shadow-sm">
  {creator.role}
</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-lg font-semibold text-[#F9F6F2]">{creator.name}</h3>
                    <div className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8A97E">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="font-sans text-xs text-[#F9F6F2] opacity-70">4.9</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-2">@{creator.name.toLowerCase().replace(/\s/g, '')}</p>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-4">{creator.name} is one of Pakistan's leading {creator.role.toLowerCase()} and lifestyle content creators...</p>
                  <p className="font-sans text-sm text-[#F9F6F2] mb-3">Starting from <span className="font-semibold text-[#C8A97E]">1200</span></p>
                  <Link href={`/creators/${creator.name.toLowerCase().replace(/\s/g, '')}`} className="w-full bg-[#C8A97E] text-[#0C0C0C] font-sans font-semibold py-3 rounded-full hover:opacity-90 transition-all block text-center">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by Category */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-left mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F9F6F2]">
              Explore by Category
            </h2>
          </div>

       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
  {categories.map((cat, i) => (
    <Link
      key={i}
      href="#"
      className="group relative aspect-[4/5] rounded-xl overflow-hidden"
    >
      {/* Image with blur effect */}
      <img
        src={cat.img}
        alt={cat.name}
        className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-300 blur-[1px] group-hover:blur-0"
      />

      {/* Dark + glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,12,12,0.92)] via-[rgba(12,12,12,0.45)] to-transparent backdrop-blur-[1px]" />

      {/* Icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[rgba(200,169,126,0.2)] border border-[rgba(200,169,126,0.5)] flex items-center justify-center backdrop-blur-sm">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C8A97E"
          strokeWidth="1.5"
        >
          {cat.icon === 'heart' && (
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          )}

          {cat.icon === 'microscope' && (
            <>
              <circle cx="12" cy="8" r="4" />
              <path d="M12 14v3" />
              <path d="M8 20h8" />
            </>
          )}

          {cat.icon === 'dumbbell' && (
            <>
              <rect x="4" y="10" width="4" height="4" rx="1" />
              <rect x="16" y="10" width="4" height="4" rx="1" />
              <line x1="8" y1="12" x2="16" y2="12" strokeWidth="2" />
            </>
          )}

          {cat.icon === 'award' && (
            <>
              <circle cx="12" cy="8" r="5" />
              <path d="M8 21l4-2 4 2" />
              <path d="M12 13v8" />
            </>
          )}

          {cat.icon === 'briefcase' && (
            <>
              <rect x="2" y="9" width="20" height="11" rx="2" />
              <path d="M8 9V7a4 4 0 0 1 8 0v2" />
            </>
          )}

          {cat.icon === 'book' && (
            <>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </>
          )}

          {cat.icon === 'camera' && (
            <>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </>
          )}

          {cat.icon === 'utensils' && (
            <>
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2c-2.8 0-5 2.2-5 5s2.2 5 5 5v8" />
              <path d="M16 7c0 2.8 2.2 5 5 5" />
            </>
          )}
        </svg>
      </div>

      {/* Text block (reduced spacing) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F9F6F2] leading-tight mb-0.5">
          {cat.name}
        </h3>
        <p className="font-sans text-xs text-[#F9F6F2] opacity-60">
          140+ creators
        </p>
      </div>

      {/* Explore CTA */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[#C8A97E] font-sans text-sm opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Explore</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C8A97E"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  ))}
</div>
        </div>
      </section>

      {/* Why Reachly */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#C8A97E]">
              Why Reachly
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: 'badge', title: 'Verified Creators Only', desc: 'Every creator on our platform is identity-verified and vetted for quality. No fake profiles, no empty promises, only real expertise you can trust.' },
              { icon: 'shield', title: 'Secure Local Payments', desc: 'Pay with JazzCash, EasyPaisa, or your bank card. Your money is held securely until the session is completed. Full refunds if a creator cancels.' },
              { icon: 'clock', title: 'Flexible Scheduling', desc: 'Book sessions that fit your life. Most creators offer evening and weekend slots. Reschedule up to 24 hours before your call with no penalty.' },
              { icon: 'bank', title: 'Money-Back Guarantee', desc: 'Not satisfied with your session? Report it within 24 hours and we will issue a full refund, no questions asked. Your trust is our priority.' },
            ].map((item, i) => (
              <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg p-6">
                <div className="w-14 h-14 mb-4 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1">
                    {item.icon === 'badge' && (
                      <>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </>
                    )}
                    {item.icon === 'shield' && (
                      <>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </>
                    )}
                    {item.icon === 'clock' && (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </>
                    )}
                    {item.icon === 'bank' && (
                      <>
                        <path d="M3 21h18" />
                        <path d="M3 10h18" />
                        <path d="M5 6l7-3 7 3" />
                        <path d="M4 10v11" />
                        <path d="M20 10v11" />
                      </>
                    )}
                  </svg>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-[#F9F6F2] mb-3 inline-block border-b border-[rgba(200,169,126,0.5)] pb-1">{item.title}</h3>
                <p className="font-sans text-sm text-[#F9F6F2] opacity-80 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-[#C8A97E]/80 to-[#C8A97E]/60 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-[100px] p-8 relative">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="#0C0C0C" className="mb-4">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="font-sans text-sm text-[#0C0C0C] mb-8 leading-relaxed">
                  "My session with Ayesha completely changed the way I approach content creation. Before working with her, I struggled with consistency and finding my own style. She guided me step by step, helped me understand my audience better, and gave me practical strategies that actually work. The content calendar she created made everything so much easier to manage, and I finally feel confident posting online. I've already seen better engagement on my content. Truly one of the best investments I've made for my personal brand!"
                </p>
                <div className="flex items-center gap-3">
                  <img src="/merium in creators section.png" alt="Jordan L" className="w-14 h-14 rounded-full border-2 border-[#0C0C0C]" />
                  <div>
                    <p className="font-serif text-base font-semibold text-[#0C0C0C]">Jordan L</p>
                    <p className="font-sans text-xs text-[#0C0C0C]/70">Los Angeles, CA</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#C8A97E] mb-4">
                What Our Community Says
              </h2>
              <p className="font-sans text-sm text-[#F9F6F2] opacity-80">
                Hear from creators and entrepreneurs who transformed their content strategy, built confidence, and achieved real growth through our guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Creators */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-8 sm:p-12 text-center overflow-hidden">
            {/* Dashed corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-dashed border-[#C8A97E]/40"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-dashed border-[#C8A97E]/40"></div>
            
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#C8A97E] mb-3">
              Are you a creator?
            </h2>
            <p className="font-sans text-sm text-[#F9F6F2] opacity-80 mb-6">
              Start earning with Reachly today
            </p>
            <Link href="/signup?type=creator" className="inline-block bg-[#C8A97E] text-[#0C0C0C] font-sans font-semibold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F9F6F2]">
              Frequently <span className="text-[#C8A97E]">Asked Questions</span>
            </h2>
          </div>

          <div className="max-w-6xl mx-auto space-y-3">
            {[
              { q: 'How does the booking process work?', a: 'We provide a full range of digital marketing services, including SEO, social media marketing, content marketing, PPC advertising, email marketing, web design, and analytics.' },
              { q: 'What payment methods do you accept?', a: 'We accept JazzCash, EasyPaisa, and all major debit/credit cards issued in Pakistan.' },
              { q: 'Can I cancel or reschedule a session?', a: 'Yes! You can reschedule up to 24 hours before your session, or cancel for a full refund if a creator cancels.' },
              { q: 'How are creators verified?', a: 'Every creator goes through an identity verification process and a quality review before joining our platform.' },
              { q: 'What happens if I am not satisfied with my session?', a: 'Report it within 24 hours and we\'ll issue a full refund, no questions asked.' },
              { q: 'How long are the sessions?', a: 'Most sessions are 30 or 60 minutes, but some creators offer shorter or longer sessions depending on their availability.' },
            ].map((faq, i) => (
              <div 
                key={i} 
                className={`${
                  openFaq === i ? 'bg-[#141414] border border-[#C8A97E]' : 'bg-[#141414] border border-[rgba(255,255,255,0.2)]'
                } rounded-lg overflow-hidden transition-all`}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[rgba(200,169,126,0.05)] transition-colors"
                >
                  <span className={`${openFaq === i ? 'text-[#C8A97E]' : 'text-[#F9F6F2]'} font-sans text-base font-semibold`}>
                    {faq.q}
                  </span>
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
                    <p className="font-sans text-sm text-[#F9F6F2]/80">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6 sm:p-10 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F6F2] mb-3">
                  <span className="text-[#C8A97E]">Ready</span> to connect?
                </h2>
                <p className="font-sans text-sm text-[#F9F6F2]/70 mb-6">
                  Join thousands of Pakistanis learning from their favourite creators
                </p>
                <Link href="/welcome" className="inline-block bg-[#C8A97E] text-[#0C0C0C] font-sans font-semibold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-all">
                  Get Started
                </Link>
              </div>
              <div className="relative h-48 sm:h-64 flex items-end justify-end">
                <img src="/sara khan.png" alt="Sara Khan" className="h-40 sm:h-56 object-contain relative z-10" />
                <img src="/merium-footer.png" alt="Merium" className="h-40 sm:h-56 object-contain absolute bottom-0 right-16 sm:right-40 z-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
