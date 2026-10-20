'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRelativeTime } from '@/lib/time';
import { logout } from '@/lib/logout';

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Admin notifications are computed from the database (no stored "read" flag), so which ones the
  // admin has already opened is remembered in this browser.
  const [readIds, setReadIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      setReadIds(JSON.parse(localStorage.getItem('admin_read_notifications') || '[]'));
    } catch {}
  }, []);
  const persistRead = (ids: string[]) => {
    setReadIds(ids);
    try {
      localStorage.setItem('admin_read_notifications', JSON.stringify(ids));
    } catch {}
  };
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;
  const markRead = (id: string) => {
    if (id && !readIds.includes(id)) persistRead([...readIds, id]);
  };
  const markAllRead = () => persistRead(Array.from(new Set([...readIds, ...notifications.map((n) => n.id)])));

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/admin/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error('Failed to fetch admin notifications:', err);
      }
    }
    fetchNotifications();
    const eventSource = new EventSource('/api/admin/notifications/stream');

    eventSource.onmessage = (event) => {
      try {
        const allNotifications = JSON.parse(event.data);
        setNotifications(allNotifications);
      } catch (err) {
        console.error('Error parsing SSE admin notifications:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Admin SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (profileDropdownOpen && !target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
      if (notificationsDropdownOpen && !target.closest('.notifications-dropdown-container')) {
        setNotificationsDropdownOpen(false);
      }
    };

    const handleOutsideScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (profileDropdownOpen && !target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
      if (notificationsDropdownOpen && !target.closest('.notifications-dropdown-container')) {
        setNotificationsDropdownOpen(false);
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
  }, [profileDropdownOpen, notificationsDropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setNotificationsDropdownOpen(false);
    setIsMobileMenuOpen(false);
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
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      iconActive: (
        <img
          src="/assets/dashboard.png"
          alt="Dashboard Active"
          className="w-[38px] h-[38px] object-contain flex-shrink-0"
        />
      ),
      iconInactive: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      )
    },
    {
      name: 'Users',
      href: '/admin/users',
      iconActive: (
        <img
          src="/assets/users.svg"
          alt="Users Active"
          className="w-[38px] h-[38px] object-contain flex-shrink-0"
        />
      ),
      iconInactive: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      )
    },
    {
      name: 'Creators',
      href: '/admin/creators',
      iconActive: (
        <img
          src="/assets/creator.svg"
          alt="Creators Active"
          className="w-[38px] h-[38px] object-contain flex-shrink-0"
        />
      ),
      iconInactive: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
        </svg>
      )
    },
    // {
    //   name: 'Events',
    //   href: '/admin/bookings',
    //   iconActive: (
    //     <div className="w-8 h-8 rounded-full bg-[#0012FF]/10 flex items-center justify-center text-[#0012FF]">
    //       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //         <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    //         <line x1="16" y1="2" x2="16" y2="6" />
    //         <line x1="8" y1="2" x2="8" y2="6" />
    //         <line x1="3" y1="10" x2="21" y2="10" />
    //       </svg>
    //     </div>
    //   ),
    //   iconInactive: (
    //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
    //       <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    //       <line x1="16" y1="2" x2="16" y2="6" />
    //       <line x1="8" y1="2" x2="8" y2="6" />
    //       <line x1="3" y1="10" x2="21" y2="10" />
    //     </svg>
    //   )
    // },
    {
      name: 'Reschedule',
      href: '/admin/reschedule-requests',
      iconActive: (
        <div className="w-8 h-8 rounded-full bg-[#0012FF]/10 flex items-center justify-center text-[#0012FF]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      ),
      iconInactive: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      name: 'Payments',
      href: '/admin/payments',
      iconActive: (
        <img
          src="/assets/wallet.svg"
          alt="Payments Active"
          className="w-[38px] h-[38px] object-contain flex-shrink-0"
        />
      ),
      iconInactive: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    }
  ];

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 pt-4">
      <nav className="bg-white shadow-sm border border-gray-100 sticky top-0 z-50 rounded-3xl px-6 sm:px-8 py-3 flex flex-col">
        <div className="flex w-full items-center justify-between">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/assets/logo1.png" alt="Reachly Logo" className="h-8 w-auto object-contain" />
          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isActive
                    ? ' text-[#0012FF] bg-[#0012FF]/5'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {isActive ? item.iconActive : item.iconInactive}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative notifications-dropdown-container">
              <button
                onClick={() => {
                  setNotificationsDropdownOpen(!notificationsDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-500 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2" className="text-[#0012FF]">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />
                )}
              </button>

              <AnimatePresence>
                {notificationsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[76px] sm:top-auto sm:mt-2 w-auto sm:w-[460px] bg-white rounded-[28px] shadow-2xl border border-gray-100/90 z-[100] overflow-hidden flex flex-col p-5 sm:p-7 text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-black font-sans tracking-tight">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="bg-[#E6F9EE] text-[#12B76A] text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-500 rounded-full px-3 py-1 text-xs font-bold cursor-pointer shrink-0"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 font-medium mb-4">Never miss an update from your account</p>
                    <div className="border-b border-gray-100 mb-4" />

                    <div className="max-h-[400px] sm:max-h-[440px] overflow-y-auto overscroll-contain pr-1 select-text no-scrollbar">
                      {notifications.length > 0 ? (
                        <div className="flex flex-col">
                          {notifications.map((notif, idx) => (
                            <Link
                              key={notif.id || idx}
                              href={notif.link || '#'}
                              onClick={() => {
                                markRead(notif.id);
                                setNotificationsDropdownOpen(false);
                              }}
                              className={`flex items-start justify-between gap-3 py-3 border-b border-gray-100/70 last:border-0 hover:bg-gray-50/70 rounded-xl px-1.5 transition-all cursor-pointer ${
                                readIds.includes(notif.id) ? 'opacity-70' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-[#EEF2FF] text-[#0012FF]">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                  </svg>
                                </div>
                                <div className="flex flex-col min-w-0 pr-1">
                                  <h4 className={`text-sm leading-snug ${readIds.includes(notif.id) ? 'font-semibold text-gray-700' : 'font-bold text-black'}`}>
                                    {!readIds.includes(notif.id) && <span className="inline-block w-2 h-2 rounded-full bg-[#0012FF] mr-1.5 align-middle" />}
                                    {notif.title}
                                  </h4>
                                  <p className="text-xs text-gray-400 font-normal mt-0.5 leading-relaxed">{notif.message}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-400 font-medium shrink-0 mt-0.5">
                                {new Date(notif.date).toLocaleDateString()}
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-sm font-medium text-gray-400">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Avatar with dropdown toggle */}
            <div className="relative profile-dropdown-container">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsDropdownOpen(false);
                }}
                className="w-10 h-10 rounded-full overflow-hidden border border-gray-205 cursor-pointer flex-shrink-0 flex items-center justify-center"
              >
                <img src="/profile.jpeg" alt="Admin Avatar" className="w-full h-full object-cover" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="hidden md:block absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="hidden md:flex w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50/55 transition-colors items-center gap-2 cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 focus:outline-none transition-all cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full overflow-hidden flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100 md:hidden"
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-sm font-semibold transition-all ${isActive
                      ? 'bg-gray-50 text-black'
                      : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {isActive ? item.iconActive : item.iconInactive}
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Logout Button (Mobile Only) */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="flex items-center gap-3 p-3 rounded-2xl text-sm font-semibold transition-all text-rose-600 hover:bg-rose-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
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
