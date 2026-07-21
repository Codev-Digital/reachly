'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import HeroImage from '../components/HeroImage';
import { signUp } from '@/lib/auth-client';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/welcome';
  const userType =
    searchParams.get('type') ||
    (callbackUrl.startsWith('/creator-onboarding') ? 'creator' : 'user');

  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signUp(formData.name, formData.email);
      if (res.success) {
        localStorage.setItem('signupEmail', formData.email);
        router.push(`/verify-email?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      } else {
        setError(res.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    signIn('google', { callbackUrl });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
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
            Create Account
          </h1>
          <p className="font-sans text-gray-400 text-sm">
            {userType === 'creator'
              ? 'Join as a creator and share your knowledge'
              : 'Join to book sessions with amazing creators'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl">
            <p className="font-sans text-xs text-red-600 font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block font-sans text-gray-700 font-semibold text-xs mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {/* User Icon */}
                <svg className="w-4 h-4 text-[#0012FF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

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
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0012FF] hover:bg-[#000EB4] active:scale-[0.98] text-white font-sans font-bold py-3.5 px-6 rounded-full text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2"></div>
          <span className="relative bg-white px-4 font-sans text-gray-400 text-xs font-semibold">
            or continue with
          </span>
        </div>

        {/* Google Sign Up */}
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
          {isGoogleLoading ? 'Redirecting...' : 'Sign up with Google'}
        </button>
      </div>

      {/* Bottom Redirect Link */}
      <div className="mt-8 pt-4 border-t border-gray-100 text-center">
        <p className="font-sans text-xs text-gray-500 font-medium">
          Already have an account?{' '}
          <span
            className="text-[#0012FF] font-bold cursor-pointer hover:underline"
            onClick={() => router.push('/login')}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl bg-white rounded-[32px] p-4 lg:p-6 shadow-xl border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <Suspense fallback={null}>
            <SignupForm />
          </Suspense>

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
