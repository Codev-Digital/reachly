'use client';

import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { getRelativeTime } from '@/lib/time';
import { logout } from '@/lib/logout';
import { notificationHref } from '@/lib/notificationLinks';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/creators/dashboard', icon: 'dashboard' },
  { name: 'Chats', href: '/creators/chats', icon: 'chats' },
  { name: 'Events', href: '/creators/events', icon: 'events' },
  { name: 'Calendar', href: '/creators/calendar', icon: 'calendar' },
  { name: 'Wallet', href: '/creators/wallet', icon: 'wallet' },
  { name: 'Settings', href: '/creators/settings', icon: 'settings' },
];

const ACTIVE_ICON_SRCS = [
  '/assets/dashboard.png',
  '/assets/chat.svg',
  '/assets/events.svg',
  '/assets/calendar.svg',
  '/assets/wallet.svg',
  '/assets/settings.svg.png',
];

function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  if (icon === 'dashboard') {
    if (active) return <Image src="/assets/dashboard.png" alt="Dashboard" width={38} height={38} className="object-contain flex-shrink-0" unoptimized priority />;
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="11" width="7" height="10" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }
  if (icon === 'events') {
    if (active) return <Image src="/assets/events.svg" alt="Events" width={33} height={33} className="object-contain flex-shrink-0" unoptimized priority />;
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
      </svg>
    );
  }
  if (icon === 'chats') {
    if (active) return <Image src="/assets/chat.svg" alt="Chats" width={33} height={33} className="object-contain flex-shrink-0" unoptimized priority />;
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    );
  }
  if (icon === 'calendar') {
    if (active) return <Image src="/assets/calendar.svg" alt="Calendar" width={33} height={33} className="object-contain flex-shrink-0" unoptimized priority />;
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }
  if (icon === 'wallet') {
    if (active) return <Image src="/assets/wallet.svg" alt="Wallet" width={33} height={33} className="object-contain flex-shrink-0" unoptimized priority />;
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  }
  if (icon === 'settings') {
    if (active) return <Image src="/assets/settings.svg.png" alt="Settings" width={43} height={43} className="object-contain flex-shrink-0" unoptimized priority />;
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }
  return null;
}

// Module-level cache to persist data across page navigation/remounts without flashes
let globalCreatorPhotoCache: string | null = null;
let globalCreatorNameCache: string = '';
let globalCreatorNotificationsCache: any[] = [];
let globalCreatorIsHydrated: boolean = false;

if (typeof window !== 'undefined') {
  globalCreatorPhotoCache = localStorage.getItem('creator_profile_photo');
  globalCreatorNameCache = localStorage.getItem('creator_display_name') || '';

  try {
    const cachedNotifs = localStorage.getItem('creator_notifications_cache');
    if (cachedNotifs) {
      globalCreatorNotificationsCache = JSON.parse(cachedNotifs);
    }
  } catch (e) {}
}

