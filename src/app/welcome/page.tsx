"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState, useRef } from "react";
import LoadingAnimation from "@/components/LoadingAnimation";
import WelcomeModal from "@/components/WelcomeModal";
import { safeBookingReturnTo } from "@/lib/postAuthRoute";

function WelcomeContent() {
  const router = useRouter();
  const { status, update } = useSession();
  const [redirected, setRedirected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const returnTo = safeBookingReturnTo(searchParams.get("returnTo"));
  const hasSelected = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && !redirected) {
      const redirectUser = async () => {
        try {
          const res = await fetch("/api/user/me");
          if (res.ok) {
            const data = await res.json();
            setUserData(data);

            const user = data.user;
            const bookingReturnTo = returnTo || safeBookingReturnTo(
              typeof window !== "undefined" ? localStorage.getItem("reachly_booking_return_to") : null,
            );
            const isAdmin = [
              "admin@reachly.com",
              "abdullahgotaccess@gmail.com",
            ].includes(user?.email);

            if (isAdmin) {
              setRedirected(true);
              hasSelected.current = true;
              router.replace("/admin/dashboard");
              return;
            }

            if (user?.approvalStatus === "approved" || user?.approvalStatus === "active") {
              setRedirected(true);
              hasSelected.current = true;
              if (bookingReturnTo) localStorage.removeItem("reachly_booking_return_to");
              router.replace(bookingReturnTo || (user.hasCreatorProfile ? "/creators/dashboard" : "/user/dashboard"));
              return;
            }

            if (user?.approvalStatus === "pending") {
              setRedirected(true);
              hasSelected.current = true;
              router.replace(
                user.hasCreatorProfile
                  ? bookingReturnTo
                    ? `/creators/pending-approval?returnTo=${encodeURIComponent(bookingReturnTo)}`
                    : "/creators/pending-approval"
                  : bookingReturnTo
                    ? `/user/pending-approval?returnTo=${encodeURIComponent(bookingReturnTo)}`
                    : "/user/pending-approval",
              );
              return;
            }

            if (user?.approvalStatus === "rejected") {
              setRedirected(true);
              hasSelected.current = true;
              router.replace("/rejected");
              return;
            }

            if (user?.approvalStatus === "suspended") {
              setRedirected(true);
              hasSelected.current = true;
              router.replace("/suspended");
              return;
            }

            if (user?.approvalStatus === "deleted") {
              setRedirected(true);
              hasSelected.current = true;
              router.replace("/account-deleted");
              return;
            }

            // For unapproved users (approvalStatus === 'none'), let them stay on the welcome screen
            // to choose their path without any automatic redirect or page reload.
          }
        } catch (err) {
          console.error("Error fetching user data in welcome page:", err);
        } finally {
          setIsLoading(false);
        }
      };
      redirectUser();
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, redirected, router, returnTo]);

  const handleChoose = async (selected: "user" | "creator") => {
    if (hasSelected.current) return;
    hasSelected.current = true;
    setIsLoadingButton(true);

    try {
      await fetch("/api/user/update-onboarding-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: selected === "creator" ? 1 : 0,
          ref,
          force: true,
        }),
      });
      await update();
      router.push(
        selected === "creator"
          ? "/creator-onboarding/step-1"
          : "/user-onboarding",
      );
    } catch (error) {
      console.error("Error updating onboarding step:", error);
      router.push(
        selected === "creator"
          ? "/creator-onboarding/step-1"
          : "/user-onboarding",
      );
    } finally {
      setIsLoadingButton(false);
    }
  };

  if (isLoading || status === "loading") {
    return <LoadingAnimation />;
  }

  const firstName =
    (userData?.user?.name || "").trim().split(" ")[0] || "there";

  return (
    <div className="min-h-screen w-full bg-white">
      <WelcomeModal
        firstName={firstName}
        onChoose={handleChoose}
        loading={isLoadingButton}
      />
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <WelcomeContent />
    </Suspense>
  );
}
