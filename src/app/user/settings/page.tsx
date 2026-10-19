'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import UserNavbar from '@/components/UserNavbar';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { logout } from '@/lib/logout';
import FormInput from '@/components/FormInput';
import CitySelect from '@/components/CitySelect';

export default function UserSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Profile' | 'Security'>('Profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');
  
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('Karachi');
  const [country, setCountry] = useState('Pakistan');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('reachly_user_settings_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.name) setDisplayName(parsed.name);
        if (parsed.email) setEmailAddress(parsed.email);
        if (parsed.profilePhoto) setProfilePhoto(parsed.profilePhoto);
      }
    } catch (e) {}

    async function loadUser() {
      try {
        const res = await fetch('/api/user/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setDisplayName(data.user.name || '');
            setEmailAddress(data.user.email || '');
            setProfilePhoto(data.user.profilePhoto || null);
            try {
              sessionStorage.setItem('reachly_user_settings_cache', JSON.stringify({
                name: data.user.name || '',
                email: data.user.email || '',
                profilePhoto: data.user.profilePhoto || null
              }));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error('Failed to load user info:', err);
      }
    }
    loadUser();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    setIsSavingProfile(true);
    try {
      const payload: Record<string, any> = { displayName };
      if (profilePhoto) payload.profilePhoto = profilePhoto;

      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        try {
          sessionStorage.setItem('reachly_user_settings_cache', JSON.stringify({
            name: displayName,
            email: emailAddress,
            profilePhoto: profilePhoto
          }));
        } catch (e) {}
        setSuccessModalMessage('Your profile changes have been saved successfully.');
        setShowSuccessModal(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save changes');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving changes');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsUpdatingPassword(true);
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

      if (res.ok) {
        setSuccessModalMessage('Your password has been changed successfully.');
        setShowSuccessModal(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update password');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/user/settings', {
        method: 'DELETE'
      });
      if (res.ok) {
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

        alert('Account deleted successfully.');
        logout('/signup');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting account');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const languages = ['Urdu', 'English', 'Punjabi', 'Sindhi', 'Pashto'];

  return (
    <div className="min-h-screen bg-[#F7F7FA] pb-12">
      <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.main
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-grow"
        >
            {/* Header */}
            <div className="mb-8">
              <p className="text-gray-400 font-sans mb-1 text-sm font-medium">Hello {displayName}!</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black font-anton tracking-tight">
                Account <span className="text-[#0012FF]">Settings</span> <span className="text-gray-400 font-normal text-xl sm:text-2xl">/ Overview</span>
              </h1>
            </div>

          {/* Refined Top Navigation Segment Bar - Centered with Icons and Headings */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8 max-w-sm mx-auto">
            {[
              {
                name: 'Profile' as 'Profile' | 'Security',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="8" r="3" />
                    <path d="M4 20c1-4 5-6 8-6s7 2 8 6" />
                  </svg>
                )
              },
              {
                name: 'Security' as 'Profile' | 'Security',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )
              }
            ].map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  activeTab === tab.name
                    ? 'bg-[#0012FF] border-[#0012FF] text-white shadow-md shadow-blue-100 scale-102'
                    : 'bg-white border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'Profile' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-black font-anton uppercase tracking-wide">Profile</h2>
              <p className="text-gray-400 text-sm mb-6">Keep your information up to date.</p>

              <div className="w-full h-px bg-gray-100 mb-6" />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />

              {/* Photo Area */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <img src="/avatar.png" alt="Avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{displayName}</h3>
                  <p className="text-xs text-gray-400 mb-3">@{displayName.toLowerCase().replace(/\s+/g, '')}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#0012FF] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm hover:opacity-90 transition-all"
                  >
                    Change Profile Photo
                  </button>
                  <p className="text-[10px] text-gray-400 mt-1.5">JPG or PNG, max 10MB</p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FormInput
                  label="Display Name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <FormInput
                  label="Email Address"
                  type="email"
                  value={emailAddress}
                  disabled
                  className="disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>

              {/* Bio */}
              <div className="mb-6">
                <label className="font-bold text-xs text-gray-900 block mb-2 font-sans">Short Bio</label>
                <textarea
                  rows={4}
                  maxLength={140}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all resize-none"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
                  <span>Appears on your cards in search results</span>
                  <span>{bio.length}/140</span>
                </div>
              </div>

              {/* City and Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <CitySelect label="City" value={city} onChange={setCity} />
                </div>
                <div className="relative">
                  <label className="font-bold text-xs text-gray-900 block mb-2 font-sans">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none appearance-none"
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                  <div className="absolute right-4 top-[42px] pointer-events-none text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="mb-8">
                <label className="font-bold text-xs text-gray-900 block mb-3 font-sans">Languages Spoken</label>
                <div className="flex flex-wrap gap-2.5">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-5 py-2 rounded-xl text-xs font-semibold border transition-all ${selectedLanguage === lang
                        ? 'bg-[#0012FF] border-[#0012FF] text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => router.back()}
                  disabled={isSavingProfile}
                  className="bg-white border border-gray-200 text-gray-500 px-6 py-2.5 rounded-full text-xs font-bold hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSavingProfile}
                  className="bg-[#0012FF] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-80"
                >
                  {isSavingProfile ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'Security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-bold text-black font-anton uppercase tracking-wide">Security</h2>
                <p className="text-gray-400 text-sm mb-6">Manage your password and security settings.</p>

                <div className="w-full h-px bg-gray-100 mb-6" />

                <div className="space-y-6 mb-8">
                  {/* Old Password */}
                  <FormInput
                    label="Old Password"
                    type="password"
                    placeholder="Enter old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />

                  {/* Password Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* New Password */}
                    <FormInput
                      label="New Password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />

                    {/* Confirm Password */}
                    <FormInput
                      label="Confirm Password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Save Password Button */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    disabled={isUpdatingPassword}
                    className="bg-white border border-gray-200 text-gray-500 px-6 py-2.5 rounded-full text-xs font-bold hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword}
                    className="bg-[#0012FF] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 min-w-[150px] disabled:opacity-80"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Updating...</span>
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </div>

              {/* Delete Account Card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-black font-anton uppercase tracking-wide">Delete Account</h2>
                  <p className="text-gray-400 text-sm">Deleting your account will permanently remove all your data.</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-[#D92D20] text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-red-700 transition-all shadow-sm flex-shrink-0"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </motion.main>
      </div>

      {/* Delete Account Confirmation Modal */}
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
