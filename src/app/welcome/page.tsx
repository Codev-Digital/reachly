"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState, useRef } from "react";
import LoadingAnimation from "@/components/LoadingAnimation";
import WelcomeModal from "@/components/WelcomeModal";
import Home from "../page";
import { postAuthRoute } from "@/lib/postAuthRoute";

function WelcomeContent() {
  const router = useRouter();
  const { status, update } = useSession();
  const [redirected, setRedirected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const changing = searchParams.get("change") === "1";
  console.log("Referral Code in Welcome Page:", ref); // Log the referral code to the console
  const hasSelected = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (status === "authenticated" && !redirected) {
      const redirectUser = async () => {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setUserData(data);

          const target = postAuthRoute({
            ...data.user,
            isAdmin: [
              "admin@reachly.com",
              "abdullahgotaccess@gmail.com",
            ].includes(data.user.email),
          });
          const canChange =
            changing &&
            data.user.approvalStatus === "none" &&
            (data.user.onboardingStep || 0) <= 1;
          if (target !== "/welcome" && !canChange) {
            setRedirected(true);
            hasSelected.current = true;
            router.replace(target);
            return;
          }
        }
        setIsLoading(false);
      };
      redirectUser();
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, redirected, router]);

  // The homepage behind the modal mounts under the loader. We keep the loader
  // up until its hero background has painted, so the modal never opens on top
  // of a white / half-rendered page.
  const [bgReady, setBgReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const start = Date.now();
    const check = () => {
      if (cancelled) return;
      const img = document.querySelector(
        'img[src*="new-bg-image"]',
      ) as HTMLImageElement | null;
      const loaded = !!img && img.complete && img.naturalWidth > 0;
      const elapsed = Date.now() - start;
      // 800ms lets the hero entrance animation finish behind the loader.
      if ((loaded && elapsed >= 800) || elapsed >= 3000) {
        setBgReady(true);
      } else {
        timer = setTimeout(check, 100);
      }
    };
    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const ready = !isLoading && status !== "loading" && bgReady;

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setShowLoader(false), 500);
    return () => clearTimeout(t);
  }, [ready]);

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
      await update(); // refresh the session token so the middleware sees the new state
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

  const firstName =
    (userData?.user?.name || "").trim().split(" ")[0] || "there";

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {ready && (
        <WelcomeModal
          firstName={firstName}
          onChoose={handleChoose}
          loading={isLoadingButton}
        />
      )}

      {showLoader && (
        <div
          className={`fixed inset-0 z-[9999] transition-opacity duration-500 ease-out ${
            ready ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <LoadingAnimation />
        </div>
      )}
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
