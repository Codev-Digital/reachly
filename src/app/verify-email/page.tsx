'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyOTP, resendOTP } from '@/lib/auth-client';
import AuthLayout from '@/components/auth/AuthLayout';

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
    const timer = window.setTimeout(() => {
      const savedEmail = localStorage.getItem('signupEmail');
      if (savedEmail) setEmail(savedEmail);
      else router.push('/signup');
    }, 0);
    return () => window.clearTimeout(timer);
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
    } catch {
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
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      footer={(
        <p className="font-sans text-xs font-medium text-gray-500">
          Need to use another email?{' '}
          <Link href="/signup" className="font-bold text-[#0012FF] hover:underline">
            Back to sign up
          </Link>
        </p>
      )}
    >
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-sans text-3xl font-extrabold leading-tight tracking-tight text-black sm:text-4xl">
          Verify Email
        </h1>
        <p className="font-sans text-sm text-gray-400">
          We&apos;ve sent a 6-digit code to your email{' '}
          <span className="font-semibold text-[#0012FF]">{email}</span>
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="font-sans text-xs font-semibold text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              aria-label={`Verification digit ${index + 1}`}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-14 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white text-center font-sans text-xl font-bold text-black transition-all focus:border-[#0012FF] focus:outline-none sm:h-16"
              maxLength={1}
              required
            />
          ))}
        </div>

        <div className="text-center">
          <p className="font-sans text-xs text-gray-400">
            Didn&apos;t receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="cursor-pointer font-bold text-[#0012FF] hover:underline disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Click to Resend'}
            </button>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || code.join('').length !== 6}
          className="mt-4 w-full cursor-pointer rounded-2xl bg-[#0012FF] px-6 py-3.5 font-sans text-sm font-bold tracking-wide text-white shadow-lg shadow-[#0012FF]/25 transition-all hover:bg-[#000EB4] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={(
        <AuthLayout>
          <div className="animate-pulse text-center text-sm text-[#0012FF]">Loading...</div>
        </AuthLayout>
      )}
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
