'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import HeroImage from '../components/HeroImage';
import { verifyOTP, resendOTP } from '@/lib/auth-client';

function VerifyEmailForm() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/welcome';
  const [email, setEmail] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('signupEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      router.push('/signup');
    }
  }, [router]);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    const newCode = [...code];
    digits.forEach((digit, i) => {
      if (i < 6) {
        newCode[i] = digit;
      }
    });
    setCode(newCode);

    const focusIndex = Math.min(digits.length, 5);
    const nextInput = document.getElementById(`code-${focusIndex}`);
    nextInput?.focus();
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join('');
    if (otp.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const res = await verifyOTP(email, otp);
      if (res.success) {
        router.push(`/set-password?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      } else {
        setError(res.error || 'Invalid code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      const res = await resendOTP(email);
      if (res.success) {
        setCode(['', '', '', '', '', '']);
      } else {
        setError(res.error || 'Failed to resend');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
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
              <div className="text-center mb-8">
                <h1 className="font-anton font-bold text-black text-2xl sm:text-3xl md:text-4xl leading-tight uppercase mb-3">
                  Verify Email
                </h1>
                <p className="font-sans text-gray-400 text-sm">
                  We've sent a 6-digit code to your email <span className="text-[#0012FF] font-semibold">{email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-sans text-xs text-red-600 font-semibold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 6 OTP boxes */}
                <div className="flex justify-between gap-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onPaste={handlePaste}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 bg-white border border-gray-200 rounded-xl text-center font-sans font-bold text-xl text-black focus:outline-none focus:border-[#0012FF] transition-all"
                      maxLength={1}
                      required
                    />
                  ))}
                </div>

                <div className="text-center">
                  <p className="font-sans text-xs text-gray-400">
                    Didn't receive the code?{' '}
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

                {/* Action button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0012FF] hover:bg-[#000EB4] active:scale-[0.98] text-white font-sans font-bold py-3.5 px-6 rounded-full text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>
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
}

export default function VerifyEmailPage() {
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
