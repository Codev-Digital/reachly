import Link from 'next/link';
import Image from "next/image";
export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Main footer body with new-bg-image */}
      <div
        className="relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/new-bg-image1.png')" }}
      >
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-[#050d2e]/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

            {/* Brand column */}
            <div className="lg:col-span-2">
              {/* Logo */}
              {/* Logo */}
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/assets/logo.png"
                  alt="Reachly Logo"
                  width={110}
                  height={40}
                  className="shrink-0"
                  priority
                />

              </div>

              <p className="font-sans text-sm text-white/60 mb-8 max-w-[220px] leading-relaxed">
                Pakistan's premier creator booking platform
              </p>

              <div>
                <p className="font-sans text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
                  Follow us on:
                </p>
                <div className="flex items-center gap-2.5">
                  {/* Facebook */}
                  <Link href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-all">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </Link>
                  {/* Instagram */}
                  <Link href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-[#f09433] hover:to-[#bc1888] flex items-center justify-center transition-all">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
                    </svg>
                  </Link>
                  {/* Pinterest */}
                  <Link href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E60023] flex items-center justify-center transition-all">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                    </svg>
                  </Link>
                  {/* YouTube */}
                  <Link href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FF0000] flex items-center justify-center transition-all">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                      <polygon points="9.75,15.02 15.5,11.75 9.75,8.48 9.75,15.02" fill="#FF0000" />
                    </svg>
                  </Link>
                  {/* TikTok */}
                  <Link href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-black flex items-center justify-center transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1-.06z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-sans font-semibold text-white text-sm mb-5">Platform</h4>
              <ul className="space-y-3">
                {['Explore', 'How it Works', 'For Creators', 'Pricing'].map(item => (
                  <li key={item}>
                    <Link href="#" className="font-sans text-sm text-white/55 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-sans font-semibold text-white text-sm mb-5">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Press'].map(item => (
                  <li key={item}>
                    <Link href="#" className="font-sans text-sm text-white/55 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-sans font-semibold text-white text-sm mb-5">Support</h4>
              <ul className="space-y-3">
                {['Help Center', 'Contact', 'FAQ', 'Guidelines'].map(item => (
                  <li key={item}>
                    <Link href="#" className="font-sans text-sm text-white/55 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-sans font-semibold text-white text-sm mb-5">Legal</h4>
              <ul className="space-y-3">
                {['Terms', 'Privacy', 'Refund', 'Policy'].map(item => (
                  <li key={item}>
                    <Link href="#" className="font-sans text-sm text-white/55 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="relative z-10 border-t border-white/10" />

        {/* Bottom copyright bar */}
        <div className="relative z-10 py-4">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <p className="font-sans text-xs text-white/40 text-center">
              © 2026 Reachly. Registered in England and Wales. VAT No. [to add]. Terms of Service · Privacy Policy · Cookie Policy · Modern Slavery Statement
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}