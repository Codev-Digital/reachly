'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Logo from '../components/Logo';
import HeroImage from '../components/HeroImage';
import { setPassword, checkPasswordStrength, requestChangeEmail, verifyChangeEmail } from '@/lib/auth-client';

function SetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/welcome';
  const [email, setEmail] = useState('');
  
  // Change email state
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changeEmailOTP, setChangeEmailOTP] = useState('');
  const [changeEmailStep, setChangeEmailStep] = useState<'request' | 'verify'>('request');
  const [changeEmailLoading, setChangeEmailLoading] = useState(false);
  const [changeEmailError, setChangeEmailError] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('signupEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      router.push('/signup');
    }
  }, [router]);

  const getStrengthLabel = () => {
    if (!password) return '';
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^A-Za-z0-9]/)) score++;

    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };
  
  const getFilledBarsForLabel = () => {
    const label = getStrengthLabel();
    if (label === 'Weak') return 1;
    if (label === 'Fair') return 2;
    if (label === 'Good') return 3;
    if (label === 'Strong') return 4;
    return 0;
  };
  
  // Keep original check for validation
  const strength = checkPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (strength.strength === 'weak') {
      setError('Please choose a stronger password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await setPassword(email, password, confirmPassword);
      if (res.success) {
        await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
        router.push(callbackUrl);
      } else {
        setError(res.error || 'Failed to set password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChangeEmail = async () => {
    setChangeEmailLoading(true);
    setChangeEmailError('');
    try {
      const res = await requestChangeEmail(email, newEmail);
      if (res.success) {
        setChangeEmailStep('verify');
      } else {
        setChangeEmailError(res.error || 'Failed to send OTP');
      }
    } catch (err) {
      setChangeEmailError('Network error. Please try again.');
    } finally {
      setChangeEmailLoading(false);
    }
  };

  const handleVerifyChangeEmail = async () => {
    setChangeEmailLoading(true);
    setChangeEmailError('');
    try {
      const res = await verifyChangeEmail(email, changeEmailOTP);
      if (res.success) {
        localStorage.setItem('signupEmail', newEmail);
        setEmail(newEmail);
        setShowChangeEmail(false);
        setChangeEmailStep('request');
        setNewEmail('');
        setChangeEmailOTP('');
      } else {
        setChangeEmailError(res.error || 'Invalid OTP');
      }
    } catch (err) {
      setChangeEmailError('Network error. Please try again.');
    } finally {
      setChangeEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          {/* Left Content */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-16 flex flex-col justify-center">
            <div className="mb-10 sm:mb-12 lg:mb-16">
              <Logo />
            </div>
            
            <div className="max-w-md mx-auto w-full">
              {!showChangeEmail ? (
                <>
                  <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                    <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#C8A97E] mb-3 sm:mb-4">
                      Set your Password
                    </h1>
                    <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm px-4">
                      Enter a new password for your account. Make sure it's strong and secure.
                    </p>
                    <p className="font-sans text-[#F9F6F2] text-xs opacity-60 mt-2">
                      For: {email}
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                      <p className="font-sans text-sm text-red-300">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    <div>
                      <label className="block font-sans text-[#F9F6F2] text-lg mb-3">Password</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPasswordState(e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-2xl pl-14 pr-12 py-5 font-sans text-lg text-white focus:outline-none focus:border-[#C8A97E]"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C8A97E] opacity-60 hover:opacity-100"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                            {showPassword ? (
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator - Figma Style */}
                      {password && (
                        <div className="mt-3">
                          <div className="flex gap-2 mb-2">
                            {[0, 1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-2 flex-1 rounded-full transition-all duration-300"
                                style={{
                                  backgroundColor: i < getFilledBarsForLabel() ? '#C8A97E' : 'rgba(255,255,255,0.1)'
                                }}
                              />
                            ))}
                          </div>
                          <p className="text-lg font-sans text-[#F9F6F2]">
                            {getStrengthLabel()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-8">
                      <label className="block font-sans text-[#F9F6F2] text-lg mb-3">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-2xl pl-14 pr-12 py-5 font-sans text-lg text-white focus:outline-none focus:border-[#C8A97E]"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C8A97E] opacity-60 hover:opacity-100"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                            {showConfirmPassword ? (
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-10">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-4 px-6 rounded-full text-lg hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Setting password...' : 'Set Password'}
                      </button>
                    </div>

                    <div className="text-center my-4 sm:my-6">
                      <span className="font-sans text-[#F9F6F2] text-sm">OR</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowChangeEmail(true)}
                      className="w-full border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full text-sm hover:bg-[#C8A97E] hover:text-[#0C0C0C] transition-all"
                    >
                      Change Email Address
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <button 
                      onClick={() => setShowChangeEmail(false)}
                      className="flex items-center text-[#C8A97E] mb-4 text-sm"
                    >
                      ← Back
                    </button>
                    <h1 className="font-serif text-2xl font-bold text-[#C8A97E] mb-3">
                      Change Email
                    </h1>
                  </div>

                  {changeEmailError && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                      <p className="font-sans text-sm text-red-300">{changeEmailError}</p>
                    </div>
                  )}

                  {changeEmailStep === 'request' ? (
                    <div className="space-y-5">
                      <div>
                        <label className="block font-sans text-[#F9F6F2] text-xs mb-2">New Email Address</label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-sm sm:text-base text-white focus:outline-none focus:border-[#C8A97E]"
                          placeholder="you@example.com"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleRequestChangeEmail}
                        disabled={changeEmailLoading}
                        className="w-full bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full text-sm hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {changeEmailLoading ? 'Sending...' : 'Send Verification Code'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <label className="block font-sans text-[#F9F6F2] text-xs mb-2">
                          Enter the 6-digit code sent to {newEmail}
                        </label>
                        <input
                          type="text"
                          value={changeEmailOTP}
                          onChange={(e) => setChangeEmailOTP(e.target.value)}
                          className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-sm sm:text-base text-white focus:outline-none focus:border-[#C8A97E]"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyChangeEmail}
                        disabled={changeEmailLoading}
                        className="w-full bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full text-sm hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {changeEmailLoading ? 'Verifying...' : 'Verify & Change Email'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Side - Hero Image - Visible on tablets and larger */}
          <div className="hidden md:block lg:block">
            <div className="h-full min-h-[400px] md:min-h-[600px] lg:min-h-[800px]">
              <HeroImage />
            </div>
          </div>
          
          {/* Mobile Hero Image - Visible only on mobile */}
          <div className="block md:hidden mt-6">
            <div className="h-[350px] rounded-[20px] overflow-hidden">
              <HeroImage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-7xl text-center">
          <div className="animate-pulse text-[#C8A97E]">Loading...</div>
        </div>
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}
