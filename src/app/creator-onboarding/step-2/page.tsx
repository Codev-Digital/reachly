'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateCreatorProfile, getCurrentUser } from '@/lib/auth-client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useOnboardingCleanup } from '@/hooks/useOnboardingCleanup';

// ─── Required fields (must all be non-empty to continue) ───────────────────────
const REQUIRED: Record<string, string> = {
  profilePhoto: 'Profile photo',
  coverPhoto: 'Cover photo',
  displayName: 'Display Name',
  username: 'Username / Handle',
  shortBio: 'Short Bio',
  longBio: 'Long Bio',
  city: 'City',
  languages: 'Languages Spoken (at least one)',
  niches: 'Niche / Category (at least one)',
};

export default function CreatorOnboardingStep2() {
  const router = useRouter();
  useOnboardingCleanup();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [bioCount, setBioCount] = useState(0);
  const [longBioCount, setLongBioCount] = useState(0);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    shortBio: '',
    longBio: '',
    city: '',
    country: 'Pakistan',
    instagram: '',
    tiktok: '',
    youtube: '',
    linkedin: '',
  });

  // ─── Load saved data on mount so user never loses progress ───────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/creator-onboarding/step-2', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const profile = data.profile;
          if (profile) {
            setFormData({
              displayName: profile.displayName || '',
              username: profile.username || '',
              shortBio: profile.shortBio || '',
              longBio: profile.longBio || '',
              city: profile.city || '',
              country: profile.country || 'Pakistan',
              instagram: profile.socialLinks?.instagram || '',
              tiktok: profile.socialLinks?.tiktok || '',
              youtube: profile.socialLinks?.youtube || '',
              linkedin: profile.socialLinks?.linkedin || '',
            });
            setSelectedLanguages(profile.languages || []);
            setSelectedNiches(profile.niches || []);
            setBioCount(profile.shortBio?.length || 0);
            setLongBioCount(profile.longBio?.length || 0);
            if (profile.profilePhoto) setProfilePhotoPreview(profile.profilePhoto);
            if (profile.coverPhoto) setCoverPhotoPreview(profile.coverPhoto);
          }
        }
      } finally {
        setFetchingData(false);
      }
    };
    fetchProfile();
  }, []);

  // ─── Debounced Username Check ───────────────────────────────────────────────────
  useEffect(() => {
    const val = formData.username.trim() || '';
    if (!val) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    // Basic format validation locally before hitting API
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(val)) {
      setUsernameStatus('taken');
      setUsernameMessage('Must be 3-30 chars (letters, numbers, _, -)');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('');

    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/creators/check-username?username=${encodeURIComponent(val)}`);
        const data = await res.json();

        if (data.available) {
          setUsernameStatus('available');
          setUsernameMessage(data.message || 'Available');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage(data.message || 'Already taken');
        }
      } catch (err) {
        setUsernameStatus('idle');
        setUsernameMessage('Could not verify username');
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [formData.username]);

  const languages = ['Urdu', 'English', 'Punjabi', 'Sindhi', 'Pashto'];
  const niches = ['Lifestyle', 'Tech', 'Fitness', 'Fashion', 'Business', 'Education', 'Beauty', 'Food'];

  const toggleLanguage = (lang: string) => {
    setTouched(t => ({ ...t, languages: true }));
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const toggleNiche = (niche: string) => {
    setTouched(t => ({ ...t, niches: true }));
    setSelectedNiches(prev => {
      if (prev.includes(niche)) return prev.filter(n => n !== niche);
      if (prev.length >= 3) return prev;
      return [...prev, niche];
    });
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhotoFile(file);
    setTouched(t => ({ ...t, profilePhoto: true }));
    const reader = new FileReader();
    reader.onload = ev => setProfilePhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPhotoFile(file);
    setTouched(t => ({ ...t, coverPhoto: true }));
    const reader = new FileReader();
    reader.onload = ev => setCoverPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ─── Compute which required fields are missing ────────────────────────────────
  const getMissingFields = () => {
    const missing: string[] = [];
    if (!profilePhotoPreview) missing.push('profilePhoto');
    if (!coverPhotoPreview) missing.push('coverPhoto');
    if (!formData.displayName.trim()) missing.push('displayName');
    if (!formData.username.trim()) missing.push('username');
    if (!formData.shortBio.trim()) missing.push('shortBio');
    if (!formData.longBio.trim()) missing.push('longBio');
    if (!formData.city || formData.city === 'Choose your city') missing.push('city');
    if (selectedLanguages.length === 0) missing.push('languages');
    if (selectedNiches.length === 0) missing.push('niches');
    return missing;
  };

  const isFieldInvalid = (key: string) =>
    touched[key] && getMissingFields().includes(key);

  const borderClass = (key: string) =>
    isFieldInvalid(key)
      ? 'border-red-500/70 focus:border-red-500'
      : 'border-gray-200 focus:border-[#0012FF]';

  // ─── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark everything touched so red outlines show
    const allKeys = Object.keys(REQUIRED);
    setTouched(Object.fromEntries(allKeys.map(k => [k, true])));

    if (usernameStatus === 'checking') {
      setError('Still checking username availability...');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (usernameStatus === 'taken') {
      setError('Please choose an available username.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const missing = getMissingFields();
    if (missing.length > 0) {
      setError(
        `Please fill in: ${missing.map(k => REQUIRED[k]).join(', ')}`
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('displayName', formData.displayName);
      fd.append('username', formData.username);
      fd.append('shortBio', formData.shortBio);
      fd.append('longBio', formData.longBio);
      fd.append('city', formData.city);
      fd.append('country', formData.country);
      fd.append('languages', JSON.stringify(selectedLanguages));
      fd.append('niches', JSON.stringify(selectedNiches));
      fd.append('instagram', formData.instagram);
      fd.append('tiktok', formData.tiktok);
      fd.append('youtube', formData.youtube);
      fd.append('linkedin', formData.linkedin);
      if (profilePhotoFile) fd.append('profilePhoto', profilePhotoFile);
      if (coverPhotoFile) fd.append('coverPhoto', coverPhotoFile);

      const result = await updateCreatorProfile(fd);

      if (result.success) {
        router.push('/creator-onboarding/step-3');
      } else {
        setError(result.error || 'Failed to save profile. Please try again.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return <LoadingAnimation />;

  const missingFields = getMissingFields();
  const allTouched = Object.keys(REQUIRED).every(k => touched[k]);

  return (
    <div className="min-h-screen bg-[#F7F7FA]">




      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-anton text-4xl font-bold text-black mb-2">
            Profile Setup
          </h1>
          <p className="text-sm text-gray-500">
            How followers will see you on Reachly. You can edit this anytime.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* ─── Cover and Profile Photos ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 mb-6">
          {/* Cover Photo */}
          <div className="relative mb-16">
            <label className="block">
              <div className={`w-full h-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${coverPhotoPreview ? 'bg-transparent' : ''} ${isFieldInvalid('coverPhoto') ? 'border-2 border-red-500' : ''}`}>
                {coverPhotoPreview ? (
                  <img src={coverPhotoPreview} alt="Cover" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"  stroke="#0012FF" strokeWidth="2">
                        <rect x="3" y="7" width="18" height="14" rx="3" />
                        <circle cx="12" cy="14" r="3.5" />
                        <path d="M8 7l1.5-2h5L16 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Upload Cover photo</p>
                    <p className="text-xs text-gray-400">16:9 ratio recommended, drag to reposition (coming soon)</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverPhotoChange} className="hidden" />
            </label>

            {/* Profile Photo - Overlapping the cover photo */}
            <div className="absolute -bottom-14 left-8">
              <div className="relative">
                <label className="block">
                  <div className={`w-36 h-36 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center cursor-pointer overflow-hidden ${isFieldInvalid('profilePhoto') ? 'border-red-500' : 'border-white'}`}>
                    {profilePhotoPreview ? (
                      <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                        <path d="M12 14c-3.31 0-10 1.66-10 5v2h20v-2c0-3.34-6.69-5-10-5z" />
                      </svg>
                    )}
                  </div>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfilePhotoChange} className="hidden" />
                </label>
                {/* Upload button for profile photo */}
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0012FF] rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfilePhotoChange} className="hidden" />
                </label>
              </div>
              <p className="mt-3 text-xs text-gray-400 ml-2">JPG or PNG, max 5MB</p>
            </div>
          </div>
        </div>

        {/* ─── Display Name & Username ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.displayName}
              onChange={(e) => { setFormData({ ...formData, displayName: e.target.value }); setTouched(t => ({ ...t, displayName: true })); }}
              onBlur={() => setTouched(t => ({ ...t, displayName: true }))}
              className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none placeholder-gray-400 ${borderClass('displayName')}`}
              placeholder="e.g. username"
            />
            {isFieldInvalid('displayName') && <p className="text-red-500 text-xs mt-1">Display name is required</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Username / Handle <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input type="text" value={formData.username}
                onChange={(e) => { setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }); setTouched(t => ({ ...t, username: true })); }}
                onBlur={() => setTouched(t => ({ ...t, username: true }))}
                className={`w-full bg-white border rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 focus:outline-none placeholder-gray-400 ${borderClass('username')}`}
                placeholder="e.g. @username"
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && (
                  <svg className="animate-spin w-4 h-4 text-[#0012FF]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                )}
                {usernameStatus === 'available' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                )}
                {usernameStatus === 'taken' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                )}
              </div>
            </div>

            <div className="flex justify-between items-start mt-1">
              <p className="text-xs text-gray-400">reachly.pk/{formData.username || 'yourhandle'}</p>
              {usernameMessage && (
                <p className={`text-xs ${usernameStatus === 'taken' ? 'text-red-500' : usernameStatus === 'available' ? 'text-green-600' : 'text-gray-400'}`}>
                  {usernameMessage}
                </p>
              )}
            </div>
            {isFieldInvalid('username') && <p className="text-red-500 text-xs mt-1">Username is required</p>}
          </div>
        </div>

        {/* ─── Short Bio ─────────────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Short Bio / Tagline <span className="text-red-500">*</span>
          </label>
          <textarea maxLength={140} value={formData.shortBio}
            onChange={(e) => { setFormData({ ...formData, shortBio: e.target.value }); setBioCount(e.target.value.length); setTouched(t => ({ ...t, shortBio: true })); }}
            onBlur={() => setTouched(t => ({ ...t, shortBio: true }))}
            className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none h-24 resize-none placeholder-gray-400 ${borderClass('shortBio')}`}
            placeholder="A one-line summary of who you are and what you do."
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-400">Appears on your cards in search results</p>
            <p className="text-xs text-gray-400">{bioCount}/140</p>
          </div>
          {isFieldInvalid('shortBio') && <p className="text-red-500 text-xs mt-1">Short bio is required</p>}
        </div>

        {/* ─── Long Bio ──────────────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Long Bio <span className="text-red-500">*</span>
          </label>
          <textarea maxLength={1000} value={formData.longBio}
            onChange={(e) => { setFormData({ ...formData, longBio: e.target.value }); setLongBioCount(e.target.value.length); setTouched(t => ({ ...t, longBio: true })); }}
            onBlur={() => setTouched(t => ({ ...t, longBio: true }))}
            className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none h-32 resize-none placeholder-gray-400 ${borderClass('longBio')}`}
            placeholder="Tell followers your story, your expertise, and what they can expect from your sessions."
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-400">Up to 1000 characters</p>
            <p className="text-xs text-gray-400">{longBioCount}/1000</p>
          </div>
          {isFieldInvalid('longBio') && <p className="text-red-500 text-xs mt-1">Long bio is required</p>}
        </div>

        {/* ─── City & Country ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <select value={formData.city}
              onChange={(e) => { setFormData({ ...formData, city: e.target.value }); setTouched(t => ({ ...t, city: true })); }}
              onBlur={() => setTouched(t => ({ ...t, city: true }))}
              className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none ${borderClass('city')}`}
            >
              <option value="">Select your city</option>
              <option>Karachi</option>
              <option>Lahore</option>
              <option>Islamabad</option>
              <option>Rawalpindi</option>
              <option>Faisalabad</option>
              <option>Peshawar</option>
              <option>Quetta</option>
              <option>Multan</option>
            </select>
            {isFieldInvalid('city') && <p className="text-red-500 text-xs mt-1">Please select your city</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Country <span className="text-red-500">*</span></label>
            <input type="text" value="Pakistan" readOnly
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* ─── Languages ────────────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-700 mb-3">
            Languages Spoken <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${selectedLanguages.includes(lang) ? 'bg-[#0012FF] text-white border-[#0012FF]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
              >
                {lang}
              </button>
            ))}
          </div>
          {isFieldInvalid('languages') && <p className="text-red-500 text-xs mt-2">Select at least one language</p>}
        </div>

        {/* ─── Niches ───────────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-gray-700 mb-3">
            Niche / Categories (max 3) <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {niches.map(niche => (
              <button key={niche} type="button" onClick={() => toggleNiche(niche)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${selectedNiches.includes(niche) ? 'bg-[#0012FF] text-white border-[#0012FF]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
              >
                {niche}
              </button>
            ))}
          </div>
          {isFieldInvalid('niches') && <p className="text-red-500 text-xs mt-2">Select at least one niche</p>}
        </div>

        {/* ─── Social Links (optional) ───────────────────────────────────────────────── */}
        <div className="mb-10">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Social Links</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { key: 'instagram', placeholder: 'instagram.com/yourhandle', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"     stroke="#0012FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" />
                </svg>
              )},
              { key: 'tiktok', placeholder: 'tiktok.com/yourhandle', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"     stroke="#0012FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 3v10.5a3.5 3.5 0 1 1-3.5-3.5" />
                  <path d="M16 3c.5 2.5 2.5 4.5 5 5" />
                </svg>
              )},
              { key: 'youtube', placeholder: 'youtube.com/yourprofile', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"     stroke="#0012FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="4" />
                  <path d="M10 9l6 3-6 3V9z" fill="#666" />
                </svg>
              )},
              { key: 'linkedin', placeholder: 'linkedin.com/yourprofile', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"    stroke="#0012FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="M7 10v7" />
                  <circle cx="7" cy="7" r="1" />
                  <path d="M11 17v-4a2 2 0 0 1 4 0v4" />
                </svg>
              )},
            ] as const).map(({ key, placeholder, icon }) => (
              <div key={key} className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  {icon}
                </span>
                <input type="text" value={(formData as any)[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] placeholder-gray-400"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ─── Navigation ───────────────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push('/')}
            className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Save as Draft
          </button>
          <button type="submit" disabled={loading}
            className="bg-[#0012FF] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0012FF]/90 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                Saving…
              </>
            ) : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}

