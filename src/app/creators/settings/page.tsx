'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import LoadingAnimation from '@/components/LoadingAnimation';
import { signOut } from 'next-auth/react';
import { User, Briefcase, Clock, Shield, Star, Camera, Plus, Trash2, MapPin, ChevronRight, X, AlertTriangle } from 'lucide-react';

function ModalShell({
  onClose,
  children,
  maxWidth = 'max-w-lg',
}: {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[60] p-4">
      <div className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 flex flex-col`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer z-20"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
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

const to24h = (time12h: string) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
  return `${hours.padStart(2, '0')}:${minutes}`;
};

const to12h = (time24h: string) => {
  if (!time24h) return '09:00 AM';
  const [hours, minutes] = time24h.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayH).padStart(2, '0')}:${minutes} ${ampm}`;
};

const COMMA_SVGS = ['/assets/comma-1.svg', '/assets/comma-2.svg', '/assets/comma3.svg'];

interface DBTypeSession {
  _id?: string;
  id?: string;
  title: string;
  duration: number | string;
  price: number | string;
  description: string;
  features: string[];
  maxBookings?: number;
}

export default function CreatorSettings() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
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

  // Sessions State
  const [sessions, setSessions] = useState<DBTypeSession[]>([]);

  // Edit Session Modal Fields
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');
  const [sessionDuration, setSessionDuration] = useState('60');
  const [sessionPrice, setSessionPrice] = useState('1200');
  const [sessionFeatures, setSessionFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [sessionMaxBookings, setSessionMaxBookings] = useState('4');

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 80 * 1024 * 1024) {
        alert('File size exceeds 8MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load Profile, Sessions, & Availability on mount
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
              setDisplayName(data.profile.displayName || data.user?.name || '');
              setProfilePhoto(data.profile.profilePhoto || data.user?.profilePhoto || null);
              setCoverPhoto(data.profile.coverPhoto || null);
              setShortBio(data.profile.shortBio || '');
              setLongBio(data.profile.longBio || '');
              setCity(data.profile.city || 'Karachi');
              setCountry(data.profile.country || 'Pakistan');
              setSelectedLanguages(data.profile.languages || []);
              setSelectedNiches(data.profile.niches || []);

              const links = data.profile.socialLinks || {};
              setInstagram(links.instagram || '');
              setTiktok(links.tiktok || '');
              setYoutube(links.youtube || '');
              setLinkedin(links.linkedin || '');
            } else if (data.user) {
              // Fallback for edge cases where creator profile is missing
              setDisplayName(data.user.name || '');
              setProfilePhoto(data.user.profilePhoto || null);
            }
          }
        }

        // Fetch Sessions
        const sessionsRes = await fetch('/api/creator-onboarding/step-3');
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          if (data.sessionTypes) {
            setSessions(data.sessionTypes.map((s: any) => ({
              ...s,
              id: s._id || s.id
            })));
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
          profilePhoto,
          coverPhoto,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessModalMessage('Your profile changes have been saved successfully.');
        setShowSuccessModal(true);
      } else {
        alert(data.error || 'Failed to save profile');
      }
    } catch (err) {
      alert('Network error, please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditModal = (session: DBTypeSession) => {
    setEditSessionId(session.id || session._id || null);
    setSessionTitle(session.title);
    setSessionDesc(session.description);
    setSessionDuration(String(session.duration));
    setSessionPrice(String(session.price));
    setSessionFeatures(session.features || []);
    setSessionMaxBookings(String(session.maxBookings || 4));
    setShowEditModal(true);
  };

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setSessionFeatures((prev) => [...prev, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setSessionFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleOpenCreateModal = () => {
    setEditSessionId(null);
    setSessionTitle('');
    setSessionDesc('');
    setSessionDuration('60');
    setSessionPrice('1200');
    setSessionFeatures([]);
    setNewFeatureText('');
    setSessionMaxBookings('4');
    setShowEditModal(true);
  };

  const handleDeleteSession = async (sessionIdToDelete: string) => {
    if (!confirm('Are you sure you want to delete this session type?')) return;
    const updatedList = sessions.filter(s => (s.id || s._id) !== sessionIdToDelete);
    try {
      const res = await fetch('/api/creator-onboarding/step-3', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionTypes: updatedList })
      });
      if (res.ok) {
        setSessions(updatedList);
        setSuccessModalMessage('Session type deleted successfully.');
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleSaveSessionEdit = async () => {
    if (!sessionTitle.trim()) {
      alert('Session title is required');
      return;
    }
    if (!sessionDesc.trim()) {
      alert('Session description is required');
      return;
    }

    setSaving(true);
    try {
      let updatedList: DBTypeSession[] = [];
      const newSessionObj = {
        title: sessionTitle.trim(),
        description: sessionDesc.trim(),
        duration: Number(sessionDuration),
        price: Number(sessionPrice),
        features: sessionFeatures,
        maxBookings: Number(sessionMaxBookings)
      };

      if (editSessionId) {
        updatedList = sessions.map((s) => {
          if ((s.id || s._id) === editSessionId) {
            return {
              ...s,
              ...newSessionObj
            };
          }
          return s;
        });
      } else {
        updatedList = [...sessions, { ...newSessionObj, id: Date.now().toString() }];
      }

      const res = await fetch('/api/creator-onboarding/step-3', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionTypes: updatedList
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSessions(data.sessionTypes || updatedList);
        setShowEditModal(false);
        setSuccessModalMessage(editSessionId ? 'Your session details have been updated successfully.' : 'New session type created and saved successfully!');
        setShowSuccessModal(true);
      } else {
        alert(data.error || 'Failed to update session');
      }
    } catch (err) {
      alert('Error saving session settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvailability = async () => {
    const hasEnabledDay = Object.values(enabledDays).some(val => val);
    if (!hasEnabledDay) {
      alert('Please enable at least one day in your weekly schedule.');
      return;
    }

    setSaving(true);
    try {
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
        setSuccessModalMessage('Your availability settings have been saved successfully.');
        setShowSuccessModal(true);
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
        setSuccessModalMessage('Your password has been updated successfully.');
        setShowSuccessModal(true);
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

        alert('Account deleted successfully');
        signOut({ callbackUrl: '/signup' });
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
    { name: 'Profile', icon: <User className="h-5 w-5" /> },
    { name: 'Sessions', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'Availability', icon: <Clock className="h-5 w-5" /> },
    { name: 'Security', icon: <Shield className="h-5 w-5" /> },
    { name: 'Reviews', icon: <Star className="h-5 w-5" /> },
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

  if (loading) return <LoadingAnimation />;

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      {/* Main Content Area - Wide Container */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-500 font-sans mb-1 text-sm sm:text-base">Hello {displayName ? displayName.split(' ')[0] : 'Creator'}!</p>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-sans tracking-tight">
              Account <span className="text-[#0012FF]">Settings</span>
            </h1>
            <span className="text-gray-400 font-sans text-base sm:text-lg">/ Overview</span>
          </div>
        </div>

        {/* Refined Top Navigation Segment Bar - Centered with Icons and Headings */}
        <div className="bg-white rounded-3xl p-1.5 border border-gray-200 shadow-sm flex flex-wrap items-center justify-center gap-1.5 mb-8 max-w-2xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${activeTab === tab.name
                ? 'bg-[#0012FF] border-[#0012FF] text-white shadow-md shadow-blue-100 scale-102'
                : 'bg-white border-transparent text-gray-500 hover:text-black hover:bg-gray-50'
                }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Form Content Area */}
        <div className="w-full">

          {/* ============ PROFILE TAB ============ */}
          {activeTab === 'Profile' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">

              {/* Cover Picture Box - Clean banner with top-right edit button and NO overlay text */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 bg-gray-900 border border-gray-200 shadow-inner">
                <div className="relative h-48 sm:h-56 lg:h-64 w-full">
                  {coverPhoto ? (
                    <img
                      src={coverPhoto}
                      alt="Cover Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src="/assets/new-bg-image.png"
                      alt="Cover Photo"
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                </div>

                {/* Top-Right Circular Edit Button */}
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md border border-white/20 z-20 cursor-pointer"
                  title="Edit Cover Photo"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>

              {/* Hidden File Inputs for Profile Photo & Cover Photo */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={coverFileInputRef}
                onChange={handleCoverPhotoChange}
                accept="image/*"
                className="hidden"
              />

              {/* Profile photo + Change button */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-20 sm:-mt-24 px-4 mb-8 relative z-10">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white bg-gray-200 shadow-xl flex-shrink-0">
                  <img
                    src={profilePhoto || '/avatar.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1.5 pb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#0012FF] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#0010d0] transition-all shadow-md active:scale-95 w-fit flex items-center gap-2 cursor-pointer"
                  >
                    <span>Change Profile Photo</span>
                  </button>
                  <p className="text-gray-400 text-xs font-medium">JPG or PNG, max 5MB</p>
                </div>
              </div>

              {/* Display Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Short Bio */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">Short Bio</label>
                <textarea
                  rows={2}
                  value={shortBio}
                  onChange={(e) => setShortBio(e.target.value)}
                  placeholder="Short bio showing up in search details"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] resize-none"
                />
                <div className="flex justify-between text-gray-400 text-xs mt-1.5">
                  <span>Appears on your cards in search results</span>
                  <span>{shortBio.length}/140</span>
                </div>
              </div>

              {/* Long Bio */}
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">Long Bio</label>
                <textarea
                  rows={4}
                  value={longBio}
                  onChange={(e) => setLongBio(e.target.value)}
                  placeholder="Tell your clients a little bit about yourself..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] resize-none"
                />
              </div>

              {/* City + Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">Country</label>
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
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3 font-sans">Languages Spoken</label>
                <div className="flex flex-wrap gap-2.5">
                  {languages.map((lang) => {
                    const active = selectedLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${active
                          ? 'bg-[#0012FF] text-white border-[#0012FF] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-305'
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
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3 font-sans">Niche / Categories (max 3)</label>
                <div className="flex flex-wrap gap-2.5">
                  {niches.map((niche) => {
                    const active = selectedNiches.includes(niche.name);
                    return (
                      <button
                        key={niche.name}
                        onClick={() => toggleNiche(niche.name)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${active
                          ? 'bg-[#0012FF] text-white border-[#0012FF] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-305'
                          }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
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
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3 font-sans">
                  Social Links <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Instagram */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0012FF]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
              <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-[#0012FF] text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-[#0010d0] transition-all disabled:bg-gray-400 active:scale-98 shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* ============ SESSIONS TAB ============ */}
          {activeTab === 'Sessions' && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-black font-sans">Session Types & Offerings</h3>
                  <p className="text-xs text-gray-400 font-medium">Create and edit 1-on-1 sessions displayed on your public profile.</p>
                </div>
                <button
                  onClick={handleOpenCreateModal}
                  className="bg-[#0012FF] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#0010d0] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Session</span>
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">
                  <p className="text-gray-400 font-medium text-sm mb-4">No sessions created yet.</p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="bg-[#0012FF] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#0010d0] transition-all cursor-pointer"
                  >
                    + Create First Session
                  </button>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id || session._id}
                    className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-gray-300 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <h3 className="text-lg sm:text-xl font-bold text-black">{session.title}</h3>
                        <span className="bg-[#FEF3E2] text-[#E8940C] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap">
                          {session.duration} minutes
                        </span>
                        <span className="bg-blue-50 text-[#0012FF] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap">
                          {session.price} PKR
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">{session.description}</p>

                      {session.features && session.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {session.features.map((f, i) => (
                            <span key={i} className="bg-[#F8F8FA] border border-gray-150 text-gray-500 rounded-lg text-xs px-3 py-1 font-medium">
                              ✓ {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(session)}
                        className="text-gray-400 hover:text-[#0012FF] transition-all p-2 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
                        title="Edit Session"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleDeleteSession(session.id || session._id || '')}
                        className="text-gray-400 hover:text-red-600 transition-all p-2 rounded-xl hover:bg-red-50 cursor-pointer border border-transparent hover:border-red-100"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ============ AVAILABILITY TAB ============ */}
          {activeTab === 'Availability' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <div className="mb-6 border-b border-gray-100 pb-5">
                <h3 className="text-2xl font-bold text-black mb-1">Availability Schedule</h3>
                <p className="text-gray-500 text-sm">Update your weekly routine and booking durations.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Weekly Schedule */}
                <div className="border border-gray-200 rounded-3xl p-6 bg-white">
                  <h4 className="text-lg font-bold text-black mb-5">Weekly Hours</h4>

                  <div className="space-y-3.5">
                    {DAYS.map((day) => {
                      const dayKey = day.toLowerCase();
                      const isEnabled = enabledDays[dayKey] || false;
                      const times = dayTimes[dayKey] || { start: '09:00 AM', end: '05:00 PM' };

                      return (
                        <div
                          key={day}
                          className={`rounded-2xl px-4 py-3.5 border transition-colors ${isEnabled
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-[#F8F8FA]/60 border-transparent opacity-75'
                            }`}
                        >
                          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                            {/* Toggle */}
                            <button
                              onClick={() => toggleDayState(dayKey)}
                              className={`w-10 h-5.5 rounded-full relative transition-all flex-shrink-0 cursor-pointer ${isEnabled ? 'bg-[#0012FF]' : 'bg-gray-200'
                                }`}
                            >
                              <span
                                className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all ${isEnabled ? 'right-0.5' : 'left-0.5'
                                  }`}
                              />
                            </button>

                            <span className={`text-sm font-bold w-20 sm:w-24 ${isEnabled ? 'text-black' : 'text-gray-400'}`}>
                              {day}
                            </span>

                            {isEnabled && (
                              <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap justify-end sm:justify-start">
                                <div className="relative">
                                  <select
                                    value={times.start}
                                    onChange={(e) => handleTimeChange(dayKey, 'start', e.target.value)}
                                    className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-7 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#0012FF] cursor-pointer"
                                  >
                                    {TIME_OPTIONS_12.map((t) => (
                                      <option key={t} value={t}>{t}</option>
                                    ))}
                                  </select>
                                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="6 9 12 15 18 9" />
                                  </svg>
                                </div>
                                <span className="text-xs text-gray-400 font-semibold">to</span>
                                <div className="relative">
                                  <select
                                    value={times.end}
                                    onChange={(e) => handleTimeChange(dayKey, 'end', e.target.value)}
                                    className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-7 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#0012FF] cursor-pointer"
                                  >
                                    {TIME_OPTIONS_12.map((t) => (
                                      <option key={t} value={t}>{t}</option>
                                    ))}
                                  </select>
                                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                <div className="border border-gray-200 rounded-3xl p-6 bg-white flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-black mb-5">Booking Preferences</h4>

                    {/* Duration */}
                    <div className="mb-5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">Session Duration</label>
                      <div className="relative">
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] cursor-pointer font-semibold"
                        >
                          <option value="15 minutes">15 minutes</option>
                          <option value="30 minutes">30 minutes</option>
                          <option value="45 minutes">45 minutes</option>
                          <option value="1 hour">1 hour</option>
                        </select>
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mb-4">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">Meeting Location Address</label>
                      <input
                        type="text"
                        value={locationAddress}
                        onChange={(e) => setLocationAddress(e.target.value)}
                        placeholder="e.g. Google Meet Link, Coffee shop address..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-6">
                <button
                  onClick={handleSaveAvailability}
                  disabled={saving}
                  className="bg-[#0012FF] text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-[#0010d0] transition-all disabled:bg-gray-400 active:scale-98 shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </div>
          )}

          {/* ============ SECURITY TAB ============ */}
          {activeTab === 'Security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="border-b border-gray-100 pb-5 mb-6">
                  <h3 className="text-xl font-bold text-black mb-1">Update Password</h3>
                  <p className="text-gray-500 text-sm">Keep your account secure by changing your password periodically.</p>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                    />
                    {/* Password Strength Indicator Lines */}
                    <div className="grid grid-cols-4 gap-2 mt-2.5">
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${newPassword.length > 0 ? 'bg-[#0012FF]' : 'bg-gray-200'}`} />
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${newPassword.length >= 6 ? 'bg-[#0012FF]' : 'bg-gray-200'}`} />
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${newPassword.length >= 8 ? 'bg-[#0012FF]' : 'bg-gray-200'}`} />
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${newPassword.length >= 10 && /[A-Z]/.test(newPassword) ? 'bg-[#0012FF]' : 'bg-gray-200'}`} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF]"
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-6">
                  <button
                    onClick={handleUpdatePassword}
                    disabled={saving}
                    className="bg-[#0012FF] text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-[#0010d0] transition-all disabled:bg-gray-400 active:scale-98 shadow-md"
                  >
                    {saving ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-red-600 mb-1">Delete Account</h3>
                    <p className="text-gray-500 text-sm">Deleting your account is permanent and cannot be undone. All data will be removed.</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all w-fit active:scale-95 shrink-0"
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
              <div className="border-b border-gray-100 pb-5 mb-8">
                <h3 className="text-xl font-bold text-black mb-1">Client Reviews</h3>
                <p className="text-gray-500 text-sm">See what clients are saying about your sessions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Jordan L', location: 'Los Angeles, CA', commaIdx: 0, text: 'Ayesha helped me find my style, stay consistent, and grow my engagement. I feel much more confident creating content. One of the best investments I’ve made for my personal brand!' },
                  { name: 'Jordan L', location: 'Los Angeles, CA', commaIdx: 1, text: 'Ayesha helped me find my style, stay consistent, and grow my engagement. I feel much more confident creating content. One of the best investments I’ve made for my personal brand!' },
                  { name: 'Jordan L', location: 'Los Angeles, CA', commaIdx: 2, text: 'Ayesha helped me find my style, stay consistent, and grow my engagement. I feel much more confident creating content. One of the best investments I’ve made for my personal brand!' },
                  { name: 'Jordan L', location: 'Los Angeles, CA', commaIdx: 1, text: 'Ayesha helped me find my style, stay consistent, and grow my engagement. I feel much more confident creating content. One of the best investments I’ve made for my personal brand!' },
                  { name: 'Jordan L', location: 'Los Angeles, CA', commaIdx: 2, text: 'Ayesha helped me find my style, stay consistent, and grow my engagement. I feel much more confident creating content. One of the best investments I’ve made for my personal brand!' },
                  { name: 'Jordan L', location: 'Los Angeles, CA', commaIdx: 0, text: 'Ayesha helped me find my style, stay consistent, and grow my engagement. I feel much more confident creating content. One of the best investments I’ve made for my personal brand!' },
                ].map((rev, i) => (
                  <div
                    key={i}
                    className="relative bg-[#F8F8FA] border border-gray-200/70 rounded-[20px] p-6 flex flex-col justify-between min-h-[220px] transition-all hover:shadow-sm hover:scale-[1.01]"
                  >
                    {/* Quotation Mark Badge Asset */}
                    <img
                      src={COMMA_SVGS[rev.commaIdx]}
                      alt="quote"
                      className="absolute top-4 right-4 w-14 h-14 pointer-events-none object-contain"
                    />

                    <div>
                      {/* Reviewer Meta */}
                      <div className="flex items-center gap-3 mb-4 pr-10">
                        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-200">
                          <Image src="/Avatars/8.jpg" alt={rev.name} width={44} height={44} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm sm:text-base text-black leading-tight">{rev.name}</p>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">{rev.location}</p>
                        </div>
                      </div>

                      <div className="w-full h-px bg-gray-200/80 mb-4" />

                      {/* Review Text */}
                      <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed font-sans mb-4">
                        &ldquo;{rev.text}&rdquo;
                      </p>
                    </div>

                    {/* Report Action */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => alert('Review reported')}
                        className="text-xs text-[#FF3B3B] hover:underline font-bold cursor-pointer"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ============ EDIT SESSION MODAL ============ */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-[540px] p-6 sm:p-8 flex flex-col overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">

            {/* Close Button */}
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer z-20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Top Illustration */}
            <div className="w-40 sm:w-48 h-auto mx-auto mb-2">
              <Image
                src="/assets/reschedule.png"
                alt="Edit Session"
                width={220}
                height={160}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Header */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-black text-center mb-1 tracking-tight">
              Edit Styling Session
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 font-medium text-center mb-6">
              Update your session details and preferences.
            </p>

            {/* Form Fields */}
            <div className="space-y-4">

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-black mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="Style Consultation"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all placeholder:text-gray-300 font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-black mb-1.5 block">Description</label>
                <textarea
                  rows={3}
                  value={sessionDesc}
                  onChange={(e) => setSessionDesc(e.target.value)}
                  placeholder="Personal styling session to revamp your wardrobe and discover your signature look."
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all resize-none placeholder:text-gray-300 font-medium leading-relaxed"
                />
              </div>

              {/* Duration & Price (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-black mb-1.5 block">Duration</label>
                  <div className="relative">
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] appearance-none cursor-pointer font-medium"
                    >
                      <option value="15">15 mins</option>
                      <option value="30">30 mins</option>
                      <option value="45">45 mins</option>
                      <option value="60">1 hour</option>
                      <option value="90">90 mins</option>
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-black mb-1.5 block">Price</label>
                  <input
                    type="number"
                    value={sessionPrice}
                    onChange={(e) => setSessionPrice(e.target.value)}
                    placeholder="1200"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] font-medium"
                  />
                </div>
              </div>

              {/* What's Included & Max Bookings Per Day (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-black mb-1.5 block">What&rsquo;s Included</label>
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Feature 1"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] placeholder:text-gray-300 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 font-medium mt-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add feature</span>
                  </button>

                  {sessionFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto no-scrollbar">
                      {sessionFeatures.map((feat, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="text-gray-400 hover:text-red-500 font-bold ml-0.5 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-black mb-1.5 block">Max Bookings Per Day</label>
                  <input
                    type="number"
                    value={sessionMaxBookings}
                    onChange={(e) => setSessionMaxBookings(e.target.value)}
                    placeholder="4"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] font-medium"
                  />
                </div>
              </div>

            </div>

            {/* Add Session Type Dashed Button */}
            <button
              type="button"
              onClick={handleAddFeature}
              className="w-full py-3.5 border-2 border-dashed border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50 rounded-2xl text-xs sm:text-sm font-bold text-gray-500 flex items-center justify-center gap-2 transition-all my-5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gray-400" />
              <span>Add Session Type</span>
            </button>

            {/* Bottom Actions Row */}
            <div className="flex items-center gap-4 w-full">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full font-bold text-xs sm:text-sm text-center transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveSessionEdit}
                disabled={saving}
                className="flex-1 py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-xs sm:text-sm text-center transition-all shadow-md active:scale-98 disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============ DELETE ACCOUNT MODAL ============ */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Illustration */}
            <div className="w-40 sm:w-52 h-auto my-2">
              <Image
                src="/assets/delete.png"
                alt="Delete Account"
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
              Are you sure you want to delete your account? This action cannot be undone.
            </p>

            {/* Red Pill Action Button */}
            <button
              onClick={handleDeleteAccount}
              className="w-full max-w-[260px] py-3.5 bg-[#E32A2A] hover:bg-[#c92222] text-white rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[150] p-4">
          <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Illustration */}
            <div className="w-40 sm:w-52 h-auto my-2">
              <Image
                src="/assets/settings-saved.png"
                alt="Settings Saved"
                width={220}
                height={160}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
              Settings Saved!
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
              {successModalMessage || 'Your settings have been saved successfully.'}
            </p>

            {/* Blue Pill Action Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full max-w-[260px] py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
