'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface UserNavbarProps {
  displayName?: string;
  profilePhoto?: string | null;
}

export default function UserNavbar({ displayName, profilePhoto }: UserNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
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
      <nav className="bg-white shadow-sm border border-gray-100 sticky top-0 z-50 rounded-full max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
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
            const isActive = activeNavItem === item.name || (item.name === 'Dashboard' && (pathname === '/user/dashboard' || pathname === '/explore-creators')) || (item.name === 'Bookings' && pathname === '/user/bookings');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => item.href !== '#' && setActiveNavItem(item.name)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  isActive
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
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center shadow-sm">
            {profilePhoto ? (
              <img src={profilePhoto} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <img src="/Avatars/1.jpg" alt="User Avatar" className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
