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
  const { status } = useSession();
  const [redirected, setRedirected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [selected, setSelected] = useState<"user" | "creator" | null>(null);
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
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
            isAdmin: ["admin@reachly.com", "abdullahgotaccess@gmail.com"].includes(data.user.email),
          });
          if (target !== "/welcome") {
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

  const handleNext = async () => {
    if (!selected || hasSelected.current) return;
    hasSelected.current = true;
    setIsLoadingButton(true);

    try {
      await fetch("/api/user/update-onboarding-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: selected === "creator" ? 1 : 0, ref }),
      });
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none select-none" aria-hidden="true">
        <Home />
        <div className="fixed top-[88px] inset-x-0 z-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-2 rounded-md bg-[#e6f4ea] text-[#137333] text-sm font-medium px-4 py-2.5 shadow-sm">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" fill="#137333" />
              <path
                d="M8 12.5l2.5 2.5L16 9.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Your account has been created.
          </div>
        </div>
      </div>

      {ready && (
        <WelcomeModal
          firstName={firstName}
          selected={selected}
          onSelect={setSelected}
          onNext={handleNext}
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
