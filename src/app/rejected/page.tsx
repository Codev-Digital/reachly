"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingAnimation from "@/components/LoadingAnimation";
import OnboardingNavbar from "@/components/OnboardingNavbar";

export default function RejectedPage() {
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [meRes, reqRes] = await Promise.all([fetch("/api/user/me"), fetch("/api/user-approval-request")]);
        if (meRes.ok) setMe((await meRes.json()).user);
        if (reqRes.ok) setReason((await reqRes.json()).request?.rejectionReason || "");
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingAnimation />;

  const params = new URLSearchParams({
    fullName: me?.name || "",
    email: me?.email || "",
    subject: "Account rejected",
  });

  return (
    <div className="min-h-screen bg-[#F7F7FA] flex flex-col justify-between">
      <OnboardingNavbar />
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="bg-white border border-gray-200/80 rounded-3xl p-8 sm:p-12 text-center max-w-2xl w-full shadow-sm">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-8">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h1 className="font-anton text-2xl sm:text-3xl text-gray-950 mb-4 tracking-wide uppercase">
            Request Rejected
          </h1>
          <p className="font-sans text-gray-500 text-sm sm:text-base font-medium mb-6 leading-relaxed max-w-lg mx-auto">
            Unfortunately your account request was not approved. If you think this is a mistake,
            contact our support team and they will get in touch with the admin.
          </p>
          {reason && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-2xl p-4 mb-6">
              <span className="font-semibold">Reason:</span> {reason}
            </p>
          )}
          <Link
            href={`/contact-support?${params.toString()}`}
            className="inline-block w-full bg-[#0012FF] text-white hover:bg-[#0010d0] font-bold py-2.5 px-8 rounded-full text-xs transition-colors shadow-sm"
          >
            Contact Support
          </Link>
        </div>
      </div>
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs font-bold text-gray-400 select-none">
        &copy; {new Date().getFullYear()} Reachly. All rights reserved.
      </footer>
    </div>
  );
}
