'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';

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

const TIME_OPTIONS_12 = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '08:00 PM',
];

// Helper to convert 12h format to 24h format (HH:MM)
const to24h = (time12h: string) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
  return `${hours.padStart(2, '0')}:${minutes}`;
};

// Helper to convert 24h format (HH:MM) to 12h format
const to12h = (time24h: string) => {
  if (!time24h) return '09:00 AM';
  const [hours, minutes] = time24h.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayH).padStart(2, '0')}:${minutes} ${ampm}`;
};

const COMMA_SVGS = ['/assets/comma-1.svg', '/assets/comma-2.svg', '/assets/comma3.svg'];

const SESSIONS = [
  { id: 1, title: 'Style Consultation', duration: '1 hour', price: '1200 PKR', description: 'Personal styling session to revamp your wardrobe and discover your signature look.' },
  { id: 2, title: 'Marketing Consultation', duration: '1 hour', price: '1200 PKR', description: 'Personal styling session to revamp your wardrobe and discover your signature look.' },
  { id: 3, title: 'Style Consultation', duration: '1 hour', price: '1200 PKR', description: 'Personal styling session to revamp your wardrobe and discover your signature look.' },
  { id: 4, title: 'Designing Consultation', duration: '1 hour', price: '1200 PKR', description: 'Personal styling session to revamp your wardrobe and discover your signature look.' },
];

export default function CreatorSettings() {
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [shortBio, setShortBio] = useState<string>('');
  const [longBio, setLongBio] = useState<string>('');
  const [city, setCity] = useState<string>('Karachi');
  const [country, setCountry] = useState<string>('Pakistan');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  
  // Social links
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Availability States
  const [enabledDays, setEnabledDays] = useState<Record<string, boolean>>({
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  const [dayTimes, setDayTimes] = useState<Record<string, { start: string; end: string }>>({
    monday: { start: '09:00 AM', end: '05:00 PM' },
    tuesday: { start: '09:00 AM', end: '05:00 PM' },
    wednesday: { start: '09:00 AM', end: '05:00 PM' },
    thursday: { start: '09:00 AM', end: '05:00 PM' },
    friday: { start: '09:00 AM', end: '05:00 PM' },
    saturday: { start: '09:00 AM', end: '05:00 PM' },
    sunday: { start: '09:00 AM', end: '05:00 PM' },
  });

  const [duration, setDuration] = useState('30 minutes');
  const [locationAddress, setLocationAddress] = useState('');

  const [activeTab, setActiveTab] = useState('Profile');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editSession, setEditSession] = useState<typeof SESSIONS[number] | null>(null);

  // Load Profile & Availability on mount
  useEffect(() => {
    async function loadAllData() {
      try {
        // Fetch Profile
        const profileRes = await fetch('/api/user/settings');
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.success) {
            setEmail(data.user?.email || '');
            if (data.profile) {
              setDisplayName(data.profile.displayName || '');
              setProfilePhoto(data.profile.profilePhoto || null);
              setShortBio(data.profile.shortBio || '');
              setLongBio(data.profile.longBio || '');
              setCity(data.profile.city || 'Karachi');
              setCountry(data.profile.country || 'Pakistan');
              setSelectedLanguages(data.profile.languages || []);
              setSelectedNiches(data.profile.niches || []);
              setCoverPhoto(data.profile.coverPhoto || null);
              
              const links = data.profile.socialLinks || {};
              setInstagram(links.instagram || '');
              setTiktok(links.tiktok || '');
              setYoutube(links.youtube || '');
              setLinkedin(links.linkedin || '');
            }
          }
        }

        // Fetch Availability Settings
        const availRes = await fetch('/api/creator-onboarding/step-5');
        if (availRes.ok) {
          const data = await availRes.json();
          if (data.availability) {
            const avail = data.availability;
            if (avail.schedule) {
              const newEnabled: Record<string, boolean> = {};
              const newTimes: Record<string, { start: string; end: string }> = {};

              Object.keys(avail.schedule).forEach((dayKey) => {
                const s = avail.schedule[dayKey];
                newEnabled[dayKey] = s.enabled || false;
                if (s.slots && s.slots.length > 0) {
                  newTimes[dayKey] = {
                    start: to12h(s.slots[0].start),
                    end: to12h(s.slots[0].end),
                  };
                } else {
                  newTimes[dayKey] = { start: '09:00 AM', end: '05:00 PM' };
                }
              });

              setEnabledDays(newEnabled);
              setDayTimes(newTimes);
            }
            if (avail.duration) setDuration(avail.duration);
            if (avail.location) setLocationAddress(avail.location.address || '');
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          shortBio,
          longBio,
          city,
          country,
          languages: selectedLanguages,
          niches: selectedNiches,
          socialLinks: { instagram, tiktok, youtube, linkedin },
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Profile saved successfully!');
      } else {
        alert(data.error || 'Failed to save profile');
      }
    } catch (err) {
      alert('Network error, please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvailability = async () => {
    // Check if at least one day is enabled
    const hasEnabledDay = Object.values(enabledDays).some(val => val);
    if (!hasEnabledDay) {
      alert('Please enable at least one day in your weekly schedule.');
      return;
    }

    setSaving(true);
    try {
      // Build schedule format for DB
      const schedule: Record<string, any> = {};
      Object.keys(enabledDays).forEach((dayKey) => {
        const times = dayTimes[dayKey] || { start: '09:00 AM', end: '05:00 PM' };
        schedule[dayKey] = {
          enabled: enabledDays[dayKey],
          slots: enabledDays[dayKey] ? [{
            start: to24h(times.start),
            end: to24h(times.end)
          }] : []
        };
      });

      const res = await fetch('/api/creator-onboarding/step-5', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule,
          duration,
          location: locationAddress,
          timezone: 'Asia/Karachi'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Availability saved successfully!');
      } else {
        alert(data.error || 'Failed to save availability');
      }
    } catch (err) {
      alert('Network error, please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-password',
          oldPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.error || 'Failed to update password');
      }
    } catch (err) {
      alert('Network error, please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/user/settings', {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Account deleted successfully');
        router.push('/');
      } else {
        alert(data.error || 'Failed to delete account');
      }
    } catch (err) {
      alert('Error deleting account');
    } finally {
      setShowDeleteModal(false);
    }
  };

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

  const toggleDayState = (dayName: string) => {
    setEnabledDays((prev) => ({ ...prev, [dayName]: !prev[dayName] }));
  };

  const handleTimeChange = (dayName: string, field: 'start' | 'end', val: string) => {
    setDayTimes((prev) => ({
      ...prev,
      [dayName]: {
        ...prev[dayName],
        [field]: val,
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center">
        <p className="text-gray-500 font-semibold animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FA]">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      {/* Main Content */}
      <main className="px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <p className="text-gray-500 font-sans mb-1 text-sm sm:text-base">Hello {displayName ? displayName.split(' ')[0] : 'Creator'}!</p>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-sans">
              Account <span className="text-[#0012FF]">Settings</span>
            </h1>
            <span className="text-gray-500 font-sans text-base sm:text-lg">/ Overview</span>
          </div>
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="flex items-start gap-3 sm:gap-6 mb-6 sm:mb-8 overflow-x-auto pb-1 -mx-1 px-1">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0 ${activeTab === tab.name ? 'text-[#0012FF]' : 'text-gray-500'}`}
            >
              <div
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${activeTab === tab.name ? 'bg-[#0012FF]/10 text-[#0012FF]' : 'bg-white border border-gray-200 text-gray-500'
                  }`}
              >
                {tab.icon}
              </div>
              <span className={`text-xs sm:text-sm whitespace-nowrap ${activeTab === tab.name ? 'font-bold' : 'font-medium'}`}>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* ============ PROFILE TAB ============ */}
        {activeTab === 'Profile' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-8 shadow-sm">
            {/* Banner */}
            <div className="relative rounded-3xl overflow-hidden mb-4">
              <div className="relative h-56 sm:h-64">
                {coverPhoto ? (
                  <img
                    src={coverPhoto}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src="/assets/new-bg-image.png"
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />

                {/* Banner text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <h2 className="text-white text-4xl sm:text-5xl font-bold mb-2 drop-shadow-lg">{displayName || 'Sophia Reed'}</h2>
                  <div className="border border-white/70 rounded-full px-6 py-1 mb-2">
                    <span className="text-white text-sm font-medium">{selectedNiches?.[0] || 'Influencer'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-white text-xs sm:text-sm">
                    <span>{email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile photo + change button */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-24 px-2 mb-8 relative z-10">
              <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white bg-gray-200 shadow-lg flex-shrink-0">
                <Image
                  src={profilePhoto || '/merium.png'}
                  alt="Profile"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1 pb-2">
                <button className="bg-[#0012FF] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0010d0] transition-all w-fit">
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
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-black block mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Short Bio */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-black block mb-2">Short Bio</label>
              <textarea
                rows={3}
                value={shortBio}
                onChange={(e) => setShortBio(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] resize-none"
              />
              <div className="flex justify-between text-gray-400 text-xs mt-1.5">
                <span>Appears on your cards in search results</span>
                <span>{shortBio.length}/140</span>
              </div>
            </div>

            {/* Long Bio */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-black block mb-2">Long Bio</label>
              <textarea
                rows={5}
                value={longBio}
                onChange={(e) => setLongBio(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] resize-none"
              />
            </div>

            {/* City + Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="text-sm font-semibold text-black block mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-black block mb-2">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                />
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
                      className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-all ${active
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
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${active
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
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
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
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
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
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
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
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/yourhandle"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-[#0012FF] text-white px-8 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0010d0] transition-all disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ============ SESSIONS TAB ============ */}
        {activeTab === 'Sessions' && (
          <div className="space-y-5">
            {SESSIONS.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-black">{session.title}</h3>
                    <span className="bg-[#FEF3E2] text-[#E8940C] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                      {session.duration}
                    </span>
                    <span className="bg-[#E9E9FF] text-[#0012FF] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                      {session.price}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base">{session.description}</p>
                </div>
                <button
                  onClick={() => {
                    setEditSession(session);
                    setShowEditModal(true);
                  }}
                  className="text-gray-500 hover:text-[#0012FF] transition-all mt-1 self-start sm:self-auto"
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
                  {DAYS.map((day) => {
                    const dayKey = day.toLowerCase();
                    const isEnabled = enabledDays[dayKey] || false;
                    const times = dayTimes[dayKey] || { start: '09:00 AM', end: '05:00 PM' };

                    return (
                      <div
                        key={day}
                        className={`rounded-2xl px-5 py-4 ${isEnabled ? 'bg-[#F7F7FA]' : 'bg-[#F4F4F6]'}`}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Toggle */}
                          <button
                            onClick={() => toggleDayState(dayKey)}
                            className={`w-11 h-6 rounded-full relative transition-all flex-shrink-0 ${isEnabled ? 'bg-[#0012FF]' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isEnabled ? 'right-0.5' : 'left-0.5'
                                }`}
                            />
                          </button>

                          <span className={`text-sm sm:text-base font-medium w-20 sm:w-24 ${isEnabled ? 'text-black' : 'text-gray-400'}`}>
                            {day}
                          </span>

                          {isEnabled && (
                            <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap">
                              <div className="relative">
                                <select
                                  value={times.start}
                                  onChange={(e) => handleTimeChange(dayKey, 'start', e.target.value)}
                                  className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-7 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer max-w-[110px] sm:max-w-none"
                                >
                                  {TIME_OPTIONS_12.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                                <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-500">to</span>
                              <div className="relative">
                                <select
                                  value={times.end}
                                  onChange={(e) => handleTimeChange(dayKey, 'end', e.target.value)}
                                  className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-7 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer max-w-[110px] sm:max-w-none"
                                >
                                  {TIME_OPTIONS_12.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                                <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Booking Settings */}
              <div className="border border-gray-200 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-black mb-6">Booking Settings</h4>

                {/* Duration */}
                <div className="mb-5">
                  <label className="text-sm font-semibold text-black block mb-2">Duration</label>
                  <div className="relative">
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer"
                    >
                      <option value="15 minutes">15 minutes</option>
                      <option value="30 minutes">30 minutes</option>
                      <option value="45 minutes">45 minutes</option>
                      <option value="1 hour">1 hour</option>
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label className="text-sm font-semibold text-black block mb-2">Location name/address</label>
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="1234 Sunset Blvd, Los Angeles, CA 90026"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={handleSaveAvailability}
                disabled={saving}
                className="bg-[#0012FF] text-white px-8 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0010d0] transition-all disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
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
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-sm font-semibold text-black block mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-black block mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleUpdatePassword}
                  disabled={saving}
                  className="bg-[#0012FF] text-white px-8 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0010d0] transition-all disabled:bg-gray-400"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">Delete Account</h3>
                  <p className="text-gray-500 text-sm">Deleting your account will permanently remove all your data.</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 transition-all w-fit"
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
              <h3 className="text-2xl font-bold text-black mb-1 font-anton uppercase tracking-wide">Reviews</h3>
              <p className="text-gray-500 text-sm">See what clients are saying about your sessions.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-8">
              {[0, 2, 1, 1, 0, 2, 0, 2, 1].map((commaIdx, i) => (
                <div
                  key={i}
                  className="relative w-full max-w-[424px] h-[255px] bg-transparent overflow-visible justify-self-center"
                >
                  <img
                    src="/assets/review.svg"
                    alt=""
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
                  />

                  <div className="relative z-10 p-6 pt-7 pr-12 pb-7 flex flex-col justify-between h-full">
                    <div>
                      <img
                        src={COMMA_SVGS[commaIdx]}
                        alt="quote"
                        className="absolute -top-7 right-5 w-16 h-16"
                      />

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-100">
                          <Image src="/Avatars/8.jpg" alt="Jordan L" width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-base text-gray-900 leading-tight">Jordan L</p>
                          <p className="text-xs text-gray-400 mt-0.5">Los Angeles, CA</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100/80 mb-4" />

                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        &ldquo;Ayesha helped me find my style, stay consistent, and grow my engagement. I feel much more confident creating content. One of the best investments I&rsquo;ve made for my personal brand!&rdquo;
                      </p>
                    </div>

                    <button className="absolute right-[4px] bottom-[4px] z-20 hover:scale-110 transition-transform duration-200">
                      <img src="/assets/danger.svg" alt="report" className="w-[18px] h-[32px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ============ DELETE ACCOUNT MODAL ============ */}
      {showDeleteModal && (
        <ModalShell onClose={() => setShowDeleteModal(false)}>
          <div className="px-8 sm:px-12 pt-14 pb-12 flex flex-col items-center text-center">
            <Image src="/assets/cancel-appointment.png" alt="Delete account" width={280} height={200} className="object-contain mb-4" />
            <h3 className="text-2xl font-bold text-black mb-2">Are You Sure?</h3>
            <p className="text-gray-500 mb-1">Are you sure you want to delete your account?</p>
            <p className="text-gray-500 mb-8">This action cannot be undone.</p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-full text-base font-semibold hover:bg-gray-250 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white py-3.5 rounded-full text-base font-semibold hover:bg-red-700 transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
