import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0C0C0C] border-t border-[rgba(255,255,255,0.08)] pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-serif text-2xl font-bold text-[#C8A97E]">Reachly</div>
            </div>
            <p className="font-sans text-[#F9F6F2] text-xs opacity-60 max-w-xs">
              Connect with your favorite creators for 1-on-1 sessions.
            </p>
          </div>
          
          <div>
            <h4 className="font-sans text-xs font-semibold text-[#C8A97E] mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="font-sans text-xs text-[#F9F6F2] opacity-60 hover:opacity-100 transition-opacity">Home</Link></li>
              <li><Link href="#" className="font-sans text-xs text-[#F9F6F2] opacity-60 hover:opacity-100 transition-opacity">Search Creators</Link></li>
              <li><Link href="#" className="font-sans text-xs text-[#F9F6F2] opacity-60 hover:opacity-100 transition-opacity">For Creators</Link></li>
              <li><Link href="#" className="font-sans text-xs text-[#F9F6F2] opacity-60 hover:opacity-100 transition-opacity">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-xs font-semibold text-[#C8A97E] mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="font-sans text-xs text-[#F9F6F2] opacity-60 hover:opacity-100 transition-opacity">Help Center</Link></li>
              <li><Link href="#" className="font-sans text-xs text-[#F9F6F2] opacity-60 hover:opacity-100 transition-opacity">Contact Us</Link></li>
              <li><Link href="#" className="font-sans text-xs text-[#F9F6F2] opacity-60 hover:opacity-100 transition-opacity">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-xs font-semibold text-[#C8A97E] mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="font-sans text-xs text-[#F9F6F2] opacity-60 hover:opacity-100 transition-opacity">Terms of Service</Link></li>
              <li><Link href="#" className="font-sans text-xs text-[#F9F6F2] opacity-60 hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
              <li><Link href="#" className="font-sans text-xs text-[#F9F6F2] opacity-60 hover:opacity-100 transition-opacity">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.08)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[10px] text-[#F9F6F2] opacity-40">
            © 2026 Reachly. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="w-8 h-8 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center hover:border-[#C8A97E] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </Link>
            <Link href="#" className="w-8 h-8 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center hover:border-[#C8A97E] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </Link>
            <Link href="#" className="w-8 h-8 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center hover:border-[#C8A97E] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
