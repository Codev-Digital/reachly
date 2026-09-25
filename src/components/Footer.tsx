import Image from "next/image";
import Link from "next/link";
import { Camera, Globe2, Music2, Pin, Play } from "lucide-react";

const platformLinks = [
  { name: "Explore", href: "/explore-creators" },
  { name: "How it Works", href: "/#how-it-works" },
  { name: "For Creators", href: "/for-creators" },
  { name: "Pricing", href: "/#pricing" },
];

const companyLinks = [
  { name: "About", href: "/about" },
  //   { name: 'Shipping Policy', href: '/service-policy' },
  { name: "Careers", href: "/about" },
  { name: "Press", href: "/about" },
];

const supportLinks = [
  { name: "Contact Support", href: "/contact-support" },
  { name: "FAQ", href: "/#faq" },
  { name: "Guidelines", href: "/terms-and-conditions" },
];

const legalLinks = [
  { name: "Term & Conditions", href: "/terms-and-conditions" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Return/Refund Policy", href: "/refund-policy" },
  { name: "Shipping Policy", href: "/service-policy" },
  { name: "Cancellation Policy", href: "/cancellation-policy" },
];

function FooterLinks({ links }: { links: { name: string; href: string }[] }) {
  return (
    <ul className="space-y-3">
      {links.map((item) => (
        <li key={item.name}>
          <Link
            href={item.href}
            className="font-sans text-sm text-white/55 transition-colors hover:text-white"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      <div
        className="relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/new-bg-image1.png')" }}
      >
        <div className="absolute inset-0 bg-[#050d2e]/30" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-14 sm:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <Image
                  src="/assets/logo.png"
                  alt="Reachly Logo"
                  width={110}
                  height={40}
                  className="shrink-0"
                  priority
                />
              </div>
              <p className="mb-8 max-w-[220px] font-sans text-sm leading-relaxed text-white/60">
                Pakistan&apos;s premier creator booking platform
              </p>
              <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-white/50">
                Follow us on:
              </p>
              <div className="flex items-center gap-2.5">
                {[
                  { name: "Facebook", icon: Globe2 },
                  { name: "Instagram", icon: Camera },
                  { name: "Pinterest", icon: Pin },
                  { name: "YouTube", icon: Play },
                  { name: "TikTok", icon: Music2 },
                ].map(({ name, icon: Icon }) => (
                  <Link
                    key={name}
                    href="#"
                    aria-label={name}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                  >
                    <Icon
                      className="h-4 w-4"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-5 font-sans text-sm font-semibold text-white">
                Platform
              </h4>
              <FooterLinks links={platformLinks} />
            </div>
            <div>
              <h4 className="mb-5 font-sans text-sm font-semibold text-white">
                Company
              </h4>
              <FooterLinks links={companyLinks} />
            </div>
            <div>
              <h4 className="mb-5 font-sans text-sm font-semibold text-white">
                Support
              </h4>
              <FooterLinks links={supportLinks} />
            </div>
            <div>
              <h4 className="mb-5 font-sans text-sm font-semibold text-white">
                Legal
              </h4>
              <FooterLinks links={legalLinks} />
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10" />
        <div className="relative z-10 px-6 py-4 sm:px-8">
          <p className="text-center font-sans text-xs text-white/40">
            © 2026 Reachly. All rights reserved.{" "}
            <Link
              href="/terms-and-conditions"
              className="underline hover:text-white"
            >
              Term &amp; Conditions
            </Link>
            {" · "}
            <Link href="/privacy-policy" className="underline hover:text-white">
              Privacy Policy
            </Link>
            {" · "}
            <Link href="/refund-policy" className="underline hover:text-white">
              Return/Refund Policy
            </Link>
            {" · "}
            <Link href="/service-policy" className="underline hover:text-white">
              Shipping Policy
            </Link>
            {" · "}
            <Link
              href="/cancellation-policy"
              className="underline hover:text-white"
            >
              Cancellation Policy
            </Link>
          </p>
          <p className="mt-2 text-center font-sans text-[11px] tracking-wide text-white/30">
            Powered by{" "}
            <span className="font-medium tracking-wider text-white/50">
              Codev Digital
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
