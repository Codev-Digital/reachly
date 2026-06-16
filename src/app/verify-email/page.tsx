'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '../components/Logo';
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

    // Focus the next empty input or last input
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
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          {/* Left Content */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-16 flex flex-col justify-center">
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <Logo />
            </div>

            <div className="mb-8 sm:mb-10 lg:mb-12">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Verify your email
              </h1>
              <p className="font-sans text-[#F9F6F2] text-sm sm:text-base">
                We've sent a 6-digit code to your email
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                <p className="font-sans text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 max-w-md">
              <div className="flex justify-center gap-2 sm:gap-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 sm:w-14 sm:h-16 bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg text-center font-serif text-xl sm:text-2xl text-white focus:outline-none focus:border-[#C8A97E]"
                    maxLength={1}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>

            <div className="text-center mt-8 sm:mt-10 lg:mt-12 max-w-md">
              <p className="font-sans text-[#F9F6F2] text-sm sm:text-base mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resending}
                className="font-sans text-[#C8A97E] text-sm sm:text-base font-semibold disabled:opacity-50"
              >
                {resending ? 'Resending...' : 'Resend code'}
              </button>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-7xl text-center">
          <div className="animate-pulse text-[#C8A97E]">Loading...</div>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
