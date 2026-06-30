'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HeroImage from '../components/HeroImage';
import { useLoading } from '@/contexts/LoadingContext';

type Step = 'request' | 'verify' | 'setpassword' | 'done';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { navigateWithLoading } = useLoading();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  /* ── Step 1: Request OTP ── */
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('verify');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP (moves to set-password step) ── */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    // We don't call the API here — OTP will be submitted with new password in step 3.
    // Just advance the step after checking OTP is filled.
    setError('');
    setStep('setpassword');
  };

  /* ── Step 3: Set New Password (sends OTP + password together) ── */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), password, confirmPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('done');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(data.error || 'Failed to resend');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  /* ── OTP input helpers ── */
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const newOtp = [...otp];
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    const focus = Math.min(digits.length, 5);
    document.getElementById(`otp-${focus}`)?.focus();
  };

  /* ── Shared layout ── */
  const layout = (content: React.ReactNode) => (
    <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl bg-white rounded-[32px] p-4 lg:p-6 shadow-xl border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Left Form Side */}
          <div className="lg:col-span-6 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
            {/* Logo */}
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

            <div className="my-auto max-w-md mx-auto w-full">
              {content}
            </div>

            <div className="mt-8 pt-4" />
          </div>

          {/* Right Hero Side */}
          <div className="hidden lg:block lg:col-span-6 relative">
            <div className="h-full min-h-[600px] lg:min-h-[700px]">
              <HeroImage />
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  /* ── DONE ── */
  if (step === 'done') {
    return layout(
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-[#0012FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#0012FF]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-anton font-bold text-black text-3xl sm:text-4xl uppercase mb-3">
          Password Reset!
        </h1>
        <p className="font-sans text-gray-500 text-sm mb-8 leading-relaxed">
          Your password has been reset successfully.
        </p>
        <button
          onClick={() => navigateWithLoading('/login')}
          className="w-full bg-[#0012FF] hover:bg-[#000EB4] text-white font-sans font-bold py-3.5 px-6 rounded-full text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    );
  }

  /* ── SET NEW PASSWORD ── */
  if (step === 'setpassword') {
    return layout(
      <div>
        <div className="text-center mb-8">
          <h1 className="font-anton text-black font-bold text-3xl sm:text-4xl md:text-5xl leading-tight uppercase mb-3">
            Set Your Password
          </h1>
          <p className="font-sans text-gray-400 text-sm">
            Enter a new password for your account, make sure it's strong
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="font-sans text-xs text-red-600 font-semibold"> {error}</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block font-sans text-gray-700 font-semibold text-xs mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-[#0012FF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-12 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-sans text-gray-700 font-semibold text-xs mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-[#0012FF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-12 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? (
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0012FF] hover:bg-[#000EB4] active:scale-[0.98] text-white font-sans font-bold py-3.5 px-6 rounded-full text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Resetting...' : 'Set Password'}
          </button>

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2"></div>
            <span className="relative bg-white px-4 font-sans text-gray-400 text-xs font-semibold">or</span>
          </div>

          <button
            type="button"
            onClick={() => { setStep('request'); setError(''); setOtp(['', '', '', '', '', '']); }}
            className="w-full bg-white border border-[#0012FF] text-[#0012FF] font-sans font-bold py-3 px-6 rounded-full text-xs hover:bg-[#0012FF]/5 transition-all cursor-pointer"
          >
            Change Email Address
          </button>
        </form>
      </div>
    );
  }

  /* ── VERIFY OTP ── */
  if (step === 'verify') {
    return layout(
      <div>
        <div className="text-center mb-8">
          <h1 className="font-anton font-bold text-black text-3xl sm:text-4xl md:text-5xl leading-tight uppercase mb-3">
            Password Reset
          </h1>
          <p className="font-sans text-gray-400 text-sm">
            We've sent a recovery code on email{' '}
            <span className="text-[#0012FF] font-semibold">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="font-sans text-xs text-red-600 font-semibold"> {error}</p>
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          {/* OTP inputs */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={handleOtpPaste}
                maxLength={1}
                className="w-12 h-14 sm:w-14 sm:h-16 bg-white border border-gray-200 rounded-xl text-center font-sans font-bold text-xl text-black focus:outline-none focus:border-[#0012FF] focus:shadow-[0_0_0_3px_rgba(0,18,255,0.1)] transition-all"
              />
            ))}
          </div>

          <div className="text-center">
            <p className="font-sans text-xs text-gray-400">
              Didn't get a code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-[#0012FF] font-bold hover:underline cursor-pointer disabled:opacity-50"
              >
                {resending ? 'Resending...' : 'Click to Resend'}
              </button>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0012FF] hover:bg-[#000EB4] active:scale-[0.98] text-white font-sans font-bold py-3.5 px-6 rounded-full text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2"></div>
            <span className="relative bg-white px-4 font-sans text-gray-400 text-xs font-semibold">or</span>
          </div>

          <button
            type="button"
            onClick={() => { setStep('request'); setError(''); setOtp(['', '', '', '', '', '']); }}
            className="w-full bg-white border border-[#0012FF] text-[#0012FF] font-sans font-bold py-3 px-6 rounded-full text-xs hover:bg-[#0012FF]/5 transition-all cursor-pointer"
          >
            Change Email Address
          </button>
        </form>
      </div>
    );
  }

  /* ── REQUEST RESET (default) ── */
  return layout(
    <div>
      <div className="text-center mb-8">
        <h1 className="font-anton font-bold text-black text-3xl sm:text-4xl md:text-5xl leading-tight uppercase mb-3">
          Forgot Password?
        </h1>
        <p className="font-sans text-gray-400 text-sm">
          Enter your email and we'll send you a otp
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="font-sans text-xs text-red-600 font-semibold"> {error}</p>
        </div>
      )}

      <form onSubmit={handleRequestReset} className="space-y-4">
        <div>
          <label className="block font-sans text-gray-700 font-semibold text-xs mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-[#0012FF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0012FF] hover:bg-[#000EB4] active:scale-[0.98] text-white font-sans font-bold py-3.5 px-6 rounded-full text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 mt-4 cursor-pointer"
        >
          {loading ? 'Sending...' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-8 pt-4 border-t border-gray-100 text-center">
        <p className="font-sans text-xs text-gray-500 font-medium">
          Remember your password?{' '}
          <span
            className="text-[#0012FF] font-bold cursor-pointer hover:underline"
            onClick={() => navigateWithLoading('/login')}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
