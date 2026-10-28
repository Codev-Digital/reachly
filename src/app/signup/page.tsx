"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { signUp } from "@/lib/auth-client";
import { User, Mail } from "lucide-react";
import FormInput, { FormError } from "@/components/FormInput";
import { isValidEmail } from "@/lib/validators";
import AuthLayout from "@/components/auth/AuthLayout";
import { safeBookingReturnTo } from "@/lib/postAuthRoute";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const bookingReturnTo = safeBookingReturnTo(searchParams.get("callbackUrl"));
  console.log("Referral Code:", ref); // Log the referral code to the console
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    ref: ref || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNameError("");
    setEmailError("");

    // Client-side checks so obvious mistakes never hit the server
    let hasError = false;
    if (!formData.name.trim()) {
      setNameError("Please enter your full name.");
      hasError = true;
    }
    if (!formData.email.trim()) {
      setEmailError("Please enter your email address.");
      hasError = true;
    } else if (!isValidEmail(formData.email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);

    try {
      const res = await signUp(formData.name, formData.email, formData.ref);
      if (res.success) {
        localStorage.setItem("signupEmail", formData.email);
        if (bookingReturnTo) localStorage.setItem("reachly_booking_return_to", bookingReturnTo);
        router.push(
          `/verify-email?callbackUrl=${encodeURIComponent(signupCallbackWithRef)}`,
        );
      } else {
        // The API tells us which field the problem belongs to
        const message = res.error || "Something went wrong";
        if (res.field === "name") setNameError(message);
        else if (res.field === "email") setEmailError(message);
        else setError(message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    if (bookingReturnTo) localStorage.setItem("reachly_booking_return_to", bookingReturnTo);
    signIn("google", { callbackUrl: signupCallbackWithRef });
  };

  const callbackParams = new URLSearchParams();
  if (ref) callbackParams.set("ref", ref);
  if (bookingReturnTo) callbackParams.set("returnTo", bookingReturnTo);
  const callbackQuery = callbackParams.toString();
  const signupCallbackWithRef = `/welcome${callbackQuery ? `?${callbackQuery}` : ""}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "name" && nameError) setNameError("");
    if (e.target.name === "email" && emailError) setEmailError("");
  };

  return (
    <AuthLayout
      footer={(
        <p className="font-sans text-xs font-medium text-gray-500">
          Already have an account?{" "}
          <button
            type="button"
            className="cursor-pointer font-bold text-[#0012FF] hover:underline"
            onClick={() => router.push("/login")}
          >
            Sign in
          </button>
        </p>
      )}
    >
      <div>
        <div className="text-center mb-8">
          <h1 className="font-sans font-extrabold text-black text-3xl sm:text-4xl leading-tight tracking-tight mb-2">
            Create Account
          </h1>
          <p className="font-sans text-gray-400 text-sm">
            Join Reachly to book sessions or share your knowledge
          </p>
        </div>

        {error && <FormError className="mb-4">{error}</FormError>}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name */}
          <FormInput
            label="Full Name"
            type="text"
            name="name"
            autoComplete="name"
            required
            placeholder="Enter your full name"
            icon={<User className="w-4 h-4" />}
            value={formData.name}
            onChange={handleChange}
            error={nameError}
          />

          {/* Email Address */}
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="Enter your email"
            icon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={handleChange}
            error={emailError}
          />

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0012FF] hover:bg-[#000EB4] active:scale-[0.98] text-white font-sans font-bold py-3.5 px-6 rounded-2xl text-sm tracking-wide shadow-lg shadow-[#0012FF]/25 transition-all disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? "Creating account..." : "Create Account"}
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
          className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 px-4 font-sans text-gray-700 text-xs font-bold flex items-center justify-center gap-2.5 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <Image src="/google.svg" alt="Google" width={16} height={16} />
          )}
          {isGoogleLoading ? "Redirecting..." : "Sign up with Google"}
        </button>
      </div>
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={(
        <AuthLayout>
          <div className="animate-pulse text-center text-sm text-[#0012FF]">Loading...</div>
        </AuthLayout>
      )}
    >
      <SignupForm />
    </Suspense>
  );
}
