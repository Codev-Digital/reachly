'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRelativeTime } from '@/lib/time';
import { logout } from '@/lib/logout';
import { notificationHref } from '@/lib/notificationLinks';

interface UserNavbarProps {
  displayName?: string;
  profilePhoto?: string | null;
}

// Module-level cache to persist data across page navigation/remounts without flashes
let globalUserPhotoCache: string | null = null;
let globalUserNameCache: string = '';
let globalIsHydrated: boolean = false;
let globalNotificationsCache: any[] = [];

if (typeof window !== 'undefined') {
  globalUserPhotoCache = localStorage.getItem('user_profile_photo');
  globalUserNameCache = localStorage.getItem('user_display_name') || '';
  
  try {
    const cachedNotifs = localStorage.getItem('user_notifications_cache');
    if (cachedNotifs) {
      globalNotificationsCache = JSON.parse(cachedNotifs);
    }
  } catch (e) {}
}

export default function UserNavbar({ displayName, profilePhoto }: UserNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track if hydration has occurred globally to prevent flashes on tab changes
  // but ensure perfect SSR matching on full page refreshes.
  const [isHydrated, setIsHydrated] = useState(globalIsHydrated);

  // Local cache for profilePhoto and displayName to prevent flashes on navigation
  const [localPhoto, setLocalPhoto] = useState<string | null>(globalUserPhotoCache);
  const [localName, setLocalName] = useState<string>(globalUserNameCache);

  // useSafeLayoutEffect prevents visual flicker on hydration
  const useSafeLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  // Load cache on mount to avoid Next.js SSR hydration mismatch
  useSafeLayoutEffect(() => {
    globalIsHydrated = true;
    setIsHydrated(true);

    if (typeof window !== 'undefined') {
      const cachedPhoto = localStorage.getItem('user_profile_photo');
      if (cachedPhoto && cachedPhoto !== localPhoto) {
        setLocalPhoto(cachedPhoto);
        globalUserPhotoCache = cachedPhoto;
      }
      const cachedName = localStorage.getItem('user_display_name');
      if (cachedName && cachedName !== localName) {
        setLocalName(cachedName);
        globalUserNameCache = cachedName;
      }
    }
  }, [localPhoto, localName]);

  useEffect(() => {
    if (profilePhoto) {
      setLocalPhoto(profilePhoto);
      globalUserPhotoCache = profilePhoto;
      localStorage.setItem('user_profile_photo', profilePhoto);
    }
  }, [profilePhoto]);

  useEffect(() => {
    if (displayName) {
      setLocalName(displayName);
      globalUserNameCache = displayName;
      localStorage.setItem('user_display_name', displayName);
    }
  }, [displayName]);

  // Determine active nav item from pathname
  const getActiveNavItem = () => {
    if (pathname === '/user/events' || pathname.startsWith('/user/events/')) return 'Events';
    if (pathname === '/user/bookings') return 'Bookings';
    if (pathname === '/user/packages') return 'Packages';
    if (pathname === '/user/chats') return 'Chats';
    if (pathname === '/user/dashboard' || pathname === '/explore-creators') return 'Dashboard';
    if (pathname === '/user/payments') return 'Wallet';
    if (pathname === '/user/settings') return 'Settings';
    if (pathname === '/user/referrals') return 'Referrals';
    return 'Dashboard';
  };

  const [activeNavItem, setActiveNavItem] = useState(getActiveNavItem());

  // Update active nav item when pathname changes
  useEffect(() => {
    setActiveNavItem(getActiveNavItem());
  }, [pathname]);

  // Notifications State & Dropdown Open Toggle State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(globalNotificationsCache);

  // Sync notifications to global cache and local storage whenever they change
  useEffect(() => {
    globalNotificationsCache = notifications;
    if (typeof window !== 'undefined' && notifications.length > 0) {
      localStorage.setItem('user_notifications_cache', JSON.stringify(notifications));
    }
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/user/notifications');
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

  // 2) Initial fetch + Setup SSE Connection
  useEffect(() => {
    fetchNotifications();

    // Setup Server-Sent Events for real-time notifications
    const eventSource = new EventSource('/api/user/notifications/stream');

    eventSource.onmessage = (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        // Prepend the new real-time notification
        setNotifications((prev) =>
          prev.some((x) => x._id === newNotification._id) ? prev : [newNotification, ...prev]
        );
      } catch (err) {
        console.error('Error parsing SSE notification:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // EventSource automatically attempts to reconnect on error.
    };

    return () => {
      eventSource.close();
    };
  }, [fetchNotifications]);

  const handleClearAll = async () => {
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Click a notification: mark it read, close the panel and open the page it is about
  const openNotification = (n: any) => {
    if (!n.read) handleMarkRead(n._id);
    const href = notificationHref(n, 'user');
    setNotificationsOpen(false);
    if (href) router.push(href);
  };

  // Close notifications and profile dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (notificationsOpen && !target.closest('.notification-panel-container') && !target.closest('.notification-bell-btn')) {
        setNotificationsOpen(false);
      }
      if (profileDropdownOpen && !target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [notificationsOpen, profileDropdownOpen]);

  // Close dropdowns on page scroll (with threshold to prevent accidental closes on mobile)
  useEffect(() => {
    let initialScrollY = window.scrollY;

    const handleScroll = (e: Event) => {
      // If the scroll event came from an internal element, ignore it.
      if (e.target !== document && e.target !== document.documentElement && e.target !== window) {
        return;
      }

      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - initialScrollY) > 10) {
        if (notificationsOpen) setNotificationsOpen(false);
        if (profileDropdownOpen) setProfileDropdownOpen(false);
      }
    };

    if (notificationsOpen || profileDropdownOpen) {
      initialScrollY = window.scrollY;
      // capture: true ensures we can reliably filter out internal scroll events
      window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    }

    return () => window.removeEventListener('scroll', handleScroll, { capture: true } as any);
  }, [notificationsOpen, profileDropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
    setMobileOpen(false);
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

  const navItems = [
    { name: 'Dashboard', href: '/user/dashboard', icon: 'dashboard' },
    { name: 'Events', href: '/user/events', icon: 'events' },
    { name: 'Bookings', href: '/user/bookings', icon: 'bookings' },
    { name: 'Packages', href: '/user/packages', icon: 'bookings' },
    { name: 'Chats', href: '/user/chats', icon: 'chats' },
  ];

  const accountMenuItems = [
    { name: 'Referrals', href: '/user/referrals' },
    { name: 'Wallet', href: '/user/payments' },
    { name: 'Settings', href: '/user/settings' },
    { name: 'Recordings', href: '/user/recordings' },
  ];

  const isBookSession = pathname.includes('/book-session');

  return (
    <div className={`mx-auto pt-4 w-full ${isBookSession ? 'max-w-7xl px-4 sm:px-6' : 'max-w-[1536px] px-4 sm:px-6 lg:px-10'}`}>
      <nav className="bg-white border border-[#e2e2e2] sticky top-0 z-50 rounded-3xl px-6 sm:px-8 py-3 flex flex-col">
        <div className="flex w-full items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/assets/logo1.png"
              alt="Reachly"
              className="object-contain h-8 w-auto"
            />
          </Link>

          {/* Centered Navigation Items — icons keep original sizes; fixed slot stops header height jump */}
          <div className="hidden lg:flex h-[52px] items-center gap-2">
            {navItems.map((item) => {
              const isActive = activeNavItem === item.name || (item.name === 'Dashboard' && (pathname === '/user/dashboard' || pathname === '/explore-creators' || pathname.includes('/book-session'))) || (item.name === 'Bookings' && pathname === '/user/bookings') || (item.name === 'Chats' && pathname === '/user/chats');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => item.href !== '#' && setActiveNavItem(item.name)}
                  className={`flex h-[52px] items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors ${isActive
                    ? ' text-[#0012FF]'
                    : 'text-gray-500 hover:text-[#0012FF] hover:bg-gray-50'
                    }`}
                >
                  {/* Slot sized for largest active icon (39px) so inactive 18px SVGs don't shrink the bar */}
                  <span className="inline-flex h-[39px] w-[39px] shrink-0 items-center justify-center">
                    {/* Dashboard Icon */}
                    {item.icon === 'dashboard' && (
                      isActive ? (
                        <img
                          src="/assets/dashboard.png"
                          alt="Dashboard"
                          className="h-[39px] w-[39px] object-contain"
                        />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <rect x="3" y="3" width="7" height="9" rx="1" />
                          <rect x="14" y="3" width="7" height="5" rx="1" />
                          <rect x="14" y="11" width="7" height="10" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                        </svg>
                      )
                    )}

                    {/* Events Icon */}
                    {item.icon === 'events' && (
                      isActive ? (
                        <img
                          src="/assets/events.svg"
                          alt="Events"
                          className="h-[32px] w-[32px] object-contain"
                        />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                          <path d="M13 5v2" />
                          <path d="M13 17v2" />
                          <path d="M13 11v2" />
                        </svg>
                      )
                    )}

                    {/* Bookings Icon */}
                    {item.icon === 'bookings' && (
                      isActive ? (
                        <img
                          src="/assets/bookings.svg"
                          alt="Bookings"
                          className="h-[32px] w-[32px] object-contain"
                        />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )
                    )}

                    {/* Chats Icon */}
                    {item.icon === 'chats' && (
                      isActive ? (
                        <img
                          src="/assets/chat.svg"
                          alt="Chats"
                          className="h-[32px] w-[32px] object-contain"
                        />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      )
                    )}
                  </span>

                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="notification-bell-btn relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all flex-shrink-0 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                <span>{getRelativeTime(n.createdAt || n.date || n._id)}</span>
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
                                <span>{getRelativeTime(n.createdAt || n.date || n._id)}</span>
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

            {/* Profile Avatar */}
            <div className="relative profile-dropdown-container">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95 focus:outline-none"
              >
                {isHydrated && localPhoto ? (
                  <img src={localPhoto} alt={localName || displayName} className="w-full h-full object-cover" />
                ) : (
                  <img src="/avatar.png" alt="User Avatar" className="w-full h-full object-cover" />
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="hidden lg:block absolute right-0 top-[48px] sm:top-[52px] w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100] text-left animate-in fade-in slide-in-from-top-2 duration-150">
                  {accountMenuItems.map((item) => {
                    const isActive = activeNavItem === item.name;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setActiveNavItem(item.name);
                        }}
                        className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors ${
                          isActive
                            ? 'bg-[#0012FF]/8 text-[#0012FF]'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#0012FF]'
                        }`}
                      >
                        {item.name === 'Referrals' && (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                          </svg>
                        )}
                        {item.name === 'Wallet' && (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                          </svg>
                        )}
                        {item.name === 'Settings' && (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                        )}
                        {item.name === 'Recordings' && (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <polygon points="10 9 16 12 10 15 10 9" fill="currentColor" stroke="none" />
                          </svg>
                        )}
                        {item.name}
                      </Link>
                    );
                  })}
                  <div className="my-1.5 border-t border-gray-100" />
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50/70 font-semibold transition-colors text-left cursor-pointer"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 focus:outline-none transition-all flex-shrink-0 cursor-pointer"
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

        {/* Mobile Dropdown Menu */}
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
                className="lg:hidden overflow-hidden border-t border-gray-100 mt-3 relative z-[50]"
              >
                <div className="px-4 py-3 flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = activeNavItem === item.name || (item.name === 'Dashboard' && (pathname === '/user/dashboard' || pathname === '/explore-creators' || pathname.includes('/book-session'))) || (item.name === 'Bookings' && pathname === '/user/bookings') || (item.name === 'Chats' && pathname === '/user/chats');
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => {
                          setMobileOpen(false);
                          if (item.href !== '#') setActiveNavItem(item.name);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                          ? 'bg-[#0012FF]/10 text-[#0012FF]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#0012FF]'
                          }`}
                      >
                      {/* Dashboard Icon */}
                      {item.icon === 'dashboard' && (
                        isActive ? (
                          <img
                            src="/assets/dashboard.png"
                            alt="Dashboard"
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="9" rx="1" />
                            <rect x="14" y="3" width="7" height="5" rx="1" />
                            <rect x="14" y="11" width="7" height="10" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                          </svg>
                        )
                      )}

                      {/* Events Icon */}
                      {item.icon === 'events' && (
                        isActive ? (
                          <img
                            src="/assets/events.svg"
                            alt="Events"
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                            <path d="M13 5v2" />
                            <path d="M13 17v2" />
                            <path d="M13 11v2" />
                          </svg>
                        )
                      )}

                      {/* Bookings Icon */}
                      {item.icon === 'bookings' && (
                        isActive ? (
                          <img
                            src="/assets/bookings.svg"
                            alt="Bookings"
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        )
                      )}

                      {/* Chats Icon */}
                      {item.icon === 'chats' && (
                        isActive ? (
                          <img
                            src="/assets/chat.svg"
                            alt="Chats"
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        )
                      )}

                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <div className="my-2 border-t border-gray-100" />

                {accountMenuItems.map((item) => {
                  const isActive = activeNavItem === item.name;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        setMobileOpen(false);
                        setActiveNavItem(item.name);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#0012FF]/10 text-[#0012FF]'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#0012FF]'
                      }`}
                    >
                      {item.name === 'Referrals' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                      )}
                      {item.name === 'Wallet' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      )}
                      {item.name === 'Settings' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      )}
                      {item.name === 'Recordings' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <polygon points="10 9 16 12 10 15 10 9" fill="currentColor" stroke="none" />
                        </svg>
                      )}
                      <span>{item.name}</span>
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
              <img
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
