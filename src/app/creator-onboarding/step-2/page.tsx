'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreatorNavbar from '@/components/CreatorNavbar';
import { updateCreatorProfile, getCurrentUser } from '@/lib/auth-client';

// ── Required fields (must all be non-empty to continue) ─────────────────────
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

  // ── Load saved data on mount so user never loses progress ─────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setFormData({
            displayName: user.displayName || '',
            username: user.username || '',
            shortBio: user.shortBio || '',
            longBio: user.longBio || '',
            city: user.city || '',
            country: user.country || 'Pakistan',
            instagram: user.socialLinks?.instagram || '',
            tiktok: user.socialLinks?.tiktok || '',
            youtube: user.socialLinks?.youtube || '',
            linkedin: user.socialLinks?.linkedin || '',
          });
          setSelectedLanguages(user.languages || []);
          setSelectedNiches(user.niches || []);
          setBioCount(user.shortBio?.length || 0);
          setLongBioCount(user.longBio?.length || 0);
          if (user.profilePhoto) setProfilePhotoPreview(user.profilePhoto);
          if (user.coverPhoto) setCoverPhotoPreview(user.coverPhoto);
        }
      } finally {
        setFetchingData(false);
      }
    };
    fetchUser();
  }, []);

  // ── Debounced Username Check ────────────────────────────────────────────────
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

  // ── Compute which required fields are missing ──────────────────────────────
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
      : 'border-[rgba(200,169,126,0.15)] focus:border-[#C8A97E]';

  // ── Submit ─────────────────────────────────────────────────────────────────
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

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <div className="text-[#C8A97E] font-serif text-lg animate-pulse">Loading your profile…</div>
      </div>
    );
  }

  const missingFields = getMissingFields();
  const allTouched = Object.keys(REQUIRED).every(k => touched[k]);

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <CreatorNavbar />

      {/* Progress Steps */}
      <div className="border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            <StepItem num={1} label="Welcome" status="completed" />
            <div className="flex-1 h-px bg-[#C8A97E] mx-1 sm:mx-2" />
            <StepItem num={2} label="Profile" status="active" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={3} label="Sessions" status="upcoming" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={4} label="Pricing" status="upcoming" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={5} label="Availability" status="upcoming" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={6} label="Verification" status="upcoming" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={7} label="Go Live" status="upcoming" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
        <div className="mb-8 sm:mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#C8A97E] mb-2 sm:mb-3">
            Profile Setup
          </h1>
          <p className="font-sans text-[#F9F6F2] text-sm sm:text-base opacity-80">
            How followers will see you on Reachly. You can edit this anytime.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="font-sans text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Progress indicator */}
        {allTouched && missingFields.length > 0 && (
          <div className="mb-6 p-4 bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-lg">
            <p className="font-sans text-xs text-[#C8A97E] font-semibold mb-2">
              {Object.keys(REQUIRED).length - missingFields.length} / {Object.keys(REQUIRED).length} required fields complete
            </p>
            <div className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C8A97E] rounded-full transition-all duration-300"
                style={{ width: `${((Object.keys(REQUIRED).length - missingFields.length) / Object.keys(REQUIRED).length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Photos ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Profile Photo */}
          <div>
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="flex flex-col gap-2 sm:gap-3">
                <label className="block font-sans text-[#F9F6F2] text-xs font-semibold">
                  Profile photo <span className="text-red-400">*</span>
                </label>
                <label className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed flex items-center justify-center bg-[#141414] cursor-pointer overflow-hidden ${isFieldInvalid('profilePhoto') ? 'border-red-500/70' : 'border-[rgba(200,169,126,0.3)]'}`}>
                  {profilePhotoPreview ? (
                    <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                      <path d="M12 14c-3.31 0-10 1.66-10 5v2h20v-2c0-3.34-6.69-5-10-5z" />
                    </svg>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfilePhotoChange} className="hidden" />
                </label>
              </div>
              <div className="flex-1 w-full">
                <label className="hidden sm:block font-sans text-[#F9F6F2] text-xs font-semibold mb-3">&nbsp;</label>
                <label className="w-full sm:w-auto border border-[rgba(200,169,126,0.3)] text-[#C8A97E] px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm cursor-pointer inline-block text-center">
                  Upload photo
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfilePhotoChange} className="hidden" />
                </label>
                <p className="font-sans text-[#F9F6F2] text-xs opacity-60 mt-2">JPG, PNG or WebP, max 5 MB</p>
                {isFieldInvalid('profilePhoto') && <p className="text-red-400 text-xs mt-1">Profile photo is required</p>}
              </div>
            </div>
          </div>

          {/* Cover Photo */}
          <div>
            <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2 sm:mb-3">
              Cover photo <span className="text-red-400">*</span>
            </label>
            <label className={`w-full h-32 sm:h-36 rounded-lg border flex items-center justify-center mb-2 overflow-hidden cursor-pointer ${isFieldInvalid('coverPhoto') ? 'border-red-500/70' : 'border-[rgba(200,169,126,0.15)]'} bg-[#141414]`}>
              {coverPhotoPreview ? (
                <img src={coverPhotoPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bcab93" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="7" width="18" height="14" rx="3" />
                  <circle cx="12" cy="14" r="3.5" />
                  <path d="M8 7l1.5-2h5L16 7" />
                </svg>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverPhotoChange} className="hidden" />
            </label>
            <p className="font-sans text-[#F9F6F2] text-xs opacity-60">16:9 ratio recommended</p>
            {isFieldInvalid('coverPhoto') && <p className="text-red-400 text-xs mt-1">Cover photo is required</p>}
          </div>
        </div>

        {/* ── Display Name & Username ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-5 sm:mb-6">
          <div>
            <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input type="text" value={formData.displayName}
              onChange={(e) => { setFormData({ ...formData, displayName: e.target.value }); setTouched(t => ({ ...t, displayName: true })); }}
              onBlur={() => setTouched(t => ({ ...t, displayName: true }))}
              className={`w-full bg-[#141414] border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none ${borderClass('displayName')}`}
              placeholder="e.g. Kainat Khan" />
            {isFieldInvalid('displayName') && <p className="text-red-400 text-xs mt-1">Display name is required</p>}
          </div>
          <div>
            <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
              Username / Handle <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input type="text" value={formData.username}
                onChange={(e) => { setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }); setTouched(t => ({ ...t, username: true })); }}
                onBlur={() => setTouched(t => ({ ...t, username: true }))}
                className={`w-full bg-[#141414] border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 pr-10 font-sans text-white text-xs sm:text-sm focus:outline-none ${borderClass('username')}`}
                placeholder="e.g. kainat-khan" />

              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && (
                  <svg className="animate-spin w-4 h-4 text-[#C8A97E]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
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
              <p className="font-sans text-[#F9F6F2] text-xs opacity-60">reachly.pk/{formData.username || 'yourhandle'}</p>
              {usernameMessage && (
                <p className={`font-sans text-[10px] ${usernameStatus === 'taken' ? 'text-red-400' : usernameStatus === 'available' ? 'text-emerald-400' : 'text-[#F9F6F2] opacity-60'}`}>
                  {usernameMessage}
                </p>
              )}
            </div>
            {isFieldInvalid('username') && <p className="text-red-400 text-xs mt-1">Username is required</p>}
          </div>
        </div>

        {/* ── Short Bio ── */}
        <div className="mb-5 sm:mb-6">
          <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
            Short Bio (Tagline) <span className="text-red-400">*</span>
          </label>
          <textarea maxLength={140} value={formData.shortBio}
            onChange={(e) => { setFormData({ ...formData, shortBio: e.target.value }); setBioCount(e.target.value.length); setTouched(t => ({ ...t, shortBio: true })); }}
            onBlur={() => setTouched(t => ({ ...t, shortBio: true }))}
            className={`w-full bg-[#141414] border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none h-20 sm:h-24 resize-none ${borderClass('shortBio')}`}
            placeholder="A one-line summary of who you are and what you do." />
          <div className="flex justify-between mt-1">
            <p className="font-sans text-[#F9F6F2] text-xs opacity-60">Appears on your card in search results</p>
            <p className="font-sans text-[#F9F6F2] text-xs opacity-60">{bioCount}/140</p>
          </div>
          {isFieldInvalid('shortBio') && <p className="text-red-400 text-xs mt-1">Short bio is required</p>}
        </div>

        {/* ── Long Bio ── */}
        <div className="mb-5 sm:mb-6">
          <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
            Long Bio <span className="text-red-400">*</span>
          </label>
          <textarea maxLength={1000} value={formData.longBio}
            onChange={(e) => { setFormData({ ...formData, longBio: e.target.value }); setLongBioCount(e.target.value.length); setTouched(t => ({ ...t, longBio: true })); }}
            onBlur={() => setTouched(t => ({ ...t, longBio: true }))}
            className={`w-full bg-[#141414] border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none h-32 sm:h-36 resize-none ${borderClass('longBio')}`}
            placeholder="Tell followers your story, your expertise, and what they can expect from your sessions." />
          <div className="flex justify-between mt-1">
            <p className="font-sans text-[#F9F6F2] text-xs opacity-60">Up to 1000 characters</p>
            <p className="font-sans text-[#F9F6F2] text-xs opacity-60">{longBioCount}/1000</p>
          </div>
          {isFieldInvalid('longBio') && <p className="text-red-400 text-xs mt-1">Long bio is required</p>}
        </div>

        {/* ── City & Country ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-5 sm:mb-6">
          <div>
            <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
              City <span className="text-red-400">*</span>
            </label>
            <select value={formData.city}
              onChange={(e) => { setFormData({ ...formData, city: e.target.value }); setTouched(t => ({ ...t, city: true })); }}
              onBlur={() => setTouched(t => ({ ...t, city: true }))}
              className={`w-full bg-[#141414] border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none ${borderClass('city')}`}>
              <option value="">Choose your city</option>
              <option>Karachi</option>
              <option>Lahore</option>
              <option>Islamabad</option>
              <option>Rawalpindi</option>
              <option>Faisalabad</option>
              <option>Peshawar</option>
              <option>Quetta</option>
              <option>Multan</option>
            </select>
            {isFieldInvalid('city') && <p className="text-red-400 text-xs mt-1">Please select your city</p>}
          </div>
          <div>
            <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">Country</label>
            <input type="text" value="Pakistan" readOnly
              className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm opacity-60 cursor-not-allowed" />
          </div>
        </div>

        {/* ── Languages ── */}
        <div className="mb-5 sm:mb-6">
          <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-3">
            Languages Spoken <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {languages.map(lang => (
              <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-sans border transition-all ${selectedLanguages.includes(lang) ? 'bg-[#C8A97E] text-[#0C0C0C] border-[#C8A97E]' : 'bg-[#141414] text-[#F9F6F2] border-[rgba(200,169,126,0.3)]'}`}>
                {lang}
              </button>
            ))}
          </div>
          {isFieldInvalid('languages') && <p className="text-red-400 text-xs mt-2">Select at least one language</p>}
        </div>

        {/* ── Niches ── */}
        <div className="mb-8 sm:mb-10">
          <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-3">
            Niche / Categories (max 3) <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {niches.map(niche => (
              <button key={niche} type="button" onClick={() => toggleNiche(niche)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-sans border transition-all ${selectedNiches.includes(niche) ? 'bg-[#C8A97E] text-[#0C0C0C] border-[#C8A97E]' : 'bg-[#141414] text-[#F9F6F2] border-[rgba(200,169,126,0.3)]'}`}>
                {niche}
              </button>
            ))}
          </div>
          {isFieldInvalid('niches') && <p className="text-red-400 text-xs mt-2">Select at least one niche</p>}
        </div>

        {/* ── Social Links (optional) ── */}
        <div className="mb-8 sm:mb-10">
          <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-1">Social Links</label>
          <p className="font-sans text-[#F9F6F2] text-xs opacity-50 mb-3">Optional — add any you want to show on your profile</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {([
              { key: 'instagram', placeholder: 'instagram.com/yourhandle', icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></> },
              { key: 'tiktok', placeholder: 'tiktok.com/yourhandle', icon: <><path d="M16 3v10.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M16 3c.5 2.5 2.5 4.5 5 5" /></> },
              { key: 'youtube', placeholder: 'youtube.com/yourprofile', icon: <><rect x="3" y="5" width="18" height="14" rx="4" /><path d="M10 9l6 3-6 3V9z" /></> },
              { key: 'linkedin', placeholder: 'linkedin.com/yourprofile', icon: <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M7 10v7" /><circle cx="7" cy="7" r="1" /><path d="M11 17v-4a2 2 0 0 1 4 0v4" /></> },
            ] as const).map(({ key, placeholder, icon }) => (
              <div key={key} className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                </span>
                <input type="text" value={(formData as any)[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none focus:border-[#C8A97E]"
                  placeholder={placeholder} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button type="button" onClick={() => router.push('/creator-onboarding/step-1')}
            className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm hover:bg-[#C8A97E] hover:text-[#0C0C0C] transition-all flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Saving…</>
            ) : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}

function StepItem({ num, label, status }: { num: number; label: string; status: 'completed' | 'active' | 'upcoming' }) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2 min-w-[60px] sm:min-w-[80px]">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-serif text-sm sm:text-base font-semibold transition-all ${status === 'completed' ? 'bg-[#141414] text-[#C8A97E] border border-[#C8A97E]'
        : status === 'active' ? 'bg-[#C8A97E] text-[#0C0C0C]'
          : 'bg-[#141414] text-[#F9F6F2] border border-[rgba(200,169,126,0.3)] opacity-60'
        }`}>
        {status === 'completed'
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          : num}
      </div>
      <span className={`text-[10px] sm:text-xs font-sans font-medium text-center ${status === 'completed' || status === 'active' ? 'text-[#C8A97E]' : 'text-[#F9F6F2] opacity-60'}`}>
        {label}
      </span>
    </div>
  );
}
