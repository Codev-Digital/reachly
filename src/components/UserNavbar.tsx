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
    { name: 'Events', href: '/explore-creators', icon: 'events' },
    { name: 'Bookings', href: '/user/bookings', icon: 'bookings' },
    { name: 'Referrals', href: '/user/referrals', icon: 'referrals' },
    { name: 'Wallet', href: '/user/payments', icon: 'wallet' },
    { name: 'Settings', href: '/user/settings', icon: 'settings' },
  ];

  return (
    <div className="px-4 sm:px-6 pt-4">
      <nav className={`bg-white shadow-sm border border-gray-100 sticky top-0 z-50 max-w-7xl mx-auto px-8 py-3 flex flex-col transition-all duration-300 ${mobileOpen ? 'rounded-3xl' : 'rounded-full'}`}>
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

                  {/* Events Icon */}
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
                  )}

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
                className="notification-bell-btn relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-650 hover:bg-gray-50 transition-all flex-shrink-0 cursor-pointer"
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
                <div className="notification-panel-container fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[76px] sm:top-[52px] w-auto sm:w-[620px] h-[540px] sm:h-[632px] bg-transparent overflow-visible z-[100] isolate select-none">
                  {/* SVG Background notched card */}
                  <img
                    src="/assets/notification-panel.svg"
                    alt=""
                    className="hidden sm:block absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
                  />
                  {/* Mobile Card Background */}
                  <div className="sm:hidden absolute inset-0 bg-white rounded-[24px] border border-gray-100 shadow-2xl z-0" />

                  {/* Content */}
                  <div className="relative z-10 pl-6 pr-6 pt-6 pb-6 sm:pl-[38px] sm:pr-[38px] sm:pt-[36px] sm:pb-[36px] flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between relative mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl sm:text-2xl font-bold text-black font-sans tracking-tight">Notifications</h3>
                          {notifications.filter(n => !n.read).length > 0 && (
                            <span className="bg-[#EBFDF2] text-[#00B050] text-xs font-bold px-2.5 py-0.5 rounded-full">
                              {notifications.filter(n => !n.read).length} New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-1">Never miss an update from your account</p>
                      </div>

                      {/* Clear All Button */}
                      <button
                        onClick={handleClearAll}
                        className="border border-gray-200 bg-white hover:bg-gray-55 transition-colors text-gray-500 rounded-full px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Clear All
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-4" />

                    {/* Notifications Scrollable List */}
                    <div className="flex-grow overflow-y-auto pr-1 select-text scrollbar-thin scrollbar-thumb-gray-200 max-h-[480px]">
                      {notifications.length > 0 ? (
                        <div className="flex flex-col">
                          {/* New/Unread Notifications */}
                          {notifications.filter(n => !n.read).map((n, i, arr) => (
                            <div key={n._id} onClick={() => handleMarkRead(n._id)} className="cursor-pointer">
                              <div className="flex items-center justify-between gap-4 py-1.5 hover:bg-gray-50/50 rounded-xl transition-all">
                                <div className="flex items-center gap-3.5">
                                  <div className="w-11 h-11 flex items-center justify-center rounded-xl shrink-0 bg-[#EEF2FF] text-[#0012FF]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-sm text-gray-900 leading-tight">{n.title}</span>
                                    <span className="text-xs text-gray-400 mt-1 leading-normal pr-4">{n.message}</span>
                                  </div>
                                </div>
                              </div>
                              {i < arr.length - 1 && <div className="border-t border-gray-100/60 my-3.5" />}
                            </div>
                          ))}

                          {/* Divider for previous notifications */}
                          {notifications.filter(n => n.read).length > 0 && (
                            <div className="flex items-center gap-3 my-5">
                              <div className="flex-grow h-px bg-gray-100" />
                              <span className="text-[9px] font-bold text-gray-400 tracking-wider">READ NOTIFICATIONS</span>
                              <div className="flex-grow h-px bg-gray-100" />
                            </div>
                          )}

                          {/* Read Notifications */}
                          {notifications.filter(n => n.read).map((n, i, arr) => (
                            <div key={n._id}>
                              <div className="flex items-center justify-between gap-4 py-1.5 hover:bg-gray-50/50 rounded-xl transition-all">
                                <div className="flex items-center gap-3.5">
                                  <div className="w-11 h-11 flex items-center justify-center rounded-xl shrink-0 bg-gray-100 text-gray-400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-sm text-gray-650 leading-tight">{n.title}</span>
                                    <span className="text-xs text-gray-400 mt-1 leading-normal pr-4">{n.message}</span>
                                  </div>
                                </div>
                              </div>
                              {i < arr.length - 1 && <div className="border-t border-gray-100/60 my-3.5" />}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-3">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-sm text-gray-900 mb-1">All caught up!</h4>
                          <p className="text-xs text-gray-400 max-w-[200px]">You have no new notifications.</p>
                        </div>
                      )}
                    </div>
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
                <div className="absolute right-0 top-[48px] sm:top-[52px] w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 z-[100] text-left animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100/80 mb-1.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Signed In As</p>
                    <p className="text-sm font-bold text-black truncate mt-0.5">{displayName || 'User'}</p>
                  </div>
                  <Link
                    href="/user/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-55 font-semibold transition-colors"
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50/70 font-semibold transition-colors text-left cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex-shrink-0 cursor-pointer"
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="9" rx="1" />
                          <rect x="14" y="3" width="7" height="5" rx="1" />
                          <rect x="14" y="11" width="7" height="10" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                        </svg>
                      )}

                      {/* Events Icon */}
                      {item.icon === 'events' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      )}

                      {/* Bookings Icon */}
                      {item.icon === 'bookings' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )}

                      {/* Referrals Icon */}
                      {item.icon === 'referrals' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                      )}

                      {/* Wallet Icon */}
                      {item.icon === 'wallet' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      )}

                      {/* Settings Icon */}
                      {item.icon === 'settings' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      )}
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Modern Royal Blue / White Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[150] p-4">
          <div className="relative overflow-visible w-full max-w-lg flex flex-col items-center p-8 pt-12 pb-8 z-10">
            {/* SVG Background */}
            <img
              src="/assets/cancel-card.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
            />

            {/* Close Button */}
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute -mt-20 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-55 transition-all z-20 cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Responsive Image */}
            <div className="w-28 sm:w-36 md:w-44 lg:w-56 mt-3 mb-4">
              <img
                src="/assets/cancel-appointment.png"
                alt="Confirm Logout"
                width={240}
                height={170}
                className="w-full h-auto object-contain"
              />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 text-center">
              Confirm Logout
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 text-center">
              Are you sure you want to sign out of Reachly?
            </p>

            <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
              We will clear your session storage and cookies to protect your account.
            </p>
            <div className="flex justify-center gap-16 w-full">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-32 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  // Clear all cookies
                  document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                      .replace(/^ +/, "")
                      .replace(
                        /=.*/,
                        "=;expires=" + new Date().toUTCString() + ";path=/"
                      );
                  });

                  // Clear localStorage & sessionStorage
                  localStorage.clear();
                  sessionStorage.clear();

                  signOut({ callbackUrl: "/login" });
                }}
                className="w-32 py-2 bg-[#0012FF] text-white rounded-xl text-sm font-semibold hover:bg-[#0010d0] transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
