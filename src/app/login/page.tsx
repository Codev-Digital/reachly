'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Logo from '../components/Logo';
import HeroImage from '../components/HeroImage';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        // NextAuth wraps the error message thrown in authorize()
        setError(result.error);
      } else {
        router.push('/welcome');
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/welcome' });
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
                Welcome back
              </h1>
              <p className="font-sans text-[#F9F6F2] text-sm sm:text-base">
                Sign in to continue your journey
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                <p className="font-sans text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 max-w-md">
              <div>
                <label className="block font-sans text-[#F9F6F2] text-xs sm:text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-sm sm:text-base text-white focus:outline-none focus:border-[#C8A97E]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block font-sans text-[#F9F6F2] text-xs sm:text-sm mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-sm sm:text-base text-white focus:outline-none focus:border-[#C8A97E] pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#F9F6F2]"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="font-sans text-[#C8A97E] text-xs sm:text-sm hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Log in'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mt-6 sm:mt-8 max-w-md">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[rgba(200,169,126,0.15)] -translate-y-1/2"></div>
              <div className="text-center">
                <span className="bg-[#0C0C0C] px-4 font-sans text-[#F9F6F2] text-xs sm:text-sm opacity-60">
                  or continue with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="space-y-3 mt-6 sm:mt-8 max-w-md">
              <button 
                onClick={handleGoogleSignIn}
                className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 font-sans text-[#F9F6F2] text-xs sm:text-sm flex items-center justify-center gap-2 hover:border-opacity-50 transition-all"
              >
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={16}
                  height={16}
                  className="sm:w-[18px] sm:h-[18px]"
                />
                Log in with Google
              </button>
              <button className="w-full bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 font-sans text-[#F9F6F2] text-xs sm:text-sm flex items-center justify-center gap-2 hover:border-opacity-50 transition-all">
                <Image
                  src="/facebook.svg"
                  alt="Facebook"
                  width={16}
                  height={16}
                  className="sm:w-[18px] sm:h-[18px]"
                />
                Log in with Facebook
              </button>
            </div>

            <div className="relative mt-8 sm:mt-10 lg:mt-12 max-w-md">
              <div className="absolute top-0 left-0 right-0 h-px bg-[rgba(200,169,126,0.15)]"></div>
              <p className="text-center font-sans text-[#F9F6F2] text-sm sm:text-base pt-4 sm:pt-6">
                Don't have an account? <span className="text-[#C8A97E] font-semibold cursor-pointer" onClick={() => router.push('/welcome')}>Sign up</span>
              </p>
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
