'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { setPassword, checkPasswordStrength, requestChangeEmail, verifyChangeEmail } from '@/lib/auth-client';
import { Lock } from 'lucide-react';
import FormInput, { FormError } from '@/components/FormInput';
import { isValidEmail } from '@/lib/validators';
import AuthLayout from '@/components/auth/AuthLayout';

function SetPasswordForm() {
  const router = useRouter();
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // `error` is the form-level message; the others belong to a specific field
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/welcome';
  const [email, setEmail] = useState('');
  
  // Change email state
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changeEmailOTP, setChangeEmailOTP] = useState('');
  const [changeEmailStep, setChangeEmailStep] = useState<'request' | 'verify'>('request');
  const [changeEmailLoading, setChangeEmailLoading] = useState(false);
  const [changeEmailError, setChangeEmailError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedEmail = localStorage.getItem('signupEmail');
      if (savedEmail) setEmail(savedEmail);
      else router.push('/signup');
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  const getStrengthLabel = () => {
    if (!password) return '';
    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^A-Za-z0-9]/)) score++;

    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };
  
  const getFilledBarsForLabel = () => {
    const label = getStrengthLabel();
    if (label === 'Weak') return 1;
    if (label === 'Fair') return 2;
    if (label === 'Good') return 3;
    if (label === 'Strong') return 4;
    return 0;
  };
  
  const strength = checkPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    setConfirmError('');

    let hasError = false;
    if (!password) {
      setPasswordError('Please enter a password.');
      hasError = true;
    } else if (strength.strength === 'weak') {
      setPasswordError('Please choose a stronger password.');
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
      const res = await setPassword(email, password, confirmPassword);
      if (res.success) {
        await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
        router.push(callbackUrl);
      } else {
        const message = res.error || 'Failed to set password';
        if (res.field === 'password') setPasswordError(message);
        else if (res.field === 'confirmPassword') setConfirmError(message);
        else setError(message);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChangeEmail = async () => {
    setChangeEmailError('');
    if (!newEmail.trim()) {
      setChangeEmailError('Please enter your new email address.');
      return;
    }
    if (!isValidEmail(newEmail)) {
      setChangeEmailError('Please enter a valid email address.');
      return;
    }
    setChangeEmailLoading(true);
    try {
      const res = await requestChangeEmail(email, newEmail);
      if (res.success) {
        setChangeEmailStep('verify');
      } else {
        setChangeEmailError(res.error || 'Failed to send OTP');
      }
    } catch {
      setChangeEmailError('Network error. Please try again.');
    } finally {
      setChangeEmailLoading(false);
    }
  };

  const handleVerifyChangeEmail = async () => {
    setChangeEmailLoading(true);
    setChangeEmailError('');
    try {
      const res = await verifyChangeEmail(email, changeEmailOTP);
      if (res.success) {
        localStorage.setItem('signupEmail', newEmail);
        setEmail(newEmail);
        setShowChangeEmail(false);
        setChangeEmailStep('request');
        setNewEmail('');
        setChangeEmailOTP('');
      } else {
        setChangeEmailError(res.error || 'Invalid OTP');
      }
    } catch {
      setChangeEmailError('Network error. Please try again.');
    } finally {
      setChangeEmailLoading(false);
    }
  };

  const layout = (content: React.ReactNode) => (
    <AuthLayout>{content}</AuthLayout>
  );

  if (showChangeEmail) {
    return layout(
      <div>
        <div className="text-center mb-8">
          <button 
            onClick={() => setShowChangeEmail(false)}
            className="flex items-center text-[#0012FF] mb-4 text-xs font-bold hover:underline cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="mb-2 font-sans text-3xl font-extrabold leading-tight tracking-tight text-black sm:text-4xl">
            Change Email
          </h1>
          <p className="font-sans text-gray-400 text-sm">
            Update your registered email address
          </p>
        </div>

        {changeEmailStep === 'request' ? (
          <div className="space-y-4">
            <FormInput
              label="New Email Address"
              type="email"
              name="newEmail"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                if (changeEmailError) setChangeEmailError('');
              }}
              error={changeEmailError}
            />

            <button
              type="button"
              onClick={handleRequestChangeEmail}
              disabled={changeEmailLoading}
              className="mt-4 w-full cursor-pointer rounded-2xl bg-[#0012FF] px-6 py-3.5 font-sans text-sm font-bold tracking-wide text-white shadow-lg shadow-[#0012FF]/25 transition-all hover:bg-[#000EB4] active:scale-[0.98] disabled:opacity-50"
            >
              {changeEmailLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <FormInput
              label={`Enter code sent to ${newEmail}`}
              type="text"
              name="changeEmailOTP"
              inputMode="numeric"
              required
              placeholder="000000"
              maxLength={6}
              value={changeEmailOTP}
              onChange={(e) => {
                setChangeEmailOTP(e.target.value);
                if (changeEmailError) setChangeEmailError('');
              }}
              error={changeEmailError}
            />

            <button
              type="button"
              onClick={handleVerifyChangeEmail}
              disabled={changeEmailLoading}
              className="mt-4 w-full cursor-pointer rounded-2xl bg-[#0012FF] px-6 py-3.5 font-sans text-sm font-bold tracking-wide text-white shadow-lg shadow-[#0012FF]/25 transition-all hover:bg-[#000EB4] active:scale-[0.98] disabled:opacity-50"
            >
              {changeEmailLoading ? 'Verifying...' : 'Verify & Change Email'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return layout(
    <div>
      <div className="text-center mb-8">
        <h1 className="mb-2 font-sans text-3xl font-extrabold leading-tight tracking-tight text-black sm:text-4xl">
          Set Your Password
        </h1>
        <p className="font-sans text-gray-400 text-sm">
          Enter a new password for your account, make sure it&apos;s strong
        </p>
        <p className="font-sans text-gray-400 text-xs mt-2">
          For: <span className="text-black font-semibold">{email}</span>
        </p>
      </div>

      {error && <FormError className="mb-4">{error}</FormError>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Password */}
        <div>
          <FormInput
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            placeholder="Enter your password"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => {
              setPasswordState(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
          />
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-3">
              <div className="flex gap-1.5 mb-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: i < getFilledBarsForLabel() ? '#0012FF' : '#E5E7EB'
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-sans font-bold text-black">
                {getStrengthLabel()}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <FormInput
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          placeholder="Confirm your password"
          icon={<Lock className="w-4 h-4" />}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (confirmError) setConfirmError('');
          }}
          error={confirmError}
        />

        {/* Action button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full cursor-pointer rounded-2xl bg-[#0012FF] px-6 py-3.5 font-sans text-sm font-bold tracking-wide text-white shadow-lg shadow-[#0012FF]/25 transition-all hover:bg-[#000EB4] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Setting password...' : 'Set Password'}
        </button>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2"></div>
          <span className="relative bg-white px-4 font-sans text-gray-400 text-xs font-semibold">
            or
          </span>
        </div>

        {/* Change email address */}
        <button
          type="button"
          onClick={() => setShowChangeEmail(true)}
          className="w-full cursor-pointer rounded-2xl border border-[#0012FF] bg-white px-6 py-3 font-sans text-xs font-bold text-[#0012FF] transition-all hover:bg-[#0012FF]/5"
        >
          Change Email Address
        </button>
      </form>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<AuthLayout><div className="animate-pulse text-center text-sm text-[#0012FF]">Loading...</div></AuthLayout>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
// Renamed helper block internally to match routing exports
const VerifyEmailForm = SetPasswordForm;
export { VerifyEmailForm };