export default function CreatorDashboardNav({
  profilePhoto,
  displayName,
}: {
  profilePhoto?: string | null;
  displayName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Warm the cache for every "active" icon and prefetch every tab route once,
  // so switching tabs shows the icon and page instantly.
  useEffect(() => {
    ACTIVE_ICON_SRCS.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
    NAV_ITEMS.forEach((item) => router.prefetch(item.href));
  }, [router]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(globalCreatorIsHydrated);

  // Local cache for profilePhoto and displayName to prevent flashes on navigation
  const [localPhoto, setLocalPhoto] = useState<string | null>(globalCreatorPhotoCache);
  const [localName, setLocalName] = useState<string>(globalCreatorNameCache);

  const useSafeLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  // Load cache on mount to avoid Next.js SSR hydration mismatch
  useSafeLayoutEffect(() => {
    globalCreatorIsHydrated = true;
    setIsHydrated(true);

    if (typeof window !== 'undefined') {
      const cachedPhoto = localStorage.getItem('creator_profile_photo');
      if (cachedPhoto && cachedPhoto !== localPhoto) {
        setLocalPhoto(cachedPhoto);
        globalCreatorPhotoCache = cachedPhoto;
      }
      const cachedName = localStorage.getItem('creator_display_name');
      if (cachedName && cachedName !== localName) {
        setLocalName(cachedName);
        globalCreatorNameCache = cachedName;
      }
    }
  }, [localPhoto, localName]);

  useEffect(() => {
    if (profilePhoto) {
      setLocalPhoto(profilePhoto);
      globalCreatorPhotoCache = profilePhoto;
      localStorage.setItem('creator_profile_photo', profilePhoto);
    }
  }, [profilePhoto]);

  useEffect(() => {
    if (displayName) {
      setLocalName(displayName);
      globalCreatorNameCache = displayName;
      localStorage.setItem('creator_display_name', displayName);
    }
  }, [displayName]);

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Handle bfcache: if user hits back button after logout, force reload
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Notifications State & Dropdown Open Toggle State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(globalCreatorNotificationsCache);

  // Sync notifications to global cache and local storage whenever they change
  useEffect(() => {
    globalCreatorNotificationsCache = notifications;
    if (typeof window !== 'undefined' && notifications.length > 0) {
      localStorage.setItem('creator_notifications_cache', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Bulletproof time helper: tries createdAt first, then extracts timestamp from MongoDB ObjectId
  const getNotifTime = (n: any): string => {
    let date: Date | null = null;
    if (n.createdAt) {
      date = new Date(n.createdAt);
    } else if (n.date) {
      date = new Date(n.date);
    } else if (n._id && typeof n._id === 'string' && /^[a-fA-F0-9]{24}$/.test(n._id)) {
      const ts = parseInt(n._id.substring(0, 8), 16) * 1000;
      date = new Date(ts);
    }
    if (!date || isNaN(date.getTime())) return 'Recently';
    const diff = Math.abs(Math.floor((Date.now() - date.getTime()) / 1000));
    if (diff < 60) return `${Math.max(1, diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/creators/notifications');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const eventSource = new EventSource('/api/creators/notifications/stream');

    eventSource.onmessage = (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        setNotifications((prev) =>
          prev.some((x) => x._id === newNotification._id) ? prev : [newNotification, ...prev]
        );
      } catch (err) {
        console.error('Error parsing SSE notification:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [fetchNotifications]);

  const handleClearAll = async () => {
    try {
      const res = await fetch('/api/creators/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
      if (res.ok) {
        // Optimistic update first, then re-fetch fresh data with proper createdAt
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch('/api/creators/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      if (res.ok) {
        // Optimistic update first, then re-fetch fresh data with proper createdAt
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Click a notification: mark it read, close the panel and open the page it is about
  const openNotification = (n: any) => {
    if (!n.read) handleMarkRead(n._id);
    const href = notificationHref(n, 'creator');
    setNotificationsOpen(false);
    if (href) router.push(href);
  };

  // Close notifications and profile dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Notification close check
      if (notificationsOpen && !target.closest('.notification-panel-container') && !target.closest('.notification-bell-btn')) {
        setNotificationsOpen(false);
      }

      // Profile dropdown close check
      if (profileDropdownOpen && !target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
    };

    const handleOutsideScroll = (e: Event) => {
      const target = e.target as HTMLElement;

      if (notificationsOpen && !target.closest('.notification-panel-container') && !target.closest('.notification-bell-btn')) {
        setNotificationsOpen(false);
      }

      if (profileDropdownOpen && !target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('wheel', handleOutsideScroll, { passive: true });
    document.addEventListener('touchmove', handleOutsideScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('wheel', handleOutsideScroll);
      document.removeEventListener('touchmove', handleOutsideScroll);
    };
  }, [notificationsOpen, profileDropdownOpen]);

  const isBookSession = pathname.includes('/book-session');

  return (
    <div className={`mx-auto pt-3 sm:pt-4 w-full ${isBookSession ? 'max-w-7xl px-4 sm:px-6' : 'max-w-[1536px] px-4 sm:px-6 lg:px-10'}`}>
      <nav className="bg-white shadow-sm border border-gray-100 sticky top-0 z-50 rounded-2xl sm:rounded-3xl">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/assets/logo1.png"
                alt="Reachly"
                width={90}
                height={36}
                style={{ width: 'auto', height: 'auto' }}
                className="object-contain h-8 sm:h-9"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/') || (item.name === 'Dashboard' && pathname.includes('/book-session'));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${isActive ? 'text-[#0012FF]' : 'text-gray-600 hover:text-[#0012FF]'
                      }`}
                  >
                    <NavIcon icon={item.icon} active={isActive} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 sm:gap-3 relative">
              {/* Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="notification-bell-btn relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {isHydrated && notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 border border-white">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Notification Panel Overlay */}
                {notificationsOpen && (
                  <div className="notification-panel-container fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[76px] sm:top-[54px] w-auto sm:w-[460px] bg-white rounded-[28px] shadow-2xl border border-gray-100/90 z-[100] isolate select-none overflow-hidden p-5 sm:p-7 text-left">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-black font-sans tracking-tight">Notifications</h3>
                        {isHydrated && notifications.filter(n => !n.read).length > 0 && (
                          <span className="bg-[#E6F9EE] text-[#12B76A] text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {notifications.filter(n => !n.read).length} New
                          </span>
                        )}
                      </div>

                      {/* Clear All Button */}
                      <button
                        onClick={handleClearAll}
                        className="border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-500 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Clear All
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 font-medium mb-4">Never miss an update from your account</p>

                    {/* Header Divider */}
                    <div className="border-b border-gray-100 mb-4" />

                    {/* Notifications Scrollable List */}
                    <div className="max-h-[400px] sm:max-h-[440px] overflow-y-auto overscroll-contain pr-1 select-text no-scrollbar">
                      {notifications.length > 0 ? (
                        <div className="flex flex-col">
                          {/* New / Unread Notifications */}
                          {notifications.filter(n => !n.read).map((n) => {
                            const isReview = n.type === 'review' || n.title?.toLowerCase().includes('review');
                            return (
                              <div
                                key={n._id}
                                onClick={() => openNotification(n)}
                                className="flex items-start justify-between gap-3 py-3 border-b border-gray-100/70 last:border-0 hover:bg-gray-50/70 rounded-xl px-1.5 transition-all cursor-pointer"
                              >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  {/* Left Icon Container */}
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isReview ? 'bg-[#FFF9EA] text-[#D99A00]' : 'bg-[#EEF2FF] text-[#0012FF]'
                                    }`}>
                                    {isReview ? (
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        <polygon points="12 7 13.5 10 17 10.5 14.5 13 15 16.5 12 14.8 9 16.5 9.5 13 7 10.5 10.5 10" />
                                      </svg>
                                    ) : (
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                      </svg>
                                    )}
                                  </div>

                                  {/* Middle Content */}
                                  <div className="flex flex-col min-w-0 pr-1">
                                    <h4 className="font-bold text-sm text-black leading-snug">{n.title}</h4>
                                    <p className="text-xs text-gray-400 font-normal mt-0.5 leading-relaxed">{n.message}</p>
                                  </div>
                                </div>

                                {/* Right Time Meta */}
                                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium shrink-0 mt-0.5">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <span>{getNotifTime(n)}</span>
                                </div>
                              </div>
                            );
                          })}

                          {/* Divider for Previous Notifications */}
                          {notifications.filter(n => n.read).length > 0 && (
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-grow h-px bg-gray-100" />
                              <span className="text-[10px] font-bold text-gray-400 tracking-wider font-sans uppercase">PREVIOUS NOTIFICATIONS</span>
                              <div className="flex-grow h-px bg-gray-100" />
                            </div>
                          )}

                          {/* Read / Previous Notifications */}
                          {notifications.filter(n => n.read).map((n) => {
                            const isReview = n.type === 'review' || n.title?.toLowerCase().includes('review');
                            return (
                              <div
                                key={n._id}
                                onClick={() => openNotification(n)}
                                className="flex items-start justify-between gap-3 py-3 border-b border-gray-100/70 last:border-0 hover:bg-gray-50/70 rounded-xl px-1.5 transition-all opacity-85 cursor-pointer"
                              >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  {/* Left Icon Container */}
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isReview ? 'bg-[#FFF9EA] text-[#D99A00]' : 'bg-[#EEF2FF] text-[#0012FF]'
                                    }`}>
                                    {isReview ? (
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        <polygon points="12 7 13.5 10 17 10.5 14.5 13 15 16.5 12 14.8 9 16.5 9.5 13 7 10.5 10.5 10" />
                                      </svg>
                                    ) : (
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                      </svg>
                                    )}
                                  </div>

                                  {/* Middle Content */}
                                  <div className="flex flex-col min-w-0 pr-1">
                                    <h4 className="font-bold text-sm text-gray-800 leading-snug">{n.title}</h4>
                                    <p className="text-xs text-gray-400 font-normal mt-0.5 leading-relaxed">{n.message}</p>
                                  </div>
                                </div>

                                {/* Right Time Meta */}
                                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium shrink-0 mt-0.5">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <span>{getNotifTime(n)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-12">
                          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-sm text-gray-900 mb-0.5">All caught up!</h4>
                          <p className="text-xs text-gray-400 max-w-[200px]">You have no new notifications.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Profile Picture Container */}
              <div className="relative profile-dropdown-container">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center flex-shrink-0 cursor-pointer focus:outline-none hover:shadow-md transition-all active:scale-95"
                  suppressHydrationWarning
                >
                  {localPhoto ? (
                    <Image src={localPhoto} alt={localName || displayName || 'User'} className="w-full h-full object-cover" width={40} height={40} suppressHydrationWarning />
                  ) : localName || displayName ? (
                    <span className="text-gray-700 font-bold text-sm" suppressHydrationWarning>{(localName || displayName || '').charAt(0).toUpperCase()}</span>
                  ) : (
                    <Image src="/avatar.png" alt="User" className="w-full h-full object-cover" width={40} height={40} suppressHydrationWarning />
                  )}
                </button>

                {/* Profile Dropdown Menu in settings theme */}
                {profileDropdownOpen && (
                  <div className="hidden md:block absolute right-0 top-[48px] sm:top-[52px] w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 z-[100] text-left animate-in fade-in slide-in-from-top-2 duration-150">

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="hidden md:flex w-full items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50/70 font-semibold transition-colors text-left cursor-pointer rounded-xl mx-0"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex-shrink-0"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Click-outside backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-transparent z-[40] lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden overflow-hidden border-t border-gray-100 relative z-[50]"
              >
                <div className="px-4 py-3 flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                          ? 'bg-[#0012FF]/8 text-[#0012FF]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#0012FF]'
                          }`}
                      >
                        <NavIcon icon={item.icon} active={isActive} />
                        {item.name}
                      </Link>
                    );
                  })}

                  {/* Logout Button (Mobile Only) */}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-red-500 hover:bg-red-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Modern Royal Blue / White Logout Confirmation Modal */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[150] p-4 cursor-pointer"
          onClick={() => setShowLogoutModal(false)}
        >
          <div 
            className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Illustration */}
            <div className="w-40 sm:w-52 h-auto my-2">
              <Image
                src="/assets/logout.webp"
                alt="Logout"
                width={220}
                height={160}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
              Are You Sure?
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
              Are you sure you want to logout of your account?
            </p>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full font-bold text-xs sm:text-sm text-center transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                      .replace(/^ +/, "")
                      .replace(
                        /=.*/,
                        "=;expires=" + new Date().toUTCString() + ";path=/"
                      );
                  });
                  localStorage.clear();
                  sessionStorage.clear();
                  logout("/login");
                }}
                className="flex-1 py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-xs sm:text-sm text-center transition-all shadow-md active:scale-98 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// Trigger Fast Refresh
