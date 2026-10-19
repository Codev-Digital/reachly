'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import HeroImage from '../components/HeroImage';
import { Mail, Lock } from 'lucide-react';
import FormInput, { FormError } from '@/components/FormInput';
import { isValidEmail } from '@/lib/validators';
import { postAuthRoute } from '@/lib/postAuthRoute';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/welcome';
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
        const redirectRes = await fetch('/api/user/login-redirect-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (redirectRes.ok) {
          const redirectInfo = await redirectRes.json();
          const isAdmin = ['admin@reachly.com', 'abdullahgotaccess@gmail.com'].includes(email.toLowerCase().trim());
          const isBookingPath = callbackUrl.startsWith('/creators/') && callbackUrl.includes('/book-session');
          const target = postAuthRoute({ ...redirectInfo, isAdmin });

          router.replace(isBookingPath && (target === '/user/dashboard' || target === '/creators/dashboard') ? callbackUrl : target);
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
    // /welcome looks up the account and sends the user (or creator) to the right place
    signIn('google', { callbackUrl });
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
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#0012FF] focus:ring-[#0012FF]"
                    />
                    <span className="font-sans text-xs text-gray-500 font-medium">Remember me</span>
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
                  className="w-full bg-[#0012FF] hover:bg-[#000EB4] active:scale-[0.98] text-white font-sans font-bold py-3.5 px-6 rounded-full text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 mt-4 cursor-pointer"
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
                className="w-full bg-white border border-gray-200 rounded-full py-3 px-4 font-sans text-gray-700 text-xs font-bold flex items-center justify-center gap-2.5 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Bottom Redirect Link */}
            <div className="mt-8 pt-4 border-t border-gray-100 text-center">
              <p className="font-sans text-xs text-gray-500 font-medium">
                Do not have an account?{' '}
                <span
                  className="text-[#0012FF] font-bold cursor-pointer hover:underline"
                  onClick={() => router.push(signupUrl)}
                >
                  Sign up
                </span>
              </p>
            </div>
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
}
