'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import LogoutConfirmationModal from './LogoutConfirmationModal';

const CreatorSidebar = ({ 
  active: propActive,
  isOpen = false,
  onClose
}: { 
  active?: string,
  isOpen?: boolean,
  onClose?: () => void
}) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (propActive) {
      setActiveItem(propActive);
    } else if (pathname?.includes('/creators/analytics')) {
      setActiveItem('Analytics');
    } else if (pathname?.includes('/creators/reviews')) {
      setActiveItem('Reviews');
    } else if (pathname?.includes('/creators/profile')) {
      setActiveItem('Profile');
    } else if (pathname?.includes('/creators/earnings')) {
      setActiveItem('Earnings');
    } else if (pathname?.includes('/creators/session-types')) {
      setActiveItem('Session Types');
    } else if (pathname?.includes('/creators/availability')) {
      setActiveItem('Availability');
    } else if (pathname?.includes('/creators/calendar')) {
      setActiveItem('Calendar');
    } else if (pathname?.includes('/creators/bookings')) {
      setActiveItem('Bookings');
    } else if (pathname?.includes('/creators/booking-links')) {
      setActiveItem('Booking Links');
    } else if (pathname?.includes('/creators/notifications')) {
      setActiveItem('Notifications');
    } else if (pathname?.includes('/creators/settings')) {
      setActiveItem('Settings');
    } else if (pathname?.includes('/creators/dashboard')) {
      setActiveItem('Dashboard');
    }
  }, [propActive, pathname]);

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/creators/dashboard' },
    { name: 'Bookings', icon: 'bookings', href: '/creators/bookings' },
    { name: 'Calendar', icon: 'calendar', href: '/creators/calendar' },
    { name: 'Wallet', icon: 'wallet', href: '/creators/earnings' },
    { name: 'Settings', icon: 'settings', href: '/creators/settings' },
  ];

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'dashboard':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        );
      case 'bookings':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
      case 'calendar':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'wallet':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        );
      case 'settings':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const NavigationLinks = () => (
    <div className="flex flex-col h-full">
      <div className="mb-8 flex items-center gap-2">
        <Image
          src="/assets/logo1.png"
          alt="Reachly"
          width={40}
          height={40}
          className="object-contain w-auto h-auto"
        />
        <span className="text-xl font-bold text-black font-sans">Reachly</span>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => {
              setActiveItem(item.name);
              onClose?.();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-sans transition-all ${
              activeItem === item.name
                ? 'bg-[#0012FF] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {getIcon(item.icon)}
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white h-screen sticky top-0 p-6 border-r border-gray-100">
          <NavigationLinks />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'linear' }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.32, 0.94, 0.6, 1] }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 h-full bg-white border-r border-gray-100 p-6 shadow-2xl overflow-y-auto lg:hidden"
            >
              <NavigationLinks />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

export default CreatorSidebar;
