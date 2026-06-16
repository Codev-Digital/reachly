'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const CreatorSidebar = ({ active: propActive }: { active?: string }) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('Dashboard');

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
    } else if (pathname?.includes('/creators/dashboard')) {
      setActiveItem('Dashboard');
    }
  }, [propActive, pathname]);

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/creators/dashboard' },
    { name: 'Bookings', icon: 'bookings', href: '/creators/bookings' },
    { name: 'Calendar', icon: 'calendar', href: '/creators/calendar' },
    { name: 'Availability', icon: 'availability', href: '/creators/availability' },
    { name: 'Session Types', icon: 'session', href: '/creators/session-types' },
    { name: 'Earnings', icon: 'earnings', href: '/creators/earnings' },
    { name: 'Profile', icon: 'profile', href: '/creators/profile' },
    { name: 'Reviews', icon: 'reviews', href: '/creators/reviews' },
    { name: 'Analytics', icon: 'analytics', href: '/creators/analytics' },
    { name: 'Booking Links', icon: 'links', href: '/creators/booking-links' },
    { name: 'Notifications', icon: 'notifications', href: '/creators/notifications' },
    { name: 'Settings', icon: 'settings', href: '/creators/settings' },
  ];

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'dashboard':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        );
      case 'bookings':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
      case 'calendar':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'availability':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case 'session':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        );
      case 'earnings':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case 'profile':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'reviews':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case 'analytics':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      case 'links':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        );
      case 'notifications':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
      case 'settings':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5">
        <h3 className="font-sans text-sm font-semibold text-[#C8A97E] mb-4">Main Menu</h3>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setActiveItem(item.name)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded text-left text-sm font-sans transition-all ${
                activeItem === item.name
                  ? 'text-[#C8A97E]'
                  : 'text-[#F9F6F2] opacity-70 hover:text-[#C8A97E] hover:opacity-100'
              }`}
            >
              {getIcon(item.icon)}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.1)] space-y-2">
          <button
            className="w-full flex items-center gap-3 px-2 py-2 rounded text-left text-sm font-sans text-[#F9F6F2] opacity-70 hover:text-[#C8A97E] hover:opacity-100 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <path d="M20 8v6" />
              <path d="M23 11h-6" />
            </svg>
            Switch to Follower Mode
          </button>
          <button
            className="w-full flex items-center gap-3 px-2 py-2 rounded text-left text-sm font-sans text-[#F9F6F2] opacity-70 hover:text-[#C8A97E] hover:opacity-100 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorSidebar;
