'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';

interface UserNavbarProps {
  displayName?: string;
  profilePhoto?: string | null;
}

export default function UserNavbar({ displayName, profilePhoto }: UserNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine active nav item from pathname
  const getActiveNavItem = () => {
    if (pathname === '/user/bookings') return 'Bookings';
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
  const [notifications, setNotifications] = useState<any[]>([]);

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

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
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

  // Close dropdown on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/user/dashboard', icon: 'dashboard' },
    // { name: 'Events', href: '/explore-creators', icon: 'events' },
    { name: 'Bookings', href: '/user/bookings', icon: 'bookings' },
    { name: 'Referrals', href: '/user/referrals', icon: 'referrals' },
    { name: 'Wallet', href: '/user/payments', icon: 'wallet' },
    { name: 'Settings', href: '/user/settings', icon: 'settings' },
  ];

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 pt-4">
      <nav className="bg-white shadow-sm border border-gray-100 sticky top-0 z-50 rounded-3xl px-6 sm:px-8 py-3 flex flex-col">
        <div className="flex w-full items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/assets/logo1.png"
              alt="Reachly"
              className="object-contain h-8 w-auto"
            />
          </Link>

          {/* Centered Navigation Items */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = activeNavItem === item.name || (item.name === 'Dashboard' && (pathname === '/user/dashboard' || pathname === '/explore-creators' || pathname.includes('/book-session'))) || (item.name === 'Bookings' && pathname === '/user/bookings');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => item.href !== '#' && setActiveNavItem(item.name)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive
                    ? ' text-[#0012FF]'
                    : 'text-gray-500 hover:text-[#0012FF] hover:bg-gray-50'
                    }`}
                >
                  {/* Dashboard Icon */}
                  {item.icon === 'dashboard' && (
                    isActive ? (
                      <img
                        src="/assets/dashboard.png"
                        alt="Dashboard"
                        className="w-[38px] h-[38px] object-contain"
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

                  {/* Events Icon
                  {item.icon === 'events' && (
                    isActive ? (
                      <img
                        src="/assets/calendar.svg"
                        alt="Events"
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )
                  )} */}

                  {/* Bookings Icon */}
                  {item.icon === 'bookings' && (
                    isActive ? (
                      <img
                        src="/assets/bookings.svg"
                        alt="Bookings"
                        className="w-[33px] h-[38px] object-contain"
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

                  {/* Referrals Icon */}
                  {item.icon === 'referrals' && (
                    isActive ? (
                      <img
                        src="/assets/referrals.svg"
                        alt="Referrals"
                        className="w-[36px] h-[36px] object-contain"
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                    )
                  )}

                  {/* Wallet Icon */}
                  {item.icon === 'wallet' && (
                    isActive ? (
                      <img
                        src="/assets/wallet.svg"
                        alt="Wallet"
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    )
                  )}

                  {/* Settings Icon */}
                  {item.icon === 'settings' && (
                    isActive ? (
                      <img
                        src="/assets/settings.svg.png"
                        alt="Settings"
                        className="w-[38px] h-[38px] object-contain"
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    )
                  )}

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
                {notifications.filter(n => !n.read).length > 0 && (
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
                      {notifications.filter(n => !n.read).length > 0 && (
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
                  <div className="max-h-[400px] sm:max-h-[440px] overflow-y-auto pr-1 select-text no-scrollbar">
                    {notifications.length > 0 ? (
                      <div className="flex flex-col">
                        {/* New / Unread Notifications */}
                        {notifications.filter(n => !n.read).map((n) => {
                          const isReview = n.type === 'review' || n.title?.toLowerCase().includes('review');
                          return (
                            <div
                              key={n._id}
                              onClick={() => handleMarkRead(n._id)}
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
                                <span>{n.time || n.formattedTime || '6h ago'}</span>
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
                              className="flex items-start justify-between gap-3 py-3 border-b border-gray-100/70 last:border-0 hover:bg-gray-50/70 rounded-xl px-1.5 transition-all opacity-85"
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
                                <span>{n.time || n.formattedTime || 'Yesterday'}</span>
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
                {profilePhoto ? (
                  <img src={profilePhoto} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <img src="/avatar.png" alt="User Avatar" className="w-full h-full object-cover" />
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="hidden md:block absolute right-0 top-[48px] sm:top-[52px] w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 z-[100] text-left animate-in fade-in slide-in-from-top-2 duration-150">


                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="hidden md:flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50/70 font-semibold transition-colors text-left cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 focus:outline-none transition-all flex-shrink-0 cursor-pointer"
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
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-gray-100 mt-3"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = activeNavItem === item.name || (item.name === 'Dashboard' && (pathname === '/user/dashboard' || pathname === '/explore-creators' || pathname.includes('/book-session'))) || (item.name === 'Bookings' && pathname === '/user/bookings');
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

                      {/* Referrals Icon */}
                      {item.icon === 'referrals' && (
                        isActive ? (
                          <img
                            src="/assets/referrals.svg"
                            alt="Referrals"
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                          </svg>
                        )
                      )}

                      {/* Wallet Icon */}
                      {item.icon === 'wallet' && (
                        isActive ? (
                          <img
                            src="/assets/wallet.svg"
                            alt="Wallet"
                            className="w-5 h-5 object-contain"
                          />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                          </svg>
                        )
                      )}

                      {/* Settings Icon */}
                      {item.icon === 'settings' && (
                        isActive ? (
                          <img
                            src="/assets/settings.svg.png"
                            alt="Settings"
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                        )
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
          )}
        </AnimatePresence>
      </nav>

      {/* Modern Royal Blue / White Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[150] p-4">
          <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
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
              Are you sure you want to log out of your account?
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
                  signOut({ callbackUrl: "/login" });
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
