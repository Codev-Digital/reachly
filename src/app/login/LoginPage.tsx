'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { Mail, Lock } from 'lucide-react';
import FormInput, { FormError } from '@/components/FormInput';
import { isValidEmail } from '@/lib/validators';
import { postAuthRoute, safeBookingReturnTo } from '@/lib/postAuthRoute';
import AuthLayout from '@/components/auth/AuthLayout';

export default function LoginPage({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedEmail = localStorage.getItem('reachly_remember_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch {
        /* ignore storage access issues */
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const signupUrl = `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    // Client-side checks so obvious mistakes never hit the server
    let hasError = false;
    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Please enter your password.');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // Error codes are thrown from `authorize` in /api/auth/[...nextauth]
        switch (result.error) {
          case 'EMAIL_REQUIRED':
            setEmailError('Please enter your email address.');
            break;
          case 'EMAIL_NOT_REGISTERED':
            setEmailError('The email you entered is not registered, please check again.');
            break;
          case 'ACCOUNT_DELETED':
            router.push(`/account-deleted?email=${encodeURIComponent(email)}`);
            break;
          case 'EMAIL_NOT_VERIFIED':
            setEmailError('Please verify your email before signing in.');
            break;
          case 'PASSWORD_REQUIRED':
            setPasswordError('Please enter your password.');
            break;
          case 'NO_PASSWORD':
            setPasswordError("This account doesn't have a password yet. Use Google sign-in or reset your password.");
            break;
          case 'WRONG_PASSWORD':
            setPasswordError('The password you provided is incorrect. Please try again.');
            break;
          default:
            setError('Unable to sign in. Please try again.');
        }
      } else {
        try {
          if (rememberMe) {
            localStorage.setItem('reachly_remember_email', email.trim());
          } else {
            localStorage.removeItem('reachly_remember_email');
          }
        } catch {
          /* ignore storage access issues */
        }

        const redirectRes = await fetch('/api/user/login-redirect-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (redirectRes.ok) {
          const redirectInfo = await redirectRes.json();
          const isAdmin = ['admin@reachly.com', 'abdullahgotaccess@gmail.com'].includes(email.toLowerCase().trim());
          const bookingReturnTo = safeBookingReturnTo(callbackUrl);
          const target = postAuthRoute({ ...redirectInfo, isAdmin });

          if (bookingReturnTo) {
            try {
              if (target === '/user/dashboard' || target === '/creators/dashboard') {
                localStorage.removeItem('reachly_booking_return_to');
              } else {
                localStorage.setItem('reachly_booking_return_to', bookingReturnTo);
              }
            } catch {}
            router.replace(
              (target === '/user/pending-approval' || target === '/creators/pending-approval')
                ? `${target}?returnTo=${encodeURIComponent(bookingReturnTo)}`
                : target === '/user/dashboard' || target === '/creators/dashboard'
                  ? bookingReturnTo
                  : target,
            );
          } else {
            router.replace(target);
          }
        } else {
          router.replace('/welcome');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    const bookingReturnTo = safeBookingReturnTo(callbackUrl);
    if (bookingReturnTo) {
      try {
        localStorage.setItem('reachly_booking_return_to', bookingReturnTo);
      } catch {}
    }
    // /welcome looks up the account and sends the user (or creator) to the right place
    signIn('google', { callbackUrl });
  };

  return (
    <AuthLayout
      footer={(
        <p className="font-sans text-xs font-medium text-gray-500">
          Do not have an account?{' '}
          <button
            type="button"
            className="cursor-pointer font-bold text-[#0012FF] hover:underline"
            onClick={() => router.push(signupUrl)}
          >
            Sign up
          </button>
        </p>
      )}
    >
      <div>
              <div className="text-center mb-8">
                <h1 className="font-sans font-extrabold text-black text-3xl sm:text-4xl leading-tight tracking-tight mb-2">
                  Welcome Back
                </h1>
                <p className="font-sans text-gray-400 text-sm">
                  Login to your Reachly account to continue
                </p>
              </div>

              {error && <FormError className="mb-4">{error}</FormError>}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Email Address */}
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

                {/* Password */}
                <FormInput
                  label="Password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  icon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  error={passwordError}
                />

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0012FF] focus:ring-[#0012FF] cursor-pointer accent-[#0012FF]"
                    />
                    <span className="font-sans text-xs text-gray-500 font-medium group-hover:text-gray-700 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="font-sans text-xs text-black font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0012FF] hover:bg-[#000EB4] active:scale-[0.98] text-white font-sans font-bold py-3.5 px-6 rounded-2xl text-sm tracking-wide shadow-lg shadow-[#0012FF]/25 transition-all disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2"></div>
                <span className="relative bg-white px-4 font-sans text-gray-400 text-xs font-semibold">
                  or continue with
                </span>
              </div>

              {/* Google LogIn */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 px-4 font-sans text-gray-700 text-xs font-bold flex items-center justify-center gap-2.5 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <Image
                    src="/google.svg"
                    alt="Google"
                    width={16}
                    height={16}
                  />
                )}
                {isGoogleLoading ? 'Redirecting...' : 'Log in with Google'}
              </button>
      </div>
    </AuthLayout>
  );
}
