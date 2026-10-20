import Image from "next/image";
import Link from "next/link";

const platformLinks = [
  { name: "Explore", href: "/explore-creators" },
  { name: "How it Works", href: "/#how-it-works" },
  { name: "For Creators", href: "/for-creators" },
  { name: "Pricing", href: "/pricing" },
];

const companyLinks = [
  { name: "About", href: "/about" },
  //   { name: 'Shipping Policy', href: '/service-policy' },
  { name: "Careers", href: "/careers" },
  { name: "Press", href: "/press" },
];

const supportLinks = [
  { name: "Contact Support", href: "/contact-support" },
  { name: "FAQ", href: "/#faq" },
  { name: "Guidelines", href: "/guidelines" },
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
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Facebook */}
                <Link
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110"
                >
                  <svg className="h-4 w-4 sm:h-4.5 sm:w-4.5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M14.046 21.996v-8.125h2.727l.409-3.167h-3.136V8.685c0-.917.255-1.542 1.57-1.542h1.677V4.31c-.29-.039-1.288-.125-2.449-.125-2.423 0-4.082 1.479-4.082 4.196v2.323H7.5v3.167h2.762v8.125h3.784z" />
                  </svg>
                </Link>

                {/* Twitter / X */}
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110"
                >
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#FFB800]" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                  </svg>
                </Link>

                {/* Pinterest */}
                <Link
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110"
                >
                  <svg className="h-4 w-4 sm:h-4.5 sm:w-4.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="11" fill="#E60023" />
                    <path d="M12.2 6.5c-3.1 0-5.2 2.2-5.2 4.9 0 1.8 1 3.2 2.5 3.8.3.1.5 0 .6-.3.1-.2.2-.8.3-1 0-.2 0-.3-.2-.5-.6-.7-.9-1.6-.9-2.5 0-2 1.5-3.8 4-3.8 2.2 0 3.6 1.4 3.6 3.3 0 2.4-1.1 4.2-2.7 4.2-.9 0-1.6-.7-1.4-1.6.2-1.1.7-2.3.7-3.1 0-.7-.4-1.3-1.2-1.3-.9 0-1.7.9-1.7 2.2 0 .8.3 1.3.3 1.3s-1 4.3-1.2 5.1c-.3 1.5-.1 3.7 0 3.9 0 .1.2.2.3.1.1-.1 1.7-2.1 2.2-4.1.2-.7 1-3.9 1-3.9.3.6 1.2 1.1 2.2 1.1 2.8 0 4.8-2.6 4.8-5.8-.1-2.9-2.5-5.1-5.9-5.1z" fill="white" />
                  </svg>
                </Link>

                {/* Instagram */}
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110"
                >
                  <svg className="h-4 w-4 sm:h-4.5 sm:w-4.5" viewBox="0 0 24 24">
                    <defs>
                      <radialGradient id="footer-ig-grad" cx="30%" cy="107%" r="150%">
                        <stop offset="0%" stopColor="#fdf497" />
                        <stop offset="10%" stopColor="#fdf497" />
                        <stop offset="50%" stopColor="#fd5949" />
                        <stop offset="68%" stopColor="#d6249f" />
                        <stop offset="100%" stopColor="#285AEB" />
                      </radialGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#footer-ig-grad)" />
                    <circle cx="12" cy="12" r="4.2" fill="none" stroke="white" strokeWidth="1.8" />
                    <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
                  </svg>
                </Link>

                {/* YouTube */}
                <Link
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110"
                >
                  <svg className="h-4 w-4 sm:h-4.5 sm:w-4.5" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000" />
                    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff" />
                  </svg>
                </Link>

                {/* TikTok */}
                <Link
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110"
                >
                  <svg className="h-4 w-4 sm:h-4.5 sm:w-4.5" viewBox="0 0 24 24">
                    <path d="M16.6 5.82A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5 2.536 2.536 0 0 1-2.54-2.5 2.543 2.543 0 0 1 2.54-2.5c.37 0 .72.08 1.04.22V9.98a5.71 5.71 0 0 0-1.04-.1 5.674 5.674 0 0 0-5.67 5.62 5.674 5.674 0 0 0 5.67 5.63c3.14 0 5.69-2.51 5.69-5.63V7.97c1.35.95 3 1.51 4.79 1.53V6.37a5.534 5.534 0 0 1-3.68-1.55z" fill="#00F2FE" />
                    <path d="M17.4 6.62A4.278 4.278 0 0 1 16.34 3.8h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5 2.536 2.536 0 0 1-2.54-2.5 2.543 2.543 0 0 1 2.54-2.5c.37 0 .72.08 1.04.22V10.78a5.71 5.71 0 0 0-1.04-.1 5.674 5.674 0 0 0-5.67 5.62 5.674 5.674 0 0 0 5.67 5.63c3.14 0 5.69-2.51 5.69-5.63V8.77c1.35.95 3 1.51 4.79 1.53V7.17a5.534 5.534 0 0 1-3.68-1.55z" fill="#FE2C55" />
                    <path d="M17 6.22A4.278 4.278 0 0 1 15.94 3.4h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5 2.536 2.536 0 0 1-2.54-2.5 2.543 2.543 0 0 1 2.54-2.5c.37 0 .72.08 1.04.22V10.38a5.71 5.71 0 0 0-1.04-.1 5.674 5.674 0 0 0-5.67 5.62 5.674 5.674 0 0 0 5.67 5.63c3.14 0 5.69-2.51 5.69-5.63V8.37c1.35.95 3 1.51 4.79 1.53V6.77a5.534 5.534 0 0 1-3.68-1.55z" fill="#000000" />
                  </svg>
                </Link>
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
