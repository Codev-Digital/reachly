'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HeroImage from '../components/HeroImage';
import { useLoading } from '@/contexts/LoadingContext';
import { Mail, Lock } from 'lucide-react';
import FormInput, { FormError } from '@/components/FormInput';
import { isValidEmail } from '@/lib/validators';

type Step = 'request' | 'verify' | 'setpassword' | 'done';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { navigateWithLoading } = useLoading();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  // `error` is the form-level message; the others belong to a specific field
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  /* ── Step 1: Request OTP ── */
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
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
        setEmailError(data.error || 'Something went wrong');
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
    setError('');
    setPasswordError('');
    setConfirmError('');

    let hasError = false;
    if (!password) {
      setPasswordError('Please enter a new password.');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      hasError = true;
    }
    if (!confirmPassword) {
      setConfirmError('Please confirm your password.');
      hasError = true;
    } else if (password && password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
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
        const message = data.error || 'Something went wrong';
        if (data.field === 'password') setPasswordError(message);
        else if (data.field === 'confirmPassword') setConfirmError(message);
        else setError(message);
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

        {error && <FormError className="mb-4">{error}</FormError>}

        <form onSubmit={handleResetPassword} noValidate className="space-y-4">
          {/* New Password */}
          <FormInput
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            placeholder="Enter new password"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
          />

          {/* Confirm Password */}
          <FormInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            placeholder="Confirm new password"
            icon={<Lock className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmError) setConfirmError('');
            }}
            error={confirmError}
          />

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

        {error && <FormError className="mb-4">{error}</FormError>}

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

      {error && <FormError className="mb-4">{error}</FormError>}

      <form onSubmit={handleRequestReset} noValidate className="space-y-4">
        <FormInput
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="Enter your email"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError('');
          }}
          error={emailError}
        />

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
