'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (profileDropdownOpen && !target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profileDropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
          className="w-[36px] h-[36px] object-contain flex-shrink-0"
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
          className="w-[36px] h-[36px] object-contain flex-shrink-0"
        />
      ),
      iconInactive: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
        </svg>
      )
    },
    {
      name: 'Events',
      href: '/admin/bookings',
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
          className="w-[36px] h-[36px] object-contain flex-shrink-0"
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
    <div className="px-4 sm:px-6 pt-4">
      <nav className="bg-white shadow-sm border border-gray-100 sticky top-0 z-50 max-w-7xl mx-auto px-8 py-3 flex flex-col rounded-3xl">
        <div className="flex w-full items-center justify-between">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/assets/logo1.png" alt="Reachly Logo" className="h-8 w-auto object-contain" />
          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
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
            <button className="relative w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2" className="text-[#0012FF]">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#0012FF]" />
            </button>

            {/* User Profile Avatar with dropdown toggle */}
            <div className="relative profile-dropdown-container">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border border-gray-205 cursor-pointer flex-shrink-0 flex items-center justify-center"
              >
                <img src="/ahad raza mir.png" alt="Admin Avatar" className="w-full h-full object-cover" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50/55 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
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
                const isActive = pathname === item.href;
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
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="relative overflow-visible w-full max-w-lg flex flex-col items-center p-8 pt-12 pb-8 z-10 bg-transparent">
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
                src="/assets/logout.png"
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
