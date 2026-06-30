'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
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

  const layout = (content: React.ReactNode) => (
    <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl bg-white rounded-[32px] p-4 lg:p-6 shadow-xl border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Form Side */}
          <div className="lg:col-span-6 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
            {/* Top Logo */}
            <div className="mb-8">
              <Image
                src="/assets/logo1.png"
                alt="Reachly Logo"
                width={120}
                height={40}
                style={{ width: 'auto', height: '40px' }}
                className="cursor-pointer"
                onClick={() => router.push('/')}
                priority
              />
            </div>

            {/* Central Form Container */}
            <div className="my-auto max-w-md mx-auto w-full">
              {content}
            </div>

            {/* Bottom spacer */}
            <div className="mt-8 pt-4" />
          </div>

          {/* Right Side - Hero Image */}
          <div className="hidden lg:block lg:col-span-6 relative">
            <div className="h-full min-h-[600px] lg:min-h-[700px]">
              <HeroImage />
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  if (showChangeEmail) {
    return layout(
      <div>
        <div className="text-center mb-8">
          <button 
            onClick={() => setShowChangeEmail(false)}
            className="flex items-center text-[#0012FF] mb-4 text-xs font-bold hover:underline cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="font-anton text-black text-3xl sm:text-4xl uppercase mb-3">
            Change Email
          </h1>
          <p className="font-sans text-gray-400 text-sm">
            Update your registered email address
          </p>
        </div>

        {changeEmailError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="font-sans text-xs text-red-600 font-semibold">{changeEmailError}</p>
          </div>
        )}

        {changeEmailStep === 'request' ? (
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-gray-700 font-semibold text-xs mb-2">New Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleRequestChangeEmail}
              disabled={changeEmailLoading}
              className="w-full bg-[#0012FF] hover:bg-[#000EB4] active:scale-[0.98] text-white font-sans font-bold py-3.5 px-6 rounded-full text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {changeEmailLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-gray-700 font-semibold text-xs mb-2">
                Enter code sent to {newEmail}
              </label>
              <input
                type="text"
                value={changeEmailOTP}
                onChange={(e) => setChangeEmailOTP(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyChangeEmail}
              disabled={changeEmailLoading}
              className="w-full bg-[#0012FF] hover:bg-[#000EB4] active:scale-[0.98] text-white font-sans font-bold py-3.5 px-6 rounded-full text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {changeEmailLoading ? 'Verifying...' : 'Verify & Change Email'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return layout(
    <div>
      <div className="text-center mb-8">
        <h1 className="font-anton text-black text-3xl sm:text-4xl md:text-5xl leading-tight uppercase mb-3">
          Set Your Password
        </h1>
        <p className="font-sans text-gray-400 text-sm">
          Enter a new password for your account, make sure it's strong
        </p>
        <p className="font-sans text-gray-400 text-xs mt-2">
          For: <span className="text-black font-semibold">{email}</span>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="font-sans text-xs text-red-600 font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password */}
        <div>
          <label className="block font-sans text-gray-700 font-semibold text-xs mb-2">Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {/* Lock Icon */}
              <svg className="w-4 h-4 text-[#0012FF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPasswordState(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-12 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-3">
              <div className="flex gap-1.5 mb-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: i < getFilledBarsForLabel() ? '#0012FF' : '#E5E7EB'
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-sans font-bold text-black">
                {getStrengthLabel()}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block font-sans text-gray-700 font-semibold text-xs mb-2">Confirm Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {/* Lock Icon */}
              <svg className="w-4 h-4 text-[#0012FF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-12 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Action button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0012FF] hover:bg-[#000EB4] active:scale-[0.98] text-white font-sans font-bold py-3.5 px-6 rounded-full text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 mt-6 cursor-pointer"
        >
          {loading ? 'Setting password...' : 'Set Password'}
        </button>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2"></div>
          <span className="relative bg-white px-4 font-sans text-gray-400 text-xs font-semibold">
            or
          </span>
        </div>

        {/* Change email address */}
        <button
          type="button"
          onClick={() => setShowChangeEmail(true)}
          className="w-full bg-white border border-[#0012FF] text-[#0012FF] font-sans font-bold py-3 px-6 rounded-full text-xs hover:bg-[#0012FF]/5 transition-all cursor-pointer"
        >
          Change Email Address
        </button>
      </form>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-7xl text-center">
          <div className="animate-pulse text-[#0012FF]">Loading...</div>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
// Renamed helper block internally to match routing exports
const VerifyEmailForm = SetPasswordForm;
export { VerifyEmailForm };
