'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import LogoutConfirmationModal from './LogoutConfirmationModal';

const AdminSidebar = ({ 
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
    } else if (pathname?.includes('/admin/users')) {
      setActiveItem('Users');
    } else if (pathname?.includes('/admin/creators')) {
      setActiveItem('Creators');
    } else if (pathname?.includes('/admin/bookings')) {
      setActiveItem('Bookings');
    } else if (pathname?.includes('/admin/payments')) {
      setActiveItem('Payments');
    } else if (pathname?.includes('/admin/reviews')) {
      setActiveItem('Reviews');
    } else if (pathname?.includes('/admin/categories')) {
      setActiveItem('Categories');
    } else if (pathname?.includes('/admin/analytics')) {
      setActiveItem('Analytics');
    } else if (pathname?.includes('/admin/support')) {
      setActiveItem('Support');
    } else if (pathname?.includes('/admin/settings')) {
      setActiveItem('Settings');
    } else if (pathname?.includes('/admin/dashboard')) {
      setActiveItem('Dashboard');
    }
  }, [propActive, pathname]);

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/admin/dashboard' },
    { name: 'Users', icon: 'users', href: '/admin/users' },
    { name: 'Creators', icon: 'creators', href: '/admin/creators' },
    { name: 'Bookings', icon: 'bookings', href: '/admin/bookings' },
    { name: 'Payments', icon: 'payments', href: '/admin/payments' },
    { name: 'Reviews', icon: 'reviews', href: '/admin/reviews' },
    { name: 'Categories', icon: 'categories', href: '/admin/categories' },
    { name: 'Analytics', icon: 'analytics', href: '/admin/analytics' },
    { name: 'Support', icon: 'support', href: '/admin/support' },
    { name: 'Settings', icon: 'settings', href: '/admin/settings' },
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
      case 'users':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'creators':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <path d="M20 8v6" />
            <path d="M23 11h-6" />
          </svg>
        );
      case 'bookings':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
      case 'payments':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
      case 'categories':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        );
      case 'support':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
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

  const NavigationLinks = () => (
    <>
      <h3 className="font-sans text-sm font-semibold text-[#C8A97E] mb-4">Main Menu</h3>
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => {
              setActiveItem(item.name);
              onClose?.();
            }}
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
          onClick={() => setIsLogoutModalOpen(true)}
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
    </>
  );

  return (
    <>
      {/* Desktop Sidebar removed to be hamburger-only on all screens */}

      {/* Mobile/Tablet Sidebar Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'linear' }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.32, 0.94, 0.6, 1] }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 h-full bg-[#141414] border-r border-[rgba(200,169,126,0.2)] p-6 shadow-2xl overflow-y-auto"
            >
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={onClose}
                  className="text-[#F9F6F2] opacity-70 hover:opacity-100"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
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

export default AdminSidebar;
