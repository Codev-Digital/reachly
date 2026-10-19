"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingAnimation from "@/components/LoadingAnimation";
import OnboardingNavbar from "@/components/OnboardingNavbar";

const inputClass =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all";

export default function UserOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ phone: "", city: "", country: "", reason: "" });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user-approval-request");
        const { request } = res.ok ? await res.json() : { request: null };
        if (request?.phone) {
          router.replace("/user/pending-approval");
          return;
        }
      } catch {}
      setLoading(false);
    })();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/user-approval-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        window.location.href = "/user/pending-approval"; // full reload refreshes the session token
        return;
      }
      setError((await res.json()).error || "Something went wrong");
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingAnimation />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen bg-[#F7F7FA] flex flex-col justify-between">
      <OnboardingNavbar />
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200/80 rounded-3xl p-8 sm:p-12 max-w-xl w-full shadow-sm space-y-5"
        >
          <div className="text-center mb-2">
            <h1 className="font-anton text-2xl sm:text-3xl text-gray-950 uppercase tracking-wide mb-2">
              Tell us about you
            </h1>
            <p className="font-sans text-gray-500 text-sm">
              Share a few details so our team can approve your account.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input className={inputClass} type="tel" required value={form.phone} onChange={set("phone")} placeholder="+92 300 1234567" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input className={inputClass} required value={form.city} onChange={set("city")} placeholder="Lahore" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input className={inputClass} required value={form.country} onChange={set("country")} placeholder="Pakistan" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Why are you joining? (optional)</label>
            <textarea className={inputClass} rows={3} maxLength={500} value={form.reason} onChange={set("reason")} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0012FF] hover:bg-[#000EB4] text-white font-bold py-3 rounded-full text-sm transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit for approval"}
          </button>
        </form>
      </div>
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs font-bold text-gray-400 select-none">
        &copy; {new Date().getFullYear()} Reachly. All rights reserved.
      </footer>
    </div>
  );
}
