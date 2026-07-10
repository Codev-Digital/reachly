'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import UserNavbar from '@/components/UserNavbar';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UserSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Profile' | 'Security'>('Profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [displayName, setDisplayName] = useState('James Richard');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState('jamesrichard@gmail.com');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('Karachi');
  const [country, setCountry] = useState('Pakistan');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/user/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setDisplayName(data.profile?.displayName || data.user.name || 'James Richard');
            setEmailAddress(data.user.email || 'jamesrichard@gmail.com');
          }
          if (data.profile) {
            setProfilePhoto(data.profile.profilePhoto || null);
            setBio(data.profile.shortBio || '');
            setCity(data.profile.city || 'Karachi');
            setCountry(data.profile.country || 'Pakistan');
            if (data.profile.languages && data.profile.languages.length > 0) {
              setSelectedLanguage(data.profile.languages[0]);
            }
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
      if (file.size > 5 * 1024 * 1024) {
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

  const handleSaveChanges = async () => {
    try {
      const payload = {
        displayName,
        shortBio: bio,
        city,
        country,
        languages: [selectedLanguage],
        profilePhoto
      };

      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Profile updated successfully!');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save changes');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving changes');
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
        alert('Password updated successfully!');
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
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/user/settings', {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Account deleted successfully.');
        router.push('/signup');
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

          {/* Settings Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('Profile')}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === 'Profile'
                ? 'bg-[#EEF2FF]'
                : 'bg-white border border-gray-150'
                }`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'Profile' ? '#0012FF' : '#9CA3AF'} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="8" r="3" />
                  <path d="M4 20c1-4 5-6 8-6s7 2 8 6" />
                </svg>
              </div>
              <span className={`text-xs font-bold font-sans transition-all ${activeTab === 'Profile' ? 'text-[#0012FF]' : 'text-gray-400'
                }`}>
                Profile
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Security')}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === 'Security'
                ? 'bg-[#EEF2FF]'
                : 'bg-white border border-gray-150'
                }`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'Security' ? '#0012FF' : '#9CA3AF'} strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span className={`text-xs font-bold font-sans transition-all ${activeTab === 'Security' ? 'text-[#0012FF]' : 'text-gray-400'
                }`}>
                Security
              </span>
            </button>
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
                    <img src="/Avatars/1.jpg" alt="Avatar" className="w-full h-full object-cover" />
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
                  <p className="text-[10px] text-gray-400 mt-1.5">JPG or PNG, max 5MB</p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="font-bold text-xs text-gray-900 block mb-2 font-sans">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all"
                  />
                </div>
                <div>
                  <label className="font-bold text-xs text-gray-900 block mb-2 font-sans">Email Address</label>
                  <input
                    type="email"
                    value={emailAddress}
                    disabled
                    className="w-full bg-gray-550 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none cursor-not-allowed"
                  />
                </div>
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
                <div className="relative">
                  <label className="font-bold text-xs text-gray-900 block mb-2 font-sans">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none appearance-none"
                  >
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                  </select>
                  <div className="absolute right-4 top-[42px] pointer-events-none text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
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
                  className="bg-white border border-gray-200 text-gray-500 px-6 py-2.5 rounded-full text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="bg-[#0012FF] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-sm hover:opacity-90 transition-all"
                >
                  Save Changes
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
                  <div className="relative">
                    <label className="font-bold text-xs text-gray-900 block mb-2 font-sans">Old Password</label>
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder="Enter old password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* New Password */}
                    <div className="relative">
                      <label className="font-bold text-xs text-gray-900 block mb-2 font-sans">New Password</label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <label className="font-bold text-xs text-gray-900 block mb-2 font-sans">Confirm Password</label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
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
                    className="bg-white border border-gray-200 text-gray-500 px-6 py-2.5 rounded-full text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePassword}
                    className="bg-[#0012FF] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-sm hover:opacity-90 transition-all"
                  >
                    Update Password
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="relative overflow-visible w-full max-w-lg flex flex-col items-center p-8 pt-12 pb-8 z-10">
            {/* SVG Background */}
            <img
              src="/assets/cancel-card.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
            />

            {/* Close Button */}
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute -mt-20 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-50 transition-all z-20"
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
              <Image
                src="/assets/cancel-appointment.png"
                alt="Delete account"
                width={240}
                height={170}
                className="w-full h-auto object-contain"
              />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 text-center">
              Are You Sure?
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 text-center">
              Are you sure you want to delete your account?
            </p>

            <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
