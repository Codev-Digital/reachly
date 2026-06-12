import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[##808080]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold">
                <span className="text-[#C8A97E]">Reach</span>
                <span className="text-white">ly</span>
              </h2>
            </div>
            <p className="font-sans text-sm text-white/80 mb-8 max-w-xs">
              Pakistan's premier creator booking platform
            </p>

            <div>
              <h4 className="font-sans text-base font-semibold text-[#C8A97E] mb-3">
                Follow us on:
              </h4>

              <div className="flex items-center gap-3">
                <Link href="#" className="text-white hover:text-[#C8A97E] transition-colors">
                  {/* Facebook */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </Link>

                <Link href="#" className="text-white hover:text-[#C8A97E] transition-colors">
                  {/* Twitter */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </Link>

                <Link href="#" className="text-white hover:text-[#C8A97E] transition-colors">
                  {/* Instagram */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </Link>

                <Link href="#" className="text-white hover:text-[#C8A97E] transition-colors">
                  {/* YouTube */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  </svg>
                </Link>

                <Link href="#" className="text-white hover:text-[#C8A97E] transition-colors">
                  {/* TikTok */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Other columns unchanged */}
          <div>
            <h4 className="font-serif text-xl font-bold text-[#C8A97E] mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">Explore</Link></li>
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">How it Works</Link></li>
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">For Creators</Link></li>
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl font-bold text-[#C8A97E] mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">About</Link></li>
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">Blog</Link></li>
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">Careers</Link></li>
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl font-bold text-[#C8A97E] mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">Help Center</Link></li>
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">Contact</Link></li>
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">FAQ</Link></li>
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">Guidelines</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl font-bold text-[#C8A97E] mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">Terms</Link></li>
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">Privacy</Link></li>
              <li><Link href="#" className="text-white hover:text-[#C8A97E] text-sm">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom strip (fixed) */}
      <div className="bg-[#000] border-t border-[#808080] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-white text-center">
            © 2026 Reachly. Registered in England and Wales. VAT No. [to add]. Terms of Service · Privacy Policy · Cookie Policy · Modern Slavery Statement
          </p>
        </div>
      </div>
    </footer>
  );
}