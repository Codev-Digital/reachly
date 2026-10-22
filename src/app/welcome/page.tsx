"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState, useRef } from "react";
import LoadingAnimation from "@/components/LoadingAnimation";
import WelcomeModal from "@/components/WelcomeModal";
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
        try {
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
  }, [status, redirected, router, changing]);

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
    <div className="relative min-h-screen bg-white overflow-hidden">
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
