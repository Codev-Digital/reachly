"use client";

import Link from "next/link";
import CreatorNavbar from "@/components/CreatorNavbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <CreatorNavbar />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src="/assets/new-bg-image.png"
          alt=""
          className="fixed inset-0 w-screen h-screen object-cover object-top -z-10"
        />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center mt-20">
          <p className="font-sans text-xs sm:text-sm text-white/80 tracking-widest uppercase mb-4">
            Reachly
          </p>
          <h1 className="font-anton text-5xl sm:text-7xl font-black text-white mb-6 leading-tight">
            About Us
          </h1>
          <h2 className="font-sans text-xl sm:text-2xl text-white/90 mb-8 font-light">
            Something amazing is coming soon. Stay tuned!
          </h2>
          <div className="flex items-center justify-center">
            <Link
              href="/"
              className="bg-white text-[#001F7D] font-sans font-semibold px-8 py-3 rounded-full text-sm hover:bg-white/90 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}