"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingAnimation from "@/components/LoadingAnimation";
import OnboardingNavbar from "@/components/OnboardingNavbar";
import { useApprovalRefresh } from "@/lib/useApprovalRefresh";
import { safeBookingReturnTo } from "@/lib/postAuthRoute";

export default function UserPendingApprovalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeBookingReturnTo(searchParams.get("returnTo"));
  const [loading, setLoading] = useState(true);
  const { refresh, checking } = useApprovalRefresh();
  const [stillPending, setStillPending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        const ref = new URLSearchParams(window.location.search).get("ref");
        if (ref) {
          await fetch("/api/user/update-onboarding-step", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ step: 0, ref }),
          });
        }
        if (data.user?.approvalStatus === "approved" || data.user?.approvalStatus === "rejected") {
          if (await refresh(returnTo)) return;
        }

        if (data.user?.hasCreatorProfile) {
          router.push("/creators/pending-approval");
          return;
        }

        // No (or incomplete) request yet → collect the required info first
        const reqRes = await fetch("/api/user-approval-request");
        const { request } = reqRes.ok ? await reqRes.json() : { request: null };
        if (!request?.phone) {
          router.replace("/user-onboarding");
          return;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router, refresh, returnTo]);

  if (loading) return <LoadingAnimation />;

  return (
    <div className="min-h-screen bg-[#F7F7FA] flex flex-col justify-between">
      <OnboardingNavbar />

      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white border border-gray-200/80 rounded-3xl p-8 sm:p-12 text-center max-w-2xl w-full shadow-sm">
          <div className="mx-auto w-20 h-20 rounded-full bg-[#EEF2FF] flex items-center justify-center mb-8 shadow-xs">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0012FF"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="font-anton text-2xl sm:text-3xl font-normal text-gray-950 mb-4 tracking-wide uppercase">
            Your Request Is Sent!
          </h1>

          <p className="font-sans text-gray-500 text-sm sm:text-base font-medium mb-8 leading-relaxed max-w-lg mx-auto">
            Thank you for choosing Reachly. Your normal user request has been
            sent to the admin team and is now waiting for approval.
          </p>

          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0012FF"
                  strokeWidth="2.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  What Happens Next?
                </h3>
                <ul className="space-y-2 text-xs font-bold text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-[#0012FF]">•</span>
                    The admin team will review your request.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0012FF]">•</span>
                    Once approved, your account will automatically unlock the
                    user dashboard.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0012FF]">•</span>
                    Refresh this page anytime to re-check your approval status.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={async () => setStillPending(!(await refresh(returnTo)))}
            disabled={checking}
            className="w-full bg-[#0012FF] text-white hover:bg-[#0010d0] font-bold py-2.5 px-8 rounded-full text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            {checking ? "Checking..." : "Refresh Status"}
          </button>
          {stillPending && !checking && (
            <p className="mt-3 text-xs font-semibold text-gray-400">Still waiting for admin approval.</p>
          )}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs font-bold text-gray-400 select-none">
        &copy; {new Date().getFullYear()} Reachly. All rights reserved.
      </footer>
    </div>
  );
}
