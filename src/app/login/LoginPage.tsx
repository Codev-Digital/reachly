'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import HeroImage from '../components/HeroImage';
import PasswordToggle from '@/components/PasswordToggle';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/welcome';
  const initialUserType = callbackUrl.startsWith('/creator-onboarding') ? 'creator' : 'user';
  const [userType, setUserType] = useState<'user' | 'creator'>(initialUserType);
  const googleCallbackUrl = userType === 'creator'
    ? '/creator-onboarding/step-1'
    : '/user/pending-approval';
  const signupUrl = callbackUrl.startsWith('/creator-onboarding')
    ? `/signup?type=creator&callbackUrl=${encodeURIComponent(callbackUrl)}`
    : `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        const redirectRes = await fetch('/api/user/login-redirect-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (redirectRes.ok) {
          const redirectInfo = await redirectRes.json();
          const { onboardingStep, approvalStatus, hasSeenWelcome, hasCreatorProfile } = redirectInfo;

          const isFullyApproved = (approvalStatus === 'approved' || approvalStatus === 'active') && !!hasCreatorProfile;
          const isInOnboarding = onboardingStep > 0 && !isFullyApproved && approvalStatus !== 'pending';
          const isBookingPath = callbackUrl.startsWith('/creators/') && callbackUrl.includes('/book-session');

          if (email.toLowerCase().trim() === 'admin@reachly.com' || email.toLowerCase().trim() === 'abdullahgotaccess@gmail.com') {
            router.replace('/admin/dashboard');
          } else if (approvalStatus === 'pending') {
            router.replace(hasCreatorProfile ? '/creators/pending-approval' : '/user/pending-approval');
          } else if (isBookingPath) {
            router.replace(callbackUrl);
          } else if (isFullyApproved) {
            router.replace('/creators/dashboard');
          } else if (isInOnboarding) {
            const resumeStep = Math.max(1, Math.min(onboardingStep, 7));
            router.replace(`/creator-onboarding/step-${resumeStep}`);
          } else if (!hasSeenWelcome) {
            router.replace('/welcome');
          } else {
            router.replace('/user/dashboard');
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
    signIn('google', { callbackUrl: googleCallbackUrl });
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

              <div
                className="grid grid-cols-2 gap-3 mb-6"
                role="group"
                aria-label="Choose account type"
              >
                <button
                  type="button"
                  aria-pressed={userType === 'user'}
                  onClick={() => setUserType('user')}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                    userType === 'user'
                      ? 'border-[#0012FF] bg-[#0012FF] text-white shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#0012FF]'
                  }`}
                >
                  Continue as User
                </button>
                <button
                  type="button"
                  aria-pressed={userType === 'creator'}
                  onClick={() => setUserType('creator')}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                    userType === 'creator'
                      ? 'border-[#0012FF] bg-[#0012FF] text-white shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#0012FF]'
                  }`}
                >
                  Continue as Creator
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-sans text-xs text-red-600 font-semibold"> {error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Address */}
                <div>
                  <label className="block font-sans text-gray-700 font-semibold text-xs mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {/* Envelope Icon */}
                      <svg className="w-4 h-4 text-[#0012FF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-white border ${error ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-11 pr-4 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all`}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block font-sans text-gray-700 font-semibold text-xs mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
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
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full bg-white border ${error ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-11 pr-12 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all`}
                      placeholder="Enter your password"
                      required
                    />
                    <PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                  </div>
                </div>

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
