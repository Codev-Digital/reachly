'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Card with a concave notch carved at the top-center (via radial mask) so the
// close button nests in it. Grows freely in height without distorting — replaces
// the stretched cancel-card.svg. drop-shadow traces the notched silhouette.
function ModalShell({
  onClose,
  children,
  maxWidth = 'max-w-lg',
}: {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  const notch = 'radial-gradient(circle 30px at 50% 0, transparent 29px, #000 30px)';
  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-[60] p-4 overflow-y-auto">
      <div className={`relative w-full ${maxWidth} my-8`}>
        <button
          onClick={onClose}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-black"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.12))' }}>
          <div
            className="bg-white"
            style={{ borderRadius: 32, WebkitMaskImage: notch, maskImage: notch }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

type DayKey = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

const DAYS: DayKey[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_OPTIONS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '8:00 PM',
];

// comma-1 = green, comma-2 = red, comma3 = yellow
const COMMA_SVGS = ['/assets/comma-1.svg', '/assets/comma-2.svg', '/assets/comma3.svg'];

const SESSIONS = [
  { id: 1, title: 'Style Consultation', duration: '1 hour', price: '1200 PKR', description: 'Personal styling session to revamp your wardrobe and discover your signature look.' },
  { id: 2, title: 'Marketing Consultation', duration: '1 hour', price: '1200 PKR', description: 'Personal styling session to revamp your wardrobe and discover your signature look.' },
  { id: 3, title: 'Style Consultation', duration: '1 hour', price: '1200 PKR', description: 'Personal styling session to revamp your wardrobe and discover your signature look.' },
  { id: 4, title: 'Designing Consultation', duration: '1 hour', price: '1200 PKR', description: 'Personal styling session to revamp your wardrobe and discover your signature look.' },
];

export default function CreatorSettings() {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [activeNavItem, setActiveNavItem] = useState('Settings');
  const [activeTab, setActiveTab] = useState('Profile');

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [selectedNiches, setSelectedNiches] = useState<string[]>(['Lifestyle']);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editSession, setEditSession] = useState<typeof SESSIONS[number] | null>(null);

  const [enabledDays, setEnabledDays] = useState<Record<DayKey, boolean>>({
    Monday: true,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          const name = data.creatorProfile?.displayName || data.user?.name || '';
          const photo = data.creatorProfile?.profilePhoto || null;
          setDisplayName(name);
          setProfilePhoto(photo);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    loadProfile();
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/creators/dashboard', icon: 'dashboard' },
    { name: 'Events', href: '/creators/events', icon: 'events' },
    { name: 'Calendar', href: '/creators/calendar', icon: 'calendar' },
    { name: 'Wallet', href: '/creators/wallet', icon: 'wallet' },
    { name: 'Settings', href: '/creators/settings', icon: 'settings' },
  ];

  const tabs = [
    {
      name: 'Profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      name: 'Sessions',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      name: 'Availability',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      name: 'Security',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      name: 'Reviews',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  const languages = ['Urdu', 'English', 'Punjabi', 'Sindhi', 'Pashto'];

  const niches = [
    { name: 'Lifestyle', icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /> },
    { name: 'Tech', icon: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></> },
    { name: 'Fitness', icon: <><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></> },
    { name: 'Fashion', icon: <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" /> },
    { name: 'Business', icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> },
    { name: 'Education', icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></> },
    { name: 'Beauty', icon: <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" /> },
    { name: 'Food', icon: <><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" /><path d="M5 2v20" /><path d="M17 2v20" /><path d="M21 2v7a4 4 0 0 1-4 4" /></> },
  ];

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleNiche = (niche: string) => {
    setSelectedNiches((prev) => {
      if (prev.includes(niche)) return prev.filter((n) => n !== niche);
      if (prev.length >= 3) return prev;
      return [...prev, niche];
    });
  };

  const toggleDay = (day: DayKey) => {
    setEnabledDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <div className="min-h-screen bg-[#F7F7FA]">
      {/* Top Navigation Bar */}
      <div className="px-4 sm:px-6 pt-4">
        <nav className="bg-white border border-gray-100 shadow-sm sticky top-0 z-50 rounded-3xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/assets/logo1.png"
                  alt="Reachly"
                  width={100}
                  height={40}
                  className="object-contain w-auto h-auto"
                />
              </Link>

              {/* Navigation Items */}
              <div className="flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setActiveNavItem(item.name)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-md font-semibold transition-all ${
                      activeNavItem === item.name
                        ? 'text-[#0012FF]'
                        : 'text-gray-600 hover:text-[#0012FF]'
                    }`}
                  >
                    {item.icon === 'events' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )}
                    {item.icon === 'dashboard' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="9" rx="1" />
                        <rect x="14" y="3" width="7" height="5" rx="1" />
                        <rect x="14" y="11" width="7" height="10" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                      </svg>
                    )}
                    {item.icon === 'calendar' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    )}
                    {item.icon === 'wallet' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    )}{item.icon === 'settings' && (
  activeNavItem === 'Settings' ? (
    <Image
      src="/assets/settings.svg.png"
      alt="Settings"
      width={46}
      height={46}
      className="flex-shrink-0"
    />
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
)}
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#0012FF] hover:bg-gray-50 transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>

                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center">
                  {profilePhoto ? (
                    <Image src={profilePhoto} alt={displayName} className="w-full h-full object-cover" width={40} height={40} />
                  ) : displayName ? (
                    <span className="text-gray-700 font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <Image src="/Avatars/1.jpg" alt="User" className="w-full h-full object-cover" width={40} height={40} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-500 font-sans mb-1">Hello {displayName ? displayName.split(' ')[0] : 'Sophia Reed'}!</p>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-black font-sans">
              Account <span className="text-[#0012FF]">Settings</span>
            </h1>
            <span className="text-gray-500 font-sans text-lg">/ Overview</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-start gap-6 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex flex-col items-center gap-2 ${activeTab === tab.name ? 'text-[#0012FF]' : 'text-gray-500'}`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  activeTab === tab.name ? 'bg-[#0012FF]/10 text-[#0012FF]' : 'bg-white border border-gray-200 text-gray-500'
                }`}
              >
                {tab.icon}
              </div>
              <span className={`text-sm ${activeTab === tab.name ? 'font-bold' : 'font-medium'}`}>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* ============ PROFILE TAB ============ */}
        {activeTab === 'Profile' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-8 shadow-sm">
            {/* Banner */}
            <div className="relative rounded-3xl overflow-hidden mb-4">
              <div className="relative h-56 sm:h-64">
                <Image
                  src="/assets/new-bg-image.png"
                  alt="Cover"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />

                {/* Edit pencil */}
                <button className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#0012FF] shadow-md hover:bg-gray-50 transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                {/* Banner text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <h2 className="text-white text-4xl sm:text-5xl font-bold mb-4 drop-shadow-lg">Nageen Shah</h2>
                  <div className="border border-white/70 rounded-full px-6 py-2 mb-4">
                    <span className="text-white text-lg font-medium">Software Engineering</span>
                  </div>
                  <div className="flex items-center gap-4 text-white text-sm sm:text-base">
                    <span>+ 123-456-7890</span>
                    <span className="text-white/50">|</span>
                    <span>hello@reallygreatsite.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile photo + change button */}
            <div className="flex items-end gap-6 -mt-24 px-2 mb-8 relative z-10">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white bg-gray-200 shadow-lg flex-shrink-0">
                <Image
                  src="/Avatars/3.jpg"
                  alt="Profile"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1 pb-2">
                <button className="bg-[#0012FF] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#0010d0] transition-all w-fit">
                  Change Profile Photo
                </button>
                <p className="text-gray-500 text-sm">JPG or PNG, max 5MB</p>
              </div>
            </div>

            {/* Display Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-sm font-semibold text-black block mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue="Sophia Reed"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-black block mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue="sophiareed@gmail.con"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                />
              </div>
            </div>

            {/* Short Bio */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-black block mb-2">Short Bio</label>
              <textarea
                rows={3}
                defaultValue="Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content."
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] resize-none"
              />
              <div className="flex justify-between text-gray-400 text-xs mt-1.5">
                <span>Appears on your cards in search results</span>
                <span>0/140</span>
              </div>
            </div>

            {/* Long Bio */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-black block mb-2">Long Bio</label>
              <textarea
                rows={5}
                defaultValue="Hi, I'm Sophia. Passionate about helping people create healthier habits, build confidence, and find balance in their everyday lives. Through personalized coaching sessions, practical guidance, and mindset-focused strategies, I help individuals make meaningful lifestyle changes that last. My goal is to empower you to become the best version of yourself—one step at a time."
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] resize-none"
              />
              <div className="flex justify-between text-gray-400 text-xs mt-1.5">
                <span>Appears on your cards in search results</span>
                <span>0/140</span>
              </div>
            </div>

            {/* City + Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="text-sm font-semibold text-black block mb-2">City</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer">
                    <option>Los Angeles</option>
                    <option>New York</option>
                    <option>Karachi</option>
                    <option>Lahore</option>
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-black block mb-2">Country</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer">
                    <option>United States</option>
                    <option>Pakistan</option>
                    <option>United Kingdom</option>
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-black block mb-3">Languages Spoken</label>
              <div className="flex flex-wrap gap-3">
                {languages.map((lang) => {
                  const active = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        active
                          ? 'bg-[#0012FF] text-white border-[#0012FF]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Niche / Categories */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-black block mb-3">Niche / Categories (max 3)</label>
              <div className="flex flex-wrap gap-3">
                {niches.map((niche) => {
                  const active = selectedNiches.includes(niche.name);
                  return (
                    <button
                      key={niche.name}
                      onClick={() => toggleNiche(niche.name)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        active
                          ? 'bg-[#0012FF] text-white border-[#0012FF]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {niche.icon}
                      </svg>
                      {niche.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div className="mb-8">
              <label className="text-sm font-semibold text-black block mb-3">
                Social Links <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Instagram */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0012FF]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="instagram.com/yourhandle"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
                {/* TikTok */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0012FF]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.53 1.5h3.34c.2 1.9 1.28 3.63 2.9 4.63.94.58 2.04.9 3.16.9v3.4c-1.53 0-3.02-.4-4.34-1.15v6.8c0 3.4-2.76 6.17-6.16 6.17S5.27 19.48 5.27 16.08c0-3.4 2.76-6.17 6.16-6.17.35 0 .7.03 1.04.09v3.5a2.72 2.72 0 0 0-1.04-.2 2.78 2.78 0 1 0 2.78 2.78V1.5z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="tiktok.com/yourhandle"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
                {/* YouTube */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0012FF]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                      <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="youtube.com/yourhandle"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
                {/* LinkedIn */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0012FF]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="linkedin.com/yourhandle"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </button>
              <div className="flex gap-3">
                <button className="border border-[#0012FF] text-[#0012FF] px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#0012FF]/5 transition-all">
                  Cancel
                </button>
                <button className="bg-[#0012FF] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#0010d0] transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ SESSIONS TAB ============ */}
        {activeTab === 'Sessions' && (
          <div className="space-y-5">
            {SESSIONS.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <h3 className="text-xl font-bold text-black">{session.title}</h3>
                    <span className="bg-[#FEF3E2] text-[#E8940C] px-3 py-1 rounded-full text-xs font-semibold">
                      {session.duration}
                    </span>
                    <span className="bg-[#E9E9FF] text-[#0012FF] px-3 py-1 rounded-full text-xs font-semibold">
                      {session.price}
                    </span>
                  </div>
                  <p className="text-gray-400 text-base">{session.description}</p>
                </div>
                <button
                  onClick={() => {
                    setEditSession(session);
                    setShowEditModal(true);
                  }}
                  className="text-gray-500 hover:text-[#0012FF] transition-all mt-1"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ============ AVAILABILITY TAB ============ */}
        {activeTab === 'Availability' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-black mb-1">Availability</h3>
              <p className="text-gray-500 text-sm">Update your schedule and booking availability.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Weekly Schedule */}
              <div className="border border-gray-200 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-black mb-6">Weekly Schedule</h4>

                <div className="space-y-4">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className={`rounded-2xl px-5 py-4 ${enabledDays[day] ? 'bg-[#F7F7FA]' : 'bg-[#F4F4F6]'}`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Toggle */}
                        <button
                          onClick={() => toggleDay(day)}
                          className={`w-11 h-6 rounded-full relative transition-all flex-shrink-0 ${
                            enabledDays[day] ? 'bg-[#0012FF]' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                              enabledDays[day] ? 'right-0.5' : 'left-0.5'
                            }`}
                          />
                        </button>

                        <span className={`text-base font-medium w-24 ${enabledDays[day] ? 'text-black' : 'text-gray-400'}`}>
                          {day}
                        </span>

                        {enabledDays[day] && (
                          <div className="flex items-center gap-2 flex-1">
                            <div className="relative">
                              <select className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer">
                                {TIME_OPTIONS.map((t) => (
                                  <option key={t}>{t}</option>
                                ))}
                              </select>
                              <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-500">to</span>
                            <div className="relative">
                              <select defaultValue="5:00 PM" className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer">
                                {TIME_OPTIONS.map((t) => (
                                  <option key={t}>{t}</option>
                                ))}
                              </select>
                              <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {enabledDays[day] && (
                        <button className="flex items-center gap-2 text-[#0012FF] text-sm font-medium mt-3 ml-[60px]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add Another Time Block
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Settings */}
              <div className="border border-gray-200 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-black mb-6">Booking Settings</h4>

                {/* Duration */}
                <div className="mb-5">
                  <label className="text-sm font-semibold text-black block mb-2">Duration</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer">
                      <option>Custom</option>
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>45 minutes</option>
                      <option>1 hour</option>
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Time + Unit */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="text-sm font-semibold text-black block mb-2">Time</label>
                    <input
                      type="text"
                      defaultValue="1"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-black block mb-2">Unit</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer">
                        <option>Hour</option>
                        <option>Minutes</option>
                      </select>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Buffer */}
                <div className="mb-5">
                  <label className="text-sm font-semibold text-black block mb-2">Buffer Between Bookings</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer">
                      <option>15 mins</option>
                      <option>No buffer</option>
                      <option>5 mins</option>
                      <option>10 mins</option>
                      <option>30 mins</option>
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label className="text-sm font-semibold text-black block mb-2">Location</label>
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5">
                    <div className="flex items-center gap-2 text-gray-900 text-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      In-person
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Location name / address */}
                <div className="mb-6">
                  <label className="text-sm text-gray-600 block mb-2">Location name/address</label>
                  <textarea
                    rows={2}
                    placeholder="1234 Sunset Blvd, Los Angeles, CA 90026"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] resize-none"
                  />
                </div>

                {/* Followers Can Book Up To */}
                <div className="mb-5">
                  <label className="text-sm font-semibold text-black block mb-2">Followers Can Book Up To</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      defaultValue="30"
                      className="w-20 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 text-center focus:outline-none focus:border-[#0012FF]"
                    />
                    <span className="text-gray-500 text-sm">days ahead</span>
                  </div>
                </div>

                {/* Minimum Notice Required */}
                <div className="mb-5">
                  <label className="text-sm font-semibold text-black block mb-2">Minimum Notice Required</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      defaultValue="04"
                      className="w-20 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 text-center focus:outline-none focus:border-[#0012FF]"
                    />
                    <span className="text-gray-500 text-sm">hours</span>
                  </div>
                </div>

                {/* Meeting Limits */}
                <div>
                  <label className="text-sm font-semibold text-black block mb-2">Meeting Limits</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      defaultValue="04"
                      className="w-20 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 text-center focus:outline-none focus:border-[#0012FF]"
                    />
                    <span className="text-gray-500 text-sm">meetings per</span>
                    <input
                      type="text"
                      defaultValue="day"
                      className="w-20 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 text-center focus:outline-none focus:border-[#0012FF]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </button>
              <div className="flex gap-3">
                <button className="border border-[#0012FF] text-[#0012FF] px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#0012FF]/5 transition-all">
                  Cancel
                </button>
                <button className="bg-[#0012FF] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#0010d0] transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ SECURITY TAB ============ */}
        {activeTab === 'Security' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-lg font-bold text-black mb-1">Security</h3>
                <p className="text-gray-500 text-sm">Manage your password and security settings.</p>
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold text-black block mb-2">Old Password</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter old password"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-sm font-semibold text-black block mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-black block mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back
                </button>
                <div className="flex gap-3">
                  <button className="border border-[#0012FF] text-[#0012FF] px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#0012FF]/5 transition-all">
                    Cancel
                  </button>
                  <button className="bg-[#0012FF] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#0010d0] transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">Delete Account</h3>
                  <p className="text-gray-500 text-sm">Deleting your account will permanently remove all your data.</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 transition-all"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ REVIEWS TAB ============ */}
        {activeTab === 'Reviews' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="border-b border-gray-200 pb-5 mb-8">
              <h3 className="text-2xl font-bold text-black mb-1">Reviews</h3>
              <p className="text-gray-500 text-sm">See what clients are saying about your sessions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {[0, 2, 1, 1, 0, 2, 0, 2, 1].map((commaIdx, i) => (
                <div
                  key={i}
                  className="relative bg-white border border-gray-200 rounded-2xl rounded-br-[3rem] p-6 pt-7"
                >
                  {/* Comma quote SVG top-right */}
                  <img
                    src={COMMA_SVGS[commaIdx]}
                    alt="quote"
                    className="absolute -top-6 right-6 w-16 h-16"
                  />

                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-100">
                      <Image src="/Avatars/8.jpg" alt="Jordan L" width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-black leading-tight">Jordan L</p>
                      <p className="text-sm text-gray-400 mt-0.5">Los Angeles, CA</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 mb-4" />

                  <p className="text-sm text-gray-500 leading-relaxed">
                    &ldquo;Ayesha helped me find my style, stay consistent, and grow my engagement. I feel much more confident creating content. One of the best investments I&rsquo;ve made for my personal brand!&rdquo;
                  </p>

                  {/* Report icon bottom-right */}
                  <button className="absolute bottom-4 right-5 text-red-500 hover:text-red-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ============ EDIT SESSION MODAL ============ */}
      {showEditModal && (
        <ModalShell onClose={() => setShowEditModal(false)} maxWidth="max-w-2xl">
            {/* Content */}
            <div className="px-8 sm:px-12 pt-14 pb-10">
              <div className="flex justify-center mb-2">
                <Image src="/assets/reschedule.png" alt="Edit session" width={260} height={190} className="object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-black text-center mb-1">Edit Styling Session</h3>
              <p className="text-gray-500 text-center mb-8">Update your session details and preferences.</p>

              <div className="mb-5">
                <label className="text-sm font-semibold text-black block mb-2">Title</label>
                <input
                  type="text"
                  defaultValue={editSession?.title ?? ''}
                  placeholder="Style Consultation"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                />
              </div>

              <div className="mb-5">
                <label className="text-sm font-semibold text-black block mb-2">Description</label>
                <textarea
                  rows={3}
                  defaultValue={editSession?.description ?? ''}
                  placeholder="Personal styling session to revamp your wardrobe and discover your signature look."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm font-semibold text-black block mb-2">Duration</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer">
                      <option>1 hour</option>
                      <option>30 minutes</option>
                      <option>45 minutes</option>
                      <option>2 hours</option>
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-black block mb-2">Price</label>
                  <input
                    type="text"
                    defaultValue="1200"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-3">
                <div>
                  <label className="text-sm font-semibold text-black block mb-2">What&rsquo;s Included</label>
                  <input
                    type="text"
                    placeholder="Feature 1"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-black block mb-2">Max Bookings Per Day</label>
                  <input
                    type="text"
                    defaultValue="4"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
              </div>

              <button className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-6 hover:text-[#0012FF]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add feature
              </button>

              <button className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 bg-gray-50 text-gray-600 rounded-xl py-4 text-sm font-semibold mb-6 hover:bg-gray-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Session Type
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-100 text-gray-700 rounded-full py-4 text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-[#0012FF] text-white rounded-full py-4 text-sm font-semibold hover:bg-[#0010d0] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
        </ModalShell>
      )}

      {/* ============ DELETE ACCOUNT MODAL ============ */}
      {showDeleteModal && (
        <ModalShell onClose={() => setShowDeleteModal(false)}>
            {/* Content */}
            <div className="px-8 sm:px-12 pt-14 pb-12 flex flex-col items-center text-center">
              <Image src="/assets/cancel-appointment.png" alt="Delete account" width={280} height={200} className="object-contain mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">Are You Sure?</h3>
              <p className="text-gray-500 mb-1">Are you sure you want to delete your account?</p>
              <p className="text-gray-500 mb-8">This action cannot be undone.</p>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-red-600 text-white px-10 py-3.5 rounded-full text-base font-semibold hover:bg-red-700 transition-all"
              >
                Delete Account
              </button>
            </div>
        </ModalShell>
      )}
    </div>
  );
}
