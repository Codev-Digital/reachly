'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CreatorNavbar from '@/components/CreatorNavbar';
import Footer from '@/components/Footer';
import Image from "next/image";

/* ─── Fade-in-up wrapper for scroll-triggered sections ─── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeStep, setActiveStep] = useState(0);
  const [creatorPage, setCreatorPage] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [featuredPage, setFeaturedPage] = useState(0);
  const [eventsPage, setEventsPage] = useState(0);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [dbCreators, setDbCreators] = useState<any[]>([]);
  const [loadingDbCreators, setLoadingDbCreators] = useState(true);

  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Refs for How It Works swipe/scroll
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);

  const handleHowItWorksTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleHowItWorksTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;
    
    // Horizontal swipe threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        setActiveStep(prev => (prev < 2 ? prev + 1 : 0));
      } else {
        setActiveStep(prev => (prev > 0 ? prev - 1 : 2));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleHowItWorksWheel = (e: React.WheelEvent) => {
    // Only intercept horizontal scrolls to prevent trapping vertical scroll on laptops
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
      const now = Date.now();
      if (now - lastScrollTime.current < 400) return; // Debounce
      
      if (e.deltaX > 0) {
        setActiveStep(prev => (prev < 2 ? prev + 1 : 0));
      } else {
        setActiveStep(prev => (prev > 0 ? prev - 1 : 2));
      }
      lastScrollTime.current = now;
    }
  };

  const scrollFeatured = (direction: 'left' | 'right') => {
    if (featuredScrollRef.current) {
      const scrollAmount = 320;
      featuredScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 320;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    async function fetchDbCreators() {
      try {
        const res = await fetch('/api/creators');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.creators)) {
            const sorted = [...data.creators].sort((a, b) => {
              const getPriority = (creator: any) => {
                const name = (creator.displayName || '').toLowerCase();
                const uname = (creator.username || '').toLowerCase();
                if (name.includes('codev') || uname.includes('codev')) return 1;
                if (name.includes('abdoo') || name.includes('abdullah') || uname.includes('abdoo') || uname.includes('abdullah')) return 2;
                return 3;
              };
              return getPriority(a) - getPriority(b);
            });
            setDbCreators(sorted);
          }
        }
      } catch (err) {
        console.error('Error fetching database creators:', err);
      } finally {
        setLoadingDbCreators(false);
      }
    }
    fetchDbCreators();
  }, []);

  // Clear cookies only if user is fully unauthenticated (not logged in at all).
  // Do NOT log out authenticated users here — even if they haven't seen the welcome screen yet.
  // That flow is handled by the /welcome page itself.
  useEffect(() => {
    const clearStorageIfNeeded = async () => {
      // Wait for session to finish loading
      await new Promise(resolve => setTimeout(resolve, 500));

      const shouldClear =
        status === 'unauthenticated' ||
        (!session && status !== 'loading');

      if (shouldClear) {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        localStorage.clear();
        sessionStorage.clear();
      }
    };

    clearStorageIfNeeded();
  }, [status, session]);

  const toggleFavorite = (name: string) => {
    if (status !== 'authenticated') {
      setShowLoginModal(true);
      return;
    }
    setFavorites(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
  };

  const toggleSaveEvent = (id: string) =>
    setSavedEvents(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  /* ── creator data used in multiple sections ── */
  const allCreators = [
    { name: 'Mahira Khan', img: '/Avatars/3.jpg' },
    { name: 'Danish Taimoor', img: '/Avatars/1.jpg' },
    { name: 'Hania Amir', img: '/Avatars/5.jpg' },
    { name: 'Feroz Khan', img: '/Avatars/2.jpg' },
    { name: 'Dure Fishan', img: '/Avatars/6.jpg' },
    { name: 'Bilal Abbas', img: '/Avatars/4.jpg' },
    { name: 'Ahsan Khan', img: '/Avatars/7.jpg' },
    { name: 'Sajal Ali', img: '/Avatars/8.jpg' },
  ];
  /* duplicate for seamless loop */
  const marqueeCreators = [...allCreators, ...allCreators];

  const testimonials = [
    { name: 'Jordan L.', loc: 'Los Angeles, CA', text: '"Ayesha helped me find my style, stay consistent, and grow my engagement. I feel much more confident creating content. One of the best investments I\'ve made for my personal brand!"', avatar: '/Avatars/8.jpg', commaIndex: 0, dot1: '#A0B4E8', dot2: '#B8E0C8' },
    { name: 'Zara A.', loc: 'Karachi, PK', text: '"Reachly helped me connect with Mahira Khan directly. The session was incredible and changed how I view personal branding!"', avatar: '/Avatars/2.jpg', commaIndex: 1, dot1: '#F4C5C5', dot2: '#A0C8E8' },
    { name: 'Ali R.', loc: 'Lahore, PK', text: '"Booking was seamless. Paid through JazzCash and got a confirmation instantly. Highly recommend the platform!"', avatar: '/Avatars/7.jpg', commaIndex: 2, dot1: '#B8E8B8', dot2: '#E8D9A0' },
    { name: 'Sana M.', loc: 'Islamabad, PK', text: '"I never thought I could afford a 1-on-1 with my favourite creator. Reachly made it possible and affordable."', avatar: '/Avatars/4.jpg', commaIndex: 0, dot1: '#C8D8F8', dot2: '#F4C5C5' },
    { name: 'Hassan T.', loc: 'Peshawar, PK', text: '"The verification badge gives me confidence. Every creator I booked was professional and punctual."', avatar: '/Avatars/15.jpg', commaIndex: 1, dot1: '#A0B4E8', dot2: '#B8E0C8' },
    { name: 'Nida F.', loc: 'Multan, PK', text: '"Got actionable advice on growing my YouTube channel. Worth every rupee. Reachly is a game changer!"', avatar: '/Avatars/6.jpg', commaIndex: 2, dot1: '#F4C5C5', dot2: '#B8E8B8' },
    { name: 'Ayesha K.', loc: 'Dubai, UAE', text: '"Super smooth experience from booking to the call. Will definitely book again. Love Reachly!"', avatar: '/Avatars/10.jpg', commaIndex: 0, dot1: '#B8E8B8', dot2: '#C8D8F8' },
    { name: 'Bilal Ch.', loc: 'Faisalabad, PK', text: '"I was skeptical at first, but after my first session I was hooked. The creator gave genuine value!"', avatar: '/Avatars/1.jpg', commaIndex: 1, dot1: '#C8D8F8', dot2: '#E8D9A0' },
  ];
  const commaSvgs = ['/assets/comma-1.svg', '/assets/comma-2.svg', '/assets/comma3.svg'];
  const marqueeTestimonials1 = [...testimonials, ...testimonials];
  const marqueeTestimonials2 = [...testimonials].reverse().concat([...testimonials].reverse());

  const faqItems = [
    { q: 'How does the booking process work?', a: 'Browse creators, select a session type and time slot that fits your schedule, pay securely via JazzCash or EasyPaisa, and join the video call at the booked time.' },
    { q: 'What payment methods do you accept?', a: 'We accept JazzCash, EasyPaisa, and major bank cards. Your payment is held securely until the session is complete.' },
    { q: 'Can I cancel or reschedule a session?', a: 'Yes! You can reschedule up to 24 hours before your session with no penalty. Cancellations within 24 hours may be subject to a fee.' },
    { q: 'How are creators verified?', a: 'Every creator goes through identity verification and quality vetting before they can list on Reachly. We check credentials, audience authenticity, and past reviews.' },
    { q: 'What happens if I am not satisfied?', a: 'Report within 24 hours and we will issue a full refund, no questions asked. Your satisfaction is our top priority.' },
    { q: 'How long are the sessions?', a: 'Session lengths vary by creator — typically 15, 30, or 60 minutes. You can see the options on each creator\'s profile page.' },
  ];

  const categoryCreators = [
    { name: 'Sarah Khan', handle: '@sarahkhan', tag: 'Sponsored', img: '/Avatars/12.jpg', rating: '4.9', description: "Pakistan's leading fashion and lifestyle content creator.", price: '1200 PKR', category: 'Fashion', bgClass: 'bg-[#D0E1FD]', isVerified: false },
    { name: 'Dananeer Mobeen', handle: '@dananeermobeen', tag: 'Verified', img: '/Avatars/5.jpg', rating: '4.9', description: "Viral sensation & lifestyle creator with millions of fans.", price: '1200 PKR', category: 'Lifestyle', bgClass: 'bg-[#B88E75]', isVerified: true },
    { name: 'Bilal Abbas', handle: '@bilalabbas', tag: 'Sponsored', img: '/Avatars/10.jpg', rating: '4.9', description: "Award-winning actor and digital creator from Pakistan.", price: '1200 PKR', category: 'Tech', bgClass: 'bg-[#A7D8B9]', isVerified: false },
    { name: 'Dure Fishan', handle: '@durefishan', tag: 'Verified', img: '/Avatars/6.jpg', rating: '4.9', description: "Beauty, fashion & lifestyle creator beloved across Pakistan.", price: '1200 PKR', category: 'Beauty', bgClass: 'bg-[#ECA2A2]', isVerified: true },
  ];

  // Explore By Category uses the same real-time DB creators (already priority-sorted)
  const filteredCategoryCreators = activeCategory === 'All Categories'
    ? dbCreators
    : dbCreators.filter(creator => (creator.niches || []).includes(activeCategory) || creator.category === activeCategory);

  return (
    <div className="min-h-screen">
      <CreatorNavbar />

      {/* ════════════════════════════════════════
            HERO SECTION
        ════════════════════════════════════════ */}
      <section className="relative overflow-hidden flex items-center [@media(min-height:900px)]:h-screen [@media(min-height:900px)]:min-h-screen">
        <img
          src="/assets/new-bg-image.png"
          alt=""
          className="fixed inset-0 w-screen h-screen object-cover object-top -z-10"
        />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-28 pb-16 [@media(min-height:900px)]:pt-24 [@media(min-height:900px)]:pb-8 relative z-10">
          <div className="text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="font-sans text-xs sm:text-sm text-white/80 tracking-widest uppercase mb-4">
                PAKISTAN'S FIRST CREATOR BOOKING PLATFORM
              </p>
              <h1 className="font-anton text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
                Book a 1 on 1 With<br />Your Favorite Creator
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link href="/explore-creators" className="bg-white text-[#001F7D] font-sans font-semibold px-8 py-3 rounded-full text-sm hover:bg-white/90 transition-all">
                  Explore Creators
                </Link>
                <Link href="/signup?type=creator" className="border border-white/50 text-white font-sans font-semibold px-8 py-3 rounded-full text-sm hover:bg-white/10 transition-all">
                  Become a Creator
                </Link>
              </div>
            </motion.div>

            {/* Rotating Creator Cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center justify-center gap-6 flex-wrap"
            >
              {[
                { img: '/Avatars/7.jpg', name: 'Ahsan Khan' },
                { img: '/Avatars/2.jpg', name: 'Mahira Khan' },
                { img: '/Avatars/15.jpg', name: 'Fawad Khan' },
                { img: '/Avatars/8.jpg', name: 'Sajal Ali' },
              ].map((creator, i) => {
                const buttonRef = useRef<HTMLDivElement>(null);
                const [position, setPosition] = useState({ x: 0, y: 0 });
                const [isHovered, setIsHovered] = useState(false);

                const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
                  if (buttonRef.current) {
                    const rect = buttonRef.current.getBoundingClientRect();
                    const buttonCenterX = rect.left + rect.width / 2;
                    const buttonCenterY = rect.top + rect.height / 2;

                    const x = e.clientX - buttonCenterX;
                    const y = e.clientY - buttonCenterY;

                    // Stronger magnetic effect
                    const maxMove = 15;
                    const moveX = Math.max(-maxMove, Math.min(maxMove, x * 0.5));
                    const moveY = Math.max(-maxMove, Math.min(maxMove, y * 0.5));

                    setPosition({ x: moveX, y: moveY });
                  }
                };

                const handleMouseLeave = () => {
                  setPosition({ x: 0, y: 0 });
                };

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30, rotate: i % 2 === 0 ? -8 : 8 }}
                    animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -6 : 6 }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                    whileHover={{ y: -10, rotate: 0, scale: 1.05 }}
                    className="relative group"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <div className="w-40 h-56 sm:w-48 sm:h-64 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
                      <img src={creator.img} alt={creator.name} className="w-full h-full object-cover" />
                    </div>
                    <motion.div
                      ref={buttonRef}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={isHovered ? { opacity: 1, scale: 1.05, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
                      className="absolute -right-6 top-1/2 -translate-y-1/2 z-20
                w-16 h-16 sm:w-20 sm:h-20 rounded-full
                flex items-center justify-center
                text-xs sm:text-sm font-semibold text-center
                cursor-pointer"
                      style={{ x: position.x, y: position.y }}
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 20 },
                        y: { type: "spring", stiffness: 300, damping: 20 },
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 }
                      }}
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 opacity-75 blur-xl" />
                      {/* Button background */}
                      <div className="relative w-full h-full rounded-full bg-[#0033A0] text-white flex items-center justify-center shadow-[0_0_30px_rgba(0,51,160,0.6)] backdrop-blur-md">
                        Explore
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
            PAKISTAN'S TOP CREATORS — auto marquee
        ════════════════════════════════════════ */}
      {/* <section className="py-20 bg-[#F7F7FA] text-[#0C0C0C]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeUp className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="font-anton font-bold text-5xl sm:text-6xl md:text-7xl text-black leading-tight uppercase tracking-tight">
                  Pakistan's <span className="text-[#0012FF]">Top Creators</span>
                </h2>
                <p className="font-sans text-sm sm:text-base text-gray-500 mt-2">
                  Connect, Collaborate and create with the most trusted voices across Pakistan
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCreatorPage(prev => (prev > 0 ? prev - 1 : 1))}
                  className="w-12 h-12 rounded-full border border-[#0012FF] flex items-center justify-center text-[#0012FF] hover:bg-[#0012FF]/5 transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={() => setCreatorPage(prev => (prev < 1 ? prev + 1 : 0))}
                  className="w-12 h-12 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:bg-[#0012FF]/95 transition-all active:scale-95 shadow-md shadow-[#0012FF]/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </FadeUp>

            <motion.div
              animate={{ x: creatorPage === 0 ? 0 : -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6"
            >
              {allCreators.map((creator, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative h-[360px] w-full rounded-3xl overflow-hidden shadow-lg group bg-white cursor-pointer"
                >
                <img
    src={creator.img}
    alt={creator.name}
    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-6">
                    <span className="text-white font-sans font-bold text-lg tracking-wide drop-shadow-md">{creator.name}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section> */}



      {/* ════════════════════════════════════════
            FEATURED CREATORS
        ════════════════════════════════════════ */}
      <section className="py-20 bg-[#F7F7FA] text-[#0C0C0C] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeUp className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="font-anton font-bold text-5xl sm:text-6xl md:text-7xl text-black leading-tight uppercase tracking-tight">
                Featured <span className="text-[#0012FF]">Creators</span>
              </h2>
              <p className="font-sans text-sm sm:text-base text-gray-500 mt-2">We've got the best of the best! Our curated talent go above and beyond</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => scrollFeatured('left')} className="w-12 h-12 rounded-full border border-[#0012FF] flex items-center justify-center text-[#0012FF] hover:bg-[#0012FF]/5 transition-all cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => scrollFeatured('right')} className="w-12 h-12 rounded-full bg-[#0012FF] flex items-center justify-center text-white shadow-md shadow-[#0012FF]/20 hover:bg-[#0010d0] transition-all cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </FadeUp>

          <div
            ref={featuredScrollRef}
            className="flex flex-nowrap items-stretch gap-6 overflow-x-auto overflow-y-visible no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth py-4 max-w-full"
          >
            {loadingDbCreators ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col w-[290px] sm:w-[325px] shrink-0">
                  <div className="w-full h-[300px] sm:h-[330px] rounded-[24px] bg-gray-200 animate-pulse mb-3" />
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-md mb-2" />
                  <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded-md" />
                </div>
              ))
            ) : dbCreators.length > 0 ? (
              dbCreators.map((creator, index) => {
                const isFav = favorites.includes(creator.username);
                return (
                  <motion.div
                    key={creator.id || creator.username || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    onClick={() => router.push(`/creators/${creator.username}/book-session`)}
                    className="flex flex-col w-[290px] sm:w-[325px] shrink-0 group cursor-pointer"
                  >
                    {/* Top Image Container */}
                    <div className="relative w-full h-[300px] sm:h-[330px] rounded-[24px] overflow-hidden bg-gray-100 mb-3 shadow-xs transition-transform duration-300 group-hover:scale-[1.01]">
                      <img
                        src={creator.profilePhoto || '/merium.png'}
                        alt={creator.displayName}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Top Left Badge */}
                      <span
                        className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs tracking-wide ${creator.isVerified
                          ? 'bg-white/90 text-[#12B76A] backdrop-blur-xs'
                          : 'bg-[#EEF2FF] text-[#0012FF]'
                          }`}
                      >
                        {creator.isVerified ? 'Verified' : 'Featured'}
                      </span>

                      {/* Top Right Heart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(creator.username);
                        }}
                        className="absolute top-3.5 right-3.5 z-20 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                        aria-label="Add to favorites"
                      >
                        <svg
                          className={`w-6 h-6 transition-colors duration-200 ${isFav ? 'text-[#FF3B3B] fill-[#FF3B3B] drop-shadow-md' : 'text-white fill-white drop-shadow-md'
                            }`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>

                    {/* Info Box Below Image */}
                    <div className="px-0.5 space-y-1 text-left">
                      {/* Title & Rating */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-base sm:text-lg text-black font-sans flex items-center gap-1.5 leading-tight truncate">
                          <span>{creator.displayName}</span>
                          {creator.isVerified && (
                            <svg className="w-4.5 h-4.5 text-[#12B76A] fill-current shrink-0" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          )}
                        </h3>
                        <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-500 shrink-0">
                          ★ {creator.rating || '4.9'}
                        </span>
                      </div>

                      {/* Handle */}
                      <p className="text-xs text-gray-400 font-medium font-sans">@{creator.username}</p>

                      {/* Short Bio */}
                      <p className="text-xs text-gray-400 font-sans leading-relaxed line-clamp-2 pt-0.5">
                        {creator.shortBio || 'Content Creator & Mentor'}
                      </p>

                      {/* Price Row */}
                      <div className="pt-1.5 flex items-center gap-1 text-xs text-gray-400 font-sans">
                        <span>Starting from</span>
                        <strong className="text-black font-black text-sm sm:text-base ml-1">
                          {creator.startingPrice ? `${creator.startingPrice} PKR` : '1000 PKR'}
                        </strong>
                      </div>

                      {/* Book Now Link */}
                      <div>
                        <span
                          className="text-xs sm:text-sm font-bold text-[#0012FF] underline hover:text-[#0010d0] font-sans pt-1 inline-block"
                        >
                          Book Now
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400 font-medium">
                No featured creators found.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════ */}
      <section 
        className="py-24 bg-[#F7F7FA] text-[#0C0C0C] border-t border-gray-100"
        onTouchStart={handleHowItWorksTouchStart}
        onTouchEnd={handleHowItWorksTouchEnd}
        onWheel={handleHowItWorksWheel}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: animated card stack */}
            <FadeUp className="relative h-[360px] sm:h-[400px] flex items-center justify-center pl-16 sm:pl-20 md:pl-24">
              {[
                { src: '/assets/how_it_works_3.png', bg: 'bg-[#FFD6E8]', step: 2 },
                { src: '/assets/how_it_works_2.jpg', bg: 'bg-[#FFE699]', step: 1 },
                { src: '/assets/how_it-works_1.png', bg: 'bg-[#C0E5FA]', step: 0 },
              ].map(({ src, bg, step }) => (
                <motion.div
                  key={step}
                  animate={{
                    zIndex: activeStep === step ? 3 : activeStep === (step + 1) % 3 ? 2 : 1,
                    x: activeStep === step ? 0 : activeStep === (step + 1) % 3 ? -40 : -80,
                    y: activeStep === step ? 0 : activeStep === (step + 1) % 3 ? 15 : 30,
                    rotate: activeStep === step ? -5 : activeStep === (step + 1) % 3 ? -15 : -25,
                    scale: activeStep === step ? 1 : activeStep === (step + 1) % 3 ? 0.95 : 0.9,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  className={`absolute w-[200px] h-[260px] sm:w-[280px] sm:h-[350px] rounded-3xl overflow-hidden shadow-xl ${bg}`}
                >
                  <img src={src} alt="How it works" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </FadeUp>

            {/* Right: step text */}
            <FadeUp delay={0.15} className="flex flex-col justify-center">
              <h2 className="font-anton font-bold text-5xl sm:text-6xl md:text-7xl text-black leading-tight uppercase tracking-tight mb-8">
                How <span className="text-[#0012FF]">It Works</span>
              </h2>
              <div className="min-h-[160px] mb-8">
                <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-[#0012FF]/10 rounded-xl text-[#0012FF] w-12 h-12 flex items-center justify-center">
                      {activeStep === 0 && <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                      {activeStep === 1 && <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                      {activeStep === 2 && <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                    </div>
                    <h3 className="font-sans font-bold text-2xl text-black">
                      {activeStep === 0 && 'Browse Creators'}
                      {activeStep === 1 && 'Choose Your Session'}
                      {activeStep === 2 && 'Connect & Learn'}
                    </h3>
                  </div>
                  <p className="font-sans text-base text-gray-600 leading-relaxed">
                    {activeStep === 0 && "Explore our curated directory of Pakistan's top creators across every niche imaginable. Filter by category, price, rating, or language to find your perfect match."}
                    {activeStep === 1 && "Pick a session type that fits your goals and budget. From quick 15-minute advice calls to deep 60-minute coaching sessions, there is something for everyone."}
                    {activeStep === 2 && "Pay securely with Jazz Cash or Easy Paisa, pick a time slot, and join your video call. Take notes, ask questions, and level up your skills with personalized guidance."}
                  </p>
                </motion.div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveStep(prev => (prev > 0 ? prev - 1 : 2))} className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#0012FF] hover:text-[#0012FF] transition-all active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => setActiveStep(prev => (prev < 2 ? prev + 1 : 0))} className="w-12 h-12 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:bg-[#0012FF]/95 transition-all active:scale-95 shadow-md shadow-[#0012FF]/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
            EXPLORE BY CATEGORY
        ════════════════════════════════════════ */}
      <section className="py-20 bg-[#F7F7FA] text-[#0C0C0C] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-12">
            <h2 className="font-anton font-bold text-5xl sm:text-6xl md:text-7xl text-black leading-tight uppercase tracking-tight">
              Explore By <span className="text-[#0012FF]">Category</span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-gray-500 mt-2">Explore categories and find the right option for your needs.</p>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left category buttons — horizontal scroll on mobile, vertical on desktop */}
            <div className="lg:col-span-3">
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 no-scrollbar">
                {[
                  { name: 'All Categories', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
                  { name: 'Lifestyle', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
                  { name: 'Tech', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                  { name: 'Fitness', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
                  { name: 'Fashion', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
                  { name: 'Business', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                  { name: 'Education', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.168.477-4.5 1.253" /></svg> },
                  { name: 'Beauty', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
                  { name: 'Food', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                ].map((cat, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setActiveCategory(cat.name); setCategoryIndex(0); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-sans font-medium whitespace-nowrap shrink-0 cursor-pointer ${activeCategory === cat.name ? 'bg-[#0012FF] text-white shadow-md shadow-[#0012FF]/20' : 'bg-white text-gray-500 border border-gray-100'}`}
                  >
                    {cat.icon} {cat.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Right: creators horizontal slider */}
            <div className="lg:col-span-9 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-sans text-gray-400">Use arrows to navigate</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => scrollCategory('left')}
                    className="w-10 h-10 rounded-full border border-[#0012FF] flex items-center justify-center text-[#0012FF] hover:bg-[#0012FF]/5 transition-all cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={() => scrollCategory('right')}
                    className="w-10 h-10 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:bg-[#0010d0] transition-all cursor-pointer shadow-md shadow-[#0012FF]/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>

              {/* Single row horizontal slider */}
              <div
                ref={categoryScrollRef}
                className="flex flex-nowrap items-stretch gap-6 overflow-x-auto overflow-y-visible no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth py-4 max-w-full"
              >
                {loadingDbCreators ? (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col w-[290px] sm:w-[325px] shrink-0">
                      <div className="w-full h-[300px] sm:h-[330px] rounded-[24px] bg-gray-200 animate-pulse mb-3" />
                      <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-md mb-2" />
                      <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded-md" />
                    </div>
                  ))
                ) : filteredCategoryCreators.length > 0 ? (
                  filteredCategoryCreators.map((creator, index) => {
                    const isFav = favorites.includes(creator.username);
                    return (
                      <motion.div
                        key={creator.id || creator.username || index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        onClick={() => router.push(`/creators/${creator.username}/book-session`)}
                        className="flex flex-col w-[290px] sm:w-[325px] shrink-0 group cursor-pointer"
                      >
                        {/* Top Image Container */}
                        <div className="relative w-full h-[300px] sm:h-[330px] rounded-[24px] overflow-hidden bg-gray-100 mb-3 shadow-xs transition-transform duration-300 group-hover:scale-[1.01]">
                          <img
                            src={creator.profilePhoto || '/merium.png'}
                            alt={creator.displayName}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Top Left Badge */}
                          <span
                            className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs tracking-wide ${creator.isVerified
                              ? 'bg-white/90 text-[#12B76A] backdrop-blur-xs'
                              : 'bg-[#EEF2FF] text-[#0012FF]'
                              }`}
                          >
                            {creator.isVerified ? 'Verified' : 'Featured'}
                          </span>

                          {/* Top Right Heart Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(creator.username);
                            }}
                            className="absolute top-3.5 right-3.5 z-20 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                            aria-label="Add to favorites"
                          >
                            <svg
                              className={`w-6 h-6 transition-colors duration-200 ${isFav ? 'text-[#FF3B3B] fill-[#FF3B3B] drop-shadow-md' : 'text-white fill-white drop-shadow-md'
                                }`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </button>
                        </div>

                        {/* Info Box Below Image */}
                        <div className="px-0.5 space-y-1 text-left">
                          {/* Title & Rating */}
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-base sm:text-lg text-black font-sans flex items-center gap-1.5 leading-tight truncate">
                              <span>{creator.displayName}</span>
                              {creator.isVerified && (
                                <svg className="w-4.5 h-4.5 text-[#12B76A] fill-current shrink-0" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                              )}
                            </h3>
                            <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-500 shrink-0">
                              ★ {creator.rating}
                            </span>
                          </div>

                          {/* Handle */}
                          <p className="text-xs text-gray-400 font-medium font-sans">@{creator.username}</p>

                          {/* Short Bio */}
                          <p className="text-xs text-gray-400 font-sans leading-relaxed line-clamp-2 pt-0.5">
                            {creator.shortBio}
                          </p>

                          {/* Price Row */}
                          <div className="pt-1.5 flex items-center gap-1 text-xs text-gray-400 font-sans">
                            <span>Starting from</span>
                            <strong className="text-black font-black text-sm sm:text-base ml-1">
                              {creator.startingPrice > 0 ? `${creator.startingPrice} PKR` : 'Free'}
                            </strong>
                          </div>

                          {/* Book Now Link */}
                          <div>
                            <Link
                              href={`/creators/${creator.username}/book-session`}
                              className="text-xs sm:text-sm font-bold text-[#0012FF] underline hover:text-[#0010d0] font-sans pt-1 inline-block"
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="w-full flex items-center justify-center py-10">
                    <img src="/no-creators.webp" alt="No creators found" className="w-48 sm:w-64 h-auto object-contain opacity-80" />
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
            UPCOMING EVENTS
        ════════════════════════════════════════ */}
      <section className="py-20 bg-[#F7F7FA] text-[#0C0C0C] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeUp className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="font-anton font-bold text-5xl sm:text-6xl md:text-7xl text-black leading-tight uppercase tracking-tight">
                Upcoming <span className="text-[#0012FF]">Events</span>
              </h2>
              <p className="font-sans text-sm sm:text-base text-gray-500 mt-2">Join live sessions, workshops, and community events to learn, connect, and grow.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEventsPage(prev => (prev > 0 ? prev - 1 : 1))} className="w-12 h-12 rounded-full border border-[#0012FF] flex items-center justify-center text-[#0012FF] hover:bg-[#0012FF]/5 transition-all active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => setEventsPage(prev => (prev < 1 ? prev + 1 : 0))} className="w-12 h-12 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:bg-[#0012FF]/95 transition-all active:scale-95 shadow-md shadow-[#0012FF]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </FadeUp>

          <motion.div
            animate={{ x: eventsPage === 0 ? 0 : -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              { id: 'event-1', title: 'Creator Growth', subtitle: 'Grow your audience and brand.', time: '2PM - 6PM', date: '5 July 2026', location: 'Nishat Hotel, Gulberg, Lahore', img: '/assets/event-1.jpg' },
              { id: 'event-2', title: 'Creator Growth', subtitle: 'Grow your audience and brand.', time: '2PM - 6PM', date: '5 July 2026', location: 'Nishat Hotel, Gulberg, Lahore', img: '/assets/event-2.jpg' },
            ].map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative h-[300px] sm:h-[350px] rounded-[30px] overflow-hidden group shadow-lg"
              >
                <img src={event.img} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                <button
                  onClick={() => toggleSaveEvent(event.id)}
                  className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer z-10 active:scale-90 border border-white/25"
                >
                  <svg
                    className={`w-6 h-6 transition-all duration-300 ${savedEvents.includes(event.id)
                      ? 'fill-white text-white'
                      : 'text-white'
                      }`}
                    fill={savedEvents.includes(event.id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 21l-5-3-5 3V5a2 2 0 012-2h6a2 2 0 012 2v16z"
                    />
                  </svg>
                </button>
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                  <div className="text-white">
                    <h3 className="font-sans font-black text-2xl sm:text-3xl tracking-tight leading-none mb-1">{event.title}</h3>
                    <p className="font-sans text-xs sm:text-sm text-white/70 mb-4">{event.subtitle}</p>
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/90">
                        <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {event.time}
                        <span className="mx-1 text-white/40">|</span>
                        <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/90">
                        <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        {event.location}
                      </div>
                    </div>
                  </div>
                  <Link href="/" className="shrink-0 bg-white text-blue-600 hover:bg-white/95 px-5 py-2.5 rounded-full font-sans font-bold text-xs sm:text-sm tracking-wide shadow-lg transition-all active:scale-95 whitespace-nowrap">Coming soon</Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
            WHY REACHLY
        ════════════════════════════════════════ */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-14">
            <h2 className="font-anton font-bold text-black text-5xl sm:text-6xl md:text-7xl leading-tight uppercase tracking-tight">
              Why <span className="text-[#0012FF]">Reachly</span>
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Verified Creators card — marquee grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm"
            >
              <h3 className="font-sans font-bold text-xl text-black mb-2">Verified Creators Only</h3>
              <p className="font-sans text-sm text-gray-500 mb-6">Every creator on our platform is identity-verified and vetted for quality. No fake profiles, no empty promises, only real expertise you can trust.</p>

              {/* Two-row auto-marquee */}
              <div className="overflow-hidden relative space-y-3">
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent" />

                {/* Row 1 — left to right */}
                <motion.div
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                  className="flex gap-3 w-max"
                >
                  {[...allCreators, ...allCreators].map((c, i) => (
                    <div key={i} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-gray-100 shadow-sm">
                      <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </motion.div>

                {/* Row 2 — right to left */}
                <motion.div
                  animate={{ x: ['-50%', '0%'] }}
                  transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
                  className="flex gap-3 w-max"
                >
                  {[...allCreators.slice().reverse(), ...allCreators.slice().reverse()].map((c, i) => (
                    <div key={i} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-gray-100 shadow-sm">
                      <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Secure Local Payments */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm"
            >
              <h3 className="font-sans font-bold text-xl text-black mb-2">Secure Local Payments</h3>
              <div className="flex items-center gap-4 my-6">
                <div className="flex items-center justify-center h-16 px-5 rounded-2xl border border-red-400 scale-105 transition-all duration-300 bg-white shadow-[0_0_20px_rgba(239,68,68,0.45)]">

                  <img src="/assets/jazzcash.png" alt="JazzCash" className="h-10 object-contain" />
                </div>
                <br />
                <div className="flex items-center justify-center h-16 px-5 rounded-2xl border border-green-400 bg-white shadow-lg shadow-green-500/40 transition-all duration-300">
                  <img src="/assets/easypaisa (2).png" alt="EasyPaisa" className="h-10 object-contain" />
                </div>
              </div>
              <p className="font-sans text-sm text-gray-500 leading-relaxed">Pay with JazzCash, EasyPaisa, or your bank card. Your money is held securely until the session is completed. Full refunds if a creator cancels. Safe, secure, and hassle-free payments every time.</p>
            </motion.div>

            {/* Flexible Scheduling */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm"
            >
              <h3 className="font-sans font-bold text-xl text-black mb-2">Flexible Scheduling</h3>
              <div className="flex flex-col gap-3 mt-6">
                {['Book sessions that fit your life', 'Most creators offer evening and weekend slots', 'Reschedule up to 24 hours before call with no penalty'].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    className={`px-5 py-3 rounded-full text-sm font-sans text-gray-700 border ${i === 0 ? 'border-gray-200' : i === 1 ? 'border-blue-200 bg-blue-50/50' : 'border-amber-200 bg-amber-50/50'}`}
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Money Back Guarantee */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm"
            >
              <h3 className="font-sans font-bold text-xl text-black mb-2">Money Back Guarantee</h3>
              <p className="font-sans text-sm text-gray-500 mb-8">Not satisfied with your session? Report it within 24 hours and we will issue a full refund, no questions asked. Your trust is our priority.</p>
              <div className="flex justify-center">
                <Image
                  src="/assets/gau.png" // replace with your image name
                  alt="How it works"
                  width={800}
                  height={200}
                  className="w-full max-w-3xl h-auto"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
            TESTIMONIALS MARQUEE
        ════════════════════════════════════════ */}
      <section className="py-24 bg-[#F7F7FA] border-t border-gray-100 overflow-hidden">
        <FadeUp className="text-center mb-14 px-4">
          <h2 className="text-black font-anton font-bold text-5xl sm:text-6xl md:text-7xl leading-tight uppercase tracking-tight">
            What Our Community <span className="text-[#0012FF]">Says</span>
          </h2>
        </FadeUp>

        <div className="space-y-6 max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Row 1 — left → right */}
          <div className="overflow-hidden pt-10 relative">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#F7F7FA] to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#F7F7FA] to-transparent" />
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="flex gap-5 w-max"
            >
              {marqueeTestimonials1.map((t, i) => (
                <div key={i} className="w-[270px] sm:w-[330px] shrink-0 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 relative">
                  {/* Big quote mark top-right */}
                  <div className="absolute -mt-8 sm:-mt-10 right-4 sm:right-5">
                    <img
                      src={commaSvgs[t.commaIndex]}
                      alt="quote"
                      className="w-12 h-12 sm:w-16 sm:h-16 -translate-y-2"
                    />
                  </div>
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 shadow-sm bg-gray-100">
                      <img src={t.avatar || '/Avatars/8.jpg'} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-sans font-bold text-sm text-black leading-tight">{t.name}</p>
                      <p className="font-sans text-xs text-gray-400 mt-0.5">{t.loc}</p>
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="border-t border-gray-100 mb-4" />
                  <p className="font-sans text-sm text-gray-600 leading-relaxed line-clamp-5">{t.text}</p>
                  {/* Colored dots */}
                  <div className="flex gap-1.5 mt-5">
                    <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: t.dot1 || '#A0B4E8' }} />
                    <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: t.dot2 || '#B8E0C8' }} />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Row 2 — right → left */}
          <div className=" overflow-hidden pt-10  relative">
            <div className="  pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#F7F7FA] to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#F7F7FA] to-transparent" />
            <motion.div
              animate={{ x: ['-50%', '0%'] }}
              transition={{ duration: 46, repeat: Infinity, ease: 'linear' }}
              className="flex gap-5 w-max"
            >
              {marqueeTestimonials2.map((t, i) => (
                <div key={i} className="w-[270px] sm:w-[330px] shrink-0 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 relative">
                  {/* Big quote mark top-right */}
                  <div className="absolute -mt-10 sm:-mt-12 right-4 sm:right-5">
                    <img src={commaSvgs[t.commaIndex]} alt="quote" className="w-12 h-12 sm:w-16 sm:h-16" />
                  </div>
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 shadow-sm bg-gray-100">
                      <img src={t.avatar || '/Avatars/2.jpg'} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-sans font-bold text-sm text-black leading-tight">{t.name}</p>
                      <p className="font-sans text-xs text-gray-400 mt-0.5">{t.loc}</p>
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="border-t border-gray-100 mb-4" />
                  <p className="font-sans text-sm text-gray-600 leading-relaxed line-clamp-5">{t.text}</p>
                  {/* Colored dots */}
                  <div className="flex gap-1.5 mt-5">
                    <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: t.dot1 || '#F4B8B8' }} />
                    <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: t.dot2 || '#A0C8E8' }} />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
            ARE YOU A CREATOR? CTA BANNER
        ════════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-8 bg-[#F7F7FA] border-t border-gray-100">
        <FadeUp>
          <div className="max-w-6xl mx-auto relative rounded-[28px] bg-[#1a0aff] overflow-visible min-h-[220px] sm:min-h-[260px] flex items-center justify-center" style={{ boxShadow: '0 0 0 1px rgba(26,10,255,0.3)' }}>

            {/* Top-left: bilal (green bg) - large, left side mid-height */}
            <motion.div
              className="absolute left-[-12px] sm:left-2 top-[50%] -translate-y-[90%] w-[110px] h-[140px] sm:w-[140px] sm:h-[175px] rounded-[18px] overflow-hidden shadow-2xl -rotate-6 hidden sm:block bg-[#B5D5B5]"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.04, rotate: '-2deg' }}
            >
              <img src="/Avatars/5.jpg" alt="Creator" className="w-full h-full object-cover object-top" />
            </motion.div>

            {/* Bottom-left: dure (salmon bg) - smaller, bottom-left overlapping */}
            <motion.div
              className="absolute left-[80px] sm:left-[130px] bottom-[-50px] w-[90px] h-[115px] sm:w-[115px] sm:h-[145px] rounded-[18px] overflow-hidden shadow-2xl rotate-3 hidden sm:block bg-[#F0B8A0]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.04, rotate: '0deg' }}
            >
              <img src="/Avatars/6.jpg" alt="Creator" className="w-full h-full object-cover object-top" />
            </motion.div>

            {/* Top-right: feroz (peach bg) - smaller, top-right overlapping */}
            <motion.div
              className="absolute right-[80px] sm:right-[130px] top-[-20px] w-[90px] h-[115px] sm:w-[115px] sm:h-[145px] rounded-[18px] overflow-hidden shadow-2xl rotate-6 hidden sm:block bg-[#F4C5A0]"
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ scale: 1.04, rotate: '2deg' }}
            >
              <img src="/Avatars/3.jpg" alt="Creator" className="w-full h-full object-cover object-top" />
            </motion.div>

            {/* Bottom-right: mahira (blue bg) - large, right side mid-height */}
            <motion.div
              className="absolute right-[-12px] sm:right-6 top-[50%] -translate-y-[07%] w-[110px] h-[140px] sm:w-[140px] sm:h-[175px] rounded-[18px] overflow-hidden shadow-2xl -rotate-3 hidden sm:block bg-[#C3C8F0]"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.04, rotate: '0deg' }}
            >
              <img src="/Avatars/2.jpg" alt="Creator" className="w-full h-full object-cover object-top" />
            </motion.div>

            {/* Center text */}
            <div className="relative z-10 text-center px-8 py-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-sans font-black text-3xl sm:text-5xl text-white tracking-tight mb-2"
              >
                Are You a Creator?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-sans text-white/70 text-sm mb-7"
              >
                Start earning with Reachly today
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <Link
                  href="/signup?type=creator"
                  className="inline-block bg-white text-[#1a0aff] font-sans font-semibold px-8 py-3 rounded-full text-sm hover:bg-white/92 active:scale-95 transition-all shadow-lg border border-white/30"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════════════════════════════════════
            FAQ
        ════════════════════════════════════════ */}
      <section className="py-24 bg-[#F7F7FA] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left heading */}
            <FadeUp className="lg:sticky lg:top-24">
              <h2 className=" text-black font-anton font-bold text-5xl sm:text-6xl md:text-7xl leading-tight uppercase tracking-tight">
                Frequently<br />Asked<br /><span className="text-[#0012FF]">Questions</span>
              </h2>
              <div className=" text-purple-200 mt-4 text-[220px] sm:text-[260px] font-black text-gray-100 leading-none select-none -mt-4">?!</div>
            </FadeUp>

            {/* Right accordion */}
            <FadeUp delay={0.1} className="flex flex-col gap-3">
              {faqItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 cursor-pointer"
                  >
                    <span className="font-sans font-semibold text-sm sm:text-base text-black">{item.q}</span>
                    <motion.svg
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-5 h-5 text-gray-400 shrink-0"
                      fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 font-sans text-sm text-gray-500 leading-relaxed">{item.a}</p>
                  </motion.div>
                </motion.div>
              ))}
            </FadeUp>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── Login Required Modal (Favourites) ── */}
      <AnimatePresence>
        {showLoginModal && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[150] p-4 cursor-pointer"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer z-10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Illustration */}
              <div className="w-40 sm:w-52 h-auto my-2">
                <img
                  src="/assets/favourites.png"
                  alt="Save to Favourites"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
                Save to Favourites
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
                Create a free account or log in to save your favourite creators and get personalised recommendations.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}