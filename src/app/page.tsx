import Link from 'next/link';
import CreatorNavbar from '@/components/CreatorNavbar';
import Footer from '@/components/Footer';

export default function Home() {
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
                  <button className="w-full bg-[#C8A97E] text-[#0C0C0C] font-sans font-semibold py-3 rounded-full hover:opacity-90 transition-all">
                    Book Now
                  </button>
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
              <Link key={i} href="#" className="group relative aspect-[4/5] rounded-xl overflow-hidden">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,12,12,0.9)] via-[rgba(12,12,12,0.4)] to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[rgba(200,169,126,0.2)] border border-[rgba(200,169,126,0.5)] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                    {cat.icon === 'heart' && <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />}
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
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F9F6F2] mb-1">{cat.name}</h3>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-60">140+ creators</p>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[#C8A97E] font-sans text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
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
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F6F2] mb-3">
              Why Reachly
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: 'shield', title: 'Verified Creators Only', desc: 'All creators are verified to ensure authenticity and quality.' },
              { icon: 'lock', title: 'Secure 1-on-1 Sessions', desc: 'Your conversations are private and encrypted end-to-end.' },
              { icon: 'clock', title: 'Flexible Scheduling', desc: 'Book sessions at times that work best for your schedule.' },
              { icon: 'star', title: 'Money-Back Guarantee', desc: 'Not satisfied? Get a full refund within 24 hours.' },
            ].map((item, i) => (
              <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-6">
                <div className="w-12 h-12 mb-4 rounded-full bg-[rgba(200,169,126,0.1)] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                    {item.icon === 'shield' && (
                      <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>
                    )}
                    {item.icon === 'lock' && (
                      <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>
                    )}
                    {item.icon === 'clock' && (
                      <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>
                    )}
                    {item.icon === 'star' && (
                      <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>
                    )}
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-2">{item.title}</h3>
                <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6 mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="mb-4">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="font-serif text-lg font-semibold text-[#F9F6F2] mb-4">
                    What Our Community Says
                  </p>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-60">
                    Hear from people who have had amazing experiences on Reachly.
                  </p>
                </div>
                <img src="/merium in creators section.png" alt="Testimonial" className="w-full rounded-xl" />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {[
                { name: 'Ahmed Khan', role: 'Software Engineer', text: 'Had an amazing session with Mahira Khan! She gave such valuable career advice. 10/10 recommend.', img: '/sara khan in creators.png' },
                { name: 'Sara Ahmed', role: 'Entrepreneur', text: 'Booking a session was so easy, and the creator was incredibly helpful. Will book again!', img: '/merium.png' },
                { name: 'Ali Hassan', role: 'Student', text: 'Best investment I made for my career. Got personalized advice that I couldn\'t find anywhere else.', img: '/ahad raza mir.png' },
              ].map((testimonial, i) => (
                <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-6">
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-80 mb-6">{testimonial.text}</p>
                  <div className="flex items-center gap-3">
                    <img src={testimonial.img} alt={testimonial.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-serif text-sm font-semibold text-[#F9F6F2]">{testimonial.name}</p>
                      <p className="font-sans text-xs text-[#C8A97E]">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill="#C8A97E">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Creators */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #C8A97E 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative p-8 sm:p-12 text-center">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F6F2] mb-4">
                Are you a creator?
              </h2>
              <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-8 max-w-lg mx-auto">
                Join Reachly and start monetizing your expertise by connecting with your audience one-on-one.
              </p>
              <Link href="/signup?type=creator" className="inline-block bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold px-8 py-4 rounded-full text-lg hover:opacity-90 transition-all">
                Become a Creator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F6F2] mb-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { q: 'How do I book a session?', a: 'Simply browse our creators, select one you like, and book a time from their available calendar.' },
              { q: 'What payment methods are accepted?', a: 'We accept all major credit cards, debit cards, and bank transfers.' },
              { q: 'Can I reschedule or cancel a session?', a: 'Yes, you can reschedule or cancel up to 24 hours before your session for a full refund.' },
              { q: 'How do creators get paid?', a: 'Creators receive payments weekly, bi-weekly, or monthly depending on their preference.' },
              { q: 'Is my information secure?', a: 'Absolutely! We use bank-level encryption to protect all your data and conversations.' },
            ].map((faq, i) => (
              <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl overflow-hidden">
                <button className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[rgba(200,169,126,0.05)] transition-colors">
                  <span className="font-serif text-sm font-semibold text-[#F9F6F2]">{faq.q}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F6F2] mb-4">
                Ready to connect?
              </h2>
              <p className="font-sans text-sm text-[#F9F6F2] opacity-60">
                Join thousands of people who are already learning from their favorite creators.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/welcome" className="bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold px-8 py-4 rounded-full text-lg hover:opacity-90 transition-all">
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
