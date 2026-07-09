'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/creators/dashboard', icon: 'dashboard' },
  { name: 'Events', href: '/creators/events', icon: 'events' },
  { name: 'Calendar', href: '/creators/calendar', icon: 'calendar' },
  { name: 'Wallet', href: '/creators/wallet', icon: 'wallet' },
  { name: 'Settings', href: '/creators/settings', icon: 'settings' },
];

function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  if (icon === 'dashboard') {
    if (active) return <Image src="/assets/dashboard.png" alt="Dashboard" width={22} height={22} className="object-contain flex-shrink-0" />;
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
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  }
  if (icon === 'calendar') {
    if (active) return <Image src="/assets/calendar.svg" alt="Calendar" width={20} height={20} className="object-contain flex-shrink-0" />;
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
    if (active) return <Image src="/assets/wallet.svg" alt="Wallet" width={22} height={22} className="object-contain flex-shrink-0" />;
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  }
  if (icon === 'settings') {
    if (active) return <Image src="/assets/settings.svg.png" alt="Settings" width={22} height={22} className="object-contain flex-shrink-0" />;
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }
  return null;
}

export default function CreatorDashboardNav({
  profilePhoto,
  displayName,
}: {
  profilePhoto?: string | null;
  displayName?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Notifications State & Dropdown Open Toggle State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'reminder', title: 'Session Reminder', desc: 'Your live training with Sophia Reed starts in 2 hours.', time: '6h ago', isNew: true },
    { id: 2, type: 'review', title: 'Review Requested', desc: 'Your session with Julie ended yesterday. Please leave a review!', time: '6h ago', isNew: true },
    { id: 3, type: 'reminder', title: 'Session Reminder', desc: 'Your live training with Sophia Reed starts in 2 hours.', time: 'Yesterday', isNew: false },
    { id: 4, type: 'review', title: 'Review Requested', desc: 'Your session with Julie ended yesterday. Please leave a review!', time: 'Yesterday', isNew: false },
    { id: 5, type: 'reminder', title: 'Session Reminder', desc: 'Your live training with Sophia Reed starts in 2 hours.', time: 'Yesterday', isNew: false },
    { id: 6, type: 'review', title: 'Review Requested', desc: 'Your session with Julie ended yesterday. Please leave a review!', time: 'Yesterday', isNew: false }
  ]);

  const handleClearAll = () => {
    setNotifications([]);
  };

  // Close notifications on click outside
  useEffect(() => {
    if (!notificationsOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-panel-container') && !target.closest('.notification-bell-btn')) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [notificationsOpen]);

  const activeItem = NAV_ITEMS.find(item =>
    pathname === item.href || pathname.startsWith(item.href + '/')
  );

  return (
    <div className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4">
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
                className="object-contain w-auto h-8 sm:h-9"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
                  className="notification-bell-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {notifications.filter(n => n.isNew).length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#0012FF] rounded-full border border-white"></span>
                  )}
                </button>

                {/* Notification Panel Overlay */}
                {notificationsOpen && (
                  <div className="notification-panel-container absolute right-0 top-[48px] sm:top-[52px] w-[90vw] max-w-[620px] sm:w-[620px] h-[632px] bg-transparent overflow-visible z-[100] isolate select-none">
                    {/* SVG Background notched card */}
                    <img
                      src="/assets/notification-panel.svg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
                    />

                    {/* Content */}
                    <div className="relative z-10 pl-[38px] pr-[38px] pt-[36px] pb-[36px] flex flex-col h-full text-left">
                      {/* Header */}
                      <div className="flex items-start justify-between relative mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold text-black font-sans tracking-tight">Notifications</h3>
                            {notifications.filter(n => n.isNew).length > 0 && (
                              <span className="bg-[#EBFDF2] text-[#00B050] text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {notifications.filter(n => n.isNew).length} New
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs mt-1">Never miss an update from your account</p>
                        </div>

                        {/* Clear All Button */}
                        <button
                          onClick={handleClearAll}
                          className="absolute top-[-22px] right-[-22px] border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-500 rounded-full px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
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
                            {/* New Notifications */}
                            {notifications.filter(n => n.isNew).map((n, i, arr) => (
                              <div key={n.id}>
                                <div className="flex items-center justify-between gap-4 py-1.5 hover:bg-gray-50/50 rounded-xl transition-all">
                                  <div className="flex items-center gap-3.5">
                                    <div className={`w-11 h-11 flex items-center justify-center rounded-xl shrink-0 ${n.type === 'reminder' ? 'bg-[#EEF2FF] text-[#0012FF]' : 'bg-[#FFFBEB] text-[#F59E0B]'
                                      }`}>
                                      {n.type === 'reminder' ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                          <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                      ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-sm text-gray-900 leading-tight">{n.title}</span>
                                      <span className="text-xs text-gray-400 mt-1 leading-normal pr-4">{n.desc}</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 self-start pt-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF]">
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {n.time}
                                  </span>
                                </div>
                                {i < arr.length - 1 && <div className="border-t border-gray-100/60 my-3.5" />}
                              </div>
                            ))}

                            {/* Divider for previous notifications */}
                            {notifications.filter(n => !n.isNew).length > 0 && (
                              <div className="flex items-center gap-3 my-5">
                                <div className="flex-grow h-px bg-gray-100" />
                                <span className="text-[9px] font-bold text-gray-400 tracking-wider">PREVIOUS NOTIFICATIONS</span>
                                <div className="flex-grow h-px bg-gray-100" />
                              </div>
                            )}

                            {/* Previous Notifications */}
                            {notifications.filter(n => !n.isNew).map((n, i, arr) => (
                              <div key={n.id}>
                                <div className="flex items-center justify-between gap-4 py-1.5 hover:bg-gray-50/50 rounded-xl transition-all">
                                  <div className="flex items-center gap-3.5">
                                    <div className={`w-11 h-11 flex items-center justify-center rounded-xl shrink-0 ${n.type === 'reminder' ? 'bg-[#EEF2FF] text-[#0012FF]' : 'bg-[#FFFBEB] text-[#F59E0B]'
                                      }`}>
                                      {n.type === 'reminder' ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                          <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                      ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-sm text-gray-900 leading-tight">{n.title}</span>
                                      <span className="text-xs text-gray-400 mt-1 leading-normal pr-4">{n.desc}</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 self-start pt-1">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {n.time}
                                  </span>
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

              {/* Avatar */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center flex-shrink-0">
                {profilePhoto ? (
                  <Image src={profilePhoto} alt={displayName || 'User'} className="w-full h-full object-cover" width={40} height={40} />
                ) : displayName ? (
                  <span className="text-gray-700 font-bold text-sm">{displayName.charAt(0).toUpperCase()}</span>
                ) : (
                  <Image src="/Avatars/1.jpg" alt="User" className="w-full h-full object-cover" width={40} height={40} />
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
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-gray-100"
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
