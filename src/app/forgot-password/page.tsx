'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../components/Logo';
import HeroImage from '../components/HeroImage';

type Step = 'request' | 'verify' | 'done';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password, confirmPassword }),
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

  const layout = (content: React.ReactNode) => (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          <div className="p-4 sm:p-6 md:p-8 lg:p-16 flex flex-col justify-center">
            <div className="mb-8 sm:mb-10 lg:mb-12"><Logo /></div>
            {content}
          </div>
          <div className="hidden md:block">
            <div className="h-full min-h-[400px] md:min-h-[600px] lg:min-h-[800px]"><HeroImage /></div>
          </div>
          <div className="block md:hidden mt-6">
            <div className="h-[350px] rounded-[20px] overflow-hidden"><HeroImage /></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (step === 'done') {
    return layout(
      <div className="max-w-md mx-auto w-full text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#C8A97E] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">Password Reset!</h1>
        <p className="font-sans text-[#F9F6F2] text-sm sm:text-base mb-8 opacity-80">
          Your password has been reset successfully.
        </p>
        <button onClick={() => router.push('/login')}
          className="w-full bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:opacity-90 transition-all">
          Back to Login
        </button>
      </div>
    );
  }

  if (step === 'verify') {
    return layout(
      <div className="max-w-md">
        <div className="mb-8 sm:mb-10">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Enter reset code</h1>
          <p className="font-sans text-[#F9F6F2] text-sm sm:text-base opacity-80">
            We sent a 6-digit code to <span className="text-[#C8A97E]">{email}</span>.
            Enter it below along with your new password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="font-sans text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block font-sans text-[#F9F6F2] text-xs sm:text-sm mb-2">6-digit code</label>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required
              className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-base text-white tracking-[0.5em] focus:outline-none focus:border-[#C8A97E]"
              placeholder="000000" />
          </div>

          <div>
            <label className="block font-sans text-[#F9F6F2] text-xs sm:text-sm mb-2">New Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-sm sm:text-base text-white focus:outline-none focus:border-[#C8A97E] pr-12"
                placeholder="Enter new password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F9F6F2] opacity-60 hover:opacity-100">
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-sans text-[#F9F6F2] text-xs sm:text-sm mb-2">Confirm New Password</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-sm sm:text-base text-white focus:outline-none focus:border-[#C8A97E] pr-12"
                placeholder="Confirm new password" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F9F6F2] opacity-60 hover:opacity-100">
                {showConfirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="relative mt-8 max-w-md">
          <div className="absolute top-0 left-0 right-0 h-px bg-[rgba(200,169,126,0.15)]"></div>
          <p className="text-center font-sans text-[#F9F6F2] text-sm pt-4">
            <span className="text-[#C8A97E] font-semibold cursor-pointer" onClick={() => { setStep('request'); setError(''); }}>← Back</span>
          </p>
        </div>
      </div>
    );
  }

  // step === 'request'
  return layout(
    <div className="max-w-md">
      <div className="mb-8 sm:mb-10 lg:mb-12">
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Forgot password?</h1>
        <p className="font-sans text-[#F9F6F2] text-sm sm:text-base">Enter your email to receive a reset code.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
          <p className="font-sans text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleRequestReset} className="space-y-5 sm:space-y-6">
        <div>
          <label className="block font-sans text-[#F9F6F2] text-xs sm:text-sm mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-sm sm:text-base text-white focus:outline-none focus:border-[#C8A97E]"
            placeholder="you@example.com" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:opacity-90 transition-all disabled:opacity-50">
          {loading ? 'Sending...' : 'Send reset code'}
        </button>
      </form>

      <div className="relative mt-8 sm:mt-10 lg:mt-12">
        <div className="absolute top-0 left-0 right-0 h-px bg-[rgba(200,169,126,0.15)]"></div>
        <p className="text-center font-sans text-[#F9F6F2] text-sm sm:text-base pt-4 sm:pt-6">
          Remember your password?{' '}
          <span className="text-[#C8A97E] font-semibold cursor-pointer" onClick={() => router.push('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  );
}
