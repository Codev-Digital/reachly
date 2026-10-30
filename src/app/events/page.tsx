'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import UserNavbar from '@/components/UserNavbar';
import AdminNavbar from '@/components/AdminNavbar';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import EventCard, { EventCardData } from '@/components/EventCard';
import { richTextPreview } from '@/lib/richText';
import { formatEventCardDate, formatEventCardTime, formatEventLocation } from '@/lib/eventDisplay';

export default function EventsPage() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [meRes, eventsRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch('/api/events'),
        ]);

        if (meRes.ok) {
          const userData = await meRes.json();
          setIsAuthenticated(true);
          const email = userData.user?.email?.toLowerCase() || '';
          if (email === 'abdullahgotaccess@gmail.com' || email === 'admin@reachly.com') {
            setIsAdmin(true);
          }
          if (userData.creatorProfile) {
            setIsCreator(true);
            setDisplayName(userData.creatorProfile.displayName || userData.user?.name || '');
            setProfilePhoto(userData.creatorProfile.profilePhoto || null);
          } else {
            setDisplayName(userData.user?.name || '');
            setProfilePhoto(userData.user?.profilePhoto || null);
          }
        }

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          const mapped: EventCardData[] = (data.events || []).map((e: any) => {
            const first = e.dates?.[0];
            return {
              id: e.id,
              title: e.title,
              description: richTextPreview(e.description, 140) || 'No description yet.',
              date: formatEventCardDate(first?.date),
              time: formatEventCardTime(first),
              location: formatEventLocation(e),
              image: e.bannerUrl || undefined,
              visible: true,
            };
          });
          setEvents(mapped);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8FA] text-[#1a1a1a]">
      {/* Navbar: Logged-in vs Public Guest */}
      {isAuthenticated ? (
        isAdmin ? (
          <AdminNavbar />
        ) : isCreator ? (
          <CreatorDashboardNav displayName={displayName} profilePhoto={profilePhoto} />
        ) : (
          <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />
        )
      ) : (
        <div className="px-4 sm:px-6 pt-4">
          <nav className="bg-white shadow-sm border border-gray-100 max-w-[1536px] mx-auto rounded-3xl px-6 sm:px-8 py-3.5 sm:py-4 relative flex flex-col">
            <div className="relative flex justify-between items-center w-full">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 z-10 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/logo1.png" alt="Reachly" className="h-10 w-auto object-contain" />
              </Link>

              {/* Desktop Nav - Central */}
              <div className="hidden lg:flex items-center gap-7 xl:gap-9 absolute left-1/2 -translate-x-1/2">
                <Link
                  href="/"
                  className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/explore-creators"
                  className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  Explore Creators
                </Link>
                <Link
                  href="/events"
                  className="font-sans text-sm font-bold text-[#0012FF] transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/for-creators"
                  className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  For Creators
                </Link>
                <Link
                  href="/about"
                  className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  About
                </Link>
              </div>

              {/* Right Auth Buttons */}
              <div className="hidden lg:flex items-center gap-4 z-10">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-gray-700 font-sans font-medium text-sm hover:text-black transition-all cursor-pointer"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/signup')}
                  className="bg-[#0012FF] hover:bg-[#0010d0] text-white font-sans font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-sm cursor-pointer"
                >
                  Sign up
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-700 hover:text-black p-2"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="lg:hidden overflow-hidden mt-4 pt-4 border-t border-gray-100"
                >
                  <div className="flex flex-col gap-4 pb-4">
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-sans text-base font-medium text-gray-700 hover:text-black"
                    >
                      Home
                    </Link>
                    <Link
                      href="/explore-creators"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-sans text-base font-medium text-gray-700 hover:text-black"
                    >
                      Explore Creators
                    </Link>
                    <Link
                      href="/events"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-sans text-base font-bold text-[#0012FF]"
                    >
                      Events
                    </Link>
                    <Link
                      href="/for-creators"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-sans text-base font-medium text-gray-700 hover:text-black"
                    >
                      For Creators
                    </Link>
                    <Link
                      href="/about"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-sans text-base font-medium text-gray-700 hover:text-black"
                    >
                      About
                    </Link>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/login');
                      }}
                      className="w-full py-2.5 rounded-full text-center text-sm font-semibold text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/signup');
                      }}
                      className="w-full py-2.5 rounded-full text-center text-sm font-semibold text-white bg-[#0012FF] hover:bg-[#0010d0] transition-all cursor-pointer shadow-sm"
                    >
                      Sign up
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-[1536px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-8">
          <p className="mb-1 text-sm font-medium text-gray-400 sm:text-base">
            {displayName ? `Hello ${displayName.split(' ')[0]}!` : 'Welcome to Reachly Events'}
          </p>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-black sm:text-3xl lg:text-4xl">
            Discover <span className="text-[#0012FF]">Events</span>{' '}
            <span className="text-base font-normal text-gray-400 sm:text-lg">from creators</span>
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[270px] w-full animate-pulse rounded-[8px] bg-gray-200" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-[8px] border border-dashed border-[#e2e2e2] bg-white px-6 py-16 text-center">
            <p className="text-base font-semibold text-gray-700">No events yet</p>
            <p className="mt-1 text-sm text-gray-400">Published creator events will show up here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={(eventId) => router.push(`/events/${eventId}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
