'use client';

import Link from 'next/link';
import CreatorNavbar from '@/components/CreatorNavbar';
import Footer from '@/components/Footer';


export default function AboutPage() {
  const stats = [
    { number: '500+', label: 'Verified Creators' },
    { number: '12k+', label: 'Sessions Completed' },
    { number: '50k+', label: 'Happy Users' },
    { number: '8', label: 'Categories' }
  ];

  const values = [
    {
      title: 'Access for All',
      description: 'We believe personalized mentorship should not be a luxury. Our pricing ranges from PKR 500 to PKR 5,000, making expert guidance accessible to students, job seekers, and dreamers alike.'
    },
    {
      title: 'Creator First',
      description: 'Creators are the heart of our platform. We offer the highest revenue share in Pakistan, weekly payouts, and dedicated support to ensure when creators thrive, everyone wins.'
    },
    {
      title: 'Trust and Safety',
      description: 'Every creator is identity-verified. Every payment is held in escrow. Your session is money-back guarantee. Trust is not optional, it is our foundation.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#F9F6F2]">
      <CreatorNavbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="text-[#C8A97E] text-xs font-sans uppercase tracking-widest mb-2">Our Story</div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
                About <span className="text-[#C8A97E]">Reachly</span>
              </h1>
              <p className="text-white/70 text-sm sm:text-base">
                We are building Pakistan's first and most trusted creator booking platform, <br /> connecting passionate learners with the creators who inspire them.
              </p>
            </div>
              <div className="relative h-48 sm:h-64 flex items-end justify-end">

          {/* Back image */}
          <img
            src="/merium-footer.png"
            alt="Merium"
            className="h-40 sm:h-56 object-contain absolute bottom-0 right-16 sm:right-40 z-0"
          />

          {/* Front image */}
          <img
            src="/sara khan.png"
            alt="Sara Khan"
            className="h-40 sm:h-56 object-contain relative z-10"
          />

        </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="w-full lg:w-1/2">
              <div className="relative">
                {/* Rotated border 1 */}
               <div className="absolute top-1/2 left-2 -translate-y-1/2 w-full h-full max-w-md border-2 border-[#C8A97E] z-0 transform rotate-15"></div>
                {/* Rotated border 2
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md border-2 border-[#C8A97E] rounded-xl z-0 transform -rotate-3 opacity-50"></div> */}
                {/* Main image */}
                <img src="merium.png" alt="Creator" className="w-full max-w-md relative z-10" />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
                Our <span className="text-[#C8A97E]">Mission</span>
              </h2>
              <p className="text-white/70 text-sm sm:text-base mb-4">
                Pakistan is home to millions of talented creators producing world-class content across fashion, tech, food, business, and more. Yet most of this talent remains untapped when it comes to direct, personalized knowledge sharing.
              </p>
              <p className="text-white/70 text-sm sm:text-base">
                Reachly was born from a simple belief: everyone deserves access to personalized guidance from people they admire, and creators deserve to be fairly compensated for their time and expertise. We are here to bridge that gap.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 text-center">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-[#C8A97E] mb-2">{stat.number}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              What <span className="text-[#C8A97E]">We Stand For</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
                <h3 className="font-serif text-xl font-bold mb-3 text-[#C8A97E]">{value.title}</h3>
                <p className="text-white/70 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-10">
          <div className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
                <span className="text-[#C8A97E]">Built in Pakistan</span>, for Pakistan
              </h2>
              <p className="text-white/70 text-sm mb-6">
                Reachly is proudly designed, developed, and operated from Lahore, Pakistan.<br /> We understand local payment methods, cultural nuances, and the unique challenges Pakistani creators and learners face.
              </p>
              <Link href="/creator-onboarding/step-1" className="inline-block bg-[rgba(200,169,126,0.2)] text-[#C8A97E] border border-[#C8A97E] font-sans font-semibold px-8 py-3 rounded-full text-sm hover:bg-[rgba(200,169,126,0.3)] transition-all">
                Get in Touch
              </Link>
            </div>
             <div className="relative h-48 sm:h-64 flex items-end justify-end">

          {/* Back image */}
          <img
            src="/merium-footer.png"
            alt="Merium"
            className="h-40 sm:h-56 object-contain absolute bottom-0 right-16 sm:right-40 z-0"
          />

          {/* Front image */}
          <img
            src="/sara khan.png"
            alt="Sara Khan"
            className="h-40 sm:h-56 object-contain relative z-10"
          />

        </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
