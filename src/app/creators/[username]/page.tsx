'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import CreatorNavbar from '@/components/CreatorNavbar';
import Footer from '@/components/Footer';

export default function CreatorProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [creator, setCreator] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreator() {
      try {
        const res = await fetch(`/api/creators/${username}`);
        const data = await res.json();
        if (data.success) {
          setCreator(data.creator);
          setServices(data.sessions || []);
        }
      } catch (err) {
        console.error('Failed to fetch creator:', err);
      } finally {
        setLoading(false);
      }
    }
    if (username) fetchCreator();
  }, [username]);

  const reviews = [
    {
      name: 'Jordan L',
      role: 'Aspiring Fashion Blogger',
      text: 'My session with Ayesha completely changed how I approach content creation. She helped me find my unique style voice and gave me a content calendar that actually works. Worth every rupee!',
      rating: 5
    },
    {
      name: 'Jordan L',
      role: 'Aspiring Fashion Blogger',
      text: 'My session with Ayesha completely changed how I approach content creation. She helped me find my unique style voice and gave me a content calendar that actually works. Worth every rupee!',
      rating: 5
    },
    {
      name: 'Jordan L',
      role: 'Aspiring Fashion Blogger',
      text: 'My session with Ayesha completely changed how I approach content creation. She helped me find my unique style voice and gave me a content calendar that actually works. Worth every rupee!',
      rating: 5
    }
  ];

  const slots = ['Mon 2PM', 'Tue 3PM', 'Wed 10AM', 'Thu 4PM', 'Fri 11AM', 'Sat 1PM', 'Sun 3PM'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-[#F9F6F2] flex items-center justify-center">
        <p className="text-[#C8A97E] font-serif text-lg animate-pulse">Loading creator...</p>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-[#F9F6F2] flex items-center justify-center">
        <p className="font-serif text-lg">Creator not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#F9F6F2]">
      <CreatorNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Creator Header */}
        <section className="mb-16">
          <div className="flex flex-col lg:flex-row items-start gap-10">
            <div className="flex items-start gap-6">
              <img src={creator.profilePhoto} alt={creator.displayName} className="w-24 h-24 rounded-full border-2 border-[#C8A97E]" />
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2">{creator.displayName}</h1>
                <p className="text-white/70 text-sm mb-2">@{creator.username}</p>
                <div className="flex items-center gap-4 text-white/50 text-xs">
                  {creator.niches && creator.niches[0] && <span>✨ {creator.niches[0]}</span>}
                  <span>•</span>
                  {creator.niches && creator.niches[1] && <span>📸 {creator.niches[1]}</span>}
                </div>
              </div>
            </div>
            <div className="ml-auto">
              <button className="bg-[#C8A97E] text-[#0C0C0C] font-semibold font-sans px-6 py-2 rounded-full text-sm hover:opacity-90 transition-all">
                Book a Session
              </button>
            </div>
          </div>
        </section>



        {/* About Section */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-4">About</h2>
          <p className="text-white/70 text-sm mb-4">
            {creator.longBio || creator.shortBio}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {creator.niches && creator.niches.map((niche: string, idx: number) => (
              <span key={idx} className="bg-[rgba(200,169,126,0.2)] text-[#C8A97E] px-4 py-1 rounded-full text-xs font-semibold border border-[rgba(200,169,126,0.3)] capitalize">{niche}</span>
            ))}
          </div>
        </section>

        {/* Available Sessions Section */}
        <section className="mb-16">
          <h2 className="font-serif text-4xl font-bold mb-10">Available <span className="text-[#C8A97E]">Sessions</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-[#111111] border border-[rgba(200,169,126,0.3)] rounded-xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-full bg-[rgba(200,169,126,0.05)] flex items-center justify-center border border-[rgba(200,169,126,0.3)]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                      <rect x="2" y="10" width="20" height="10" rx="2" ry="2" />
                      <line x1="6" y1="2" x2="6" y2="4" />
                      <line x1="18" y1="2" x2="18" y2="4" />
                    </svg>
                  </div>
                  <span className="bg-[rgba(200,169,126,0.2)] text-[#C8A97E] px-4 py-1 rounded-full text-xs font-semibold">
                    {service.duration}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">{service.title}</h3>
                <div className="text-[#C8A97E] text-3xl font-bold mb-4 font-serif">
                  PKR {service.price}
                </div>
                <div className="w-full h-px bg-[rgba(255,255,255,0.1)] mb-4"></div>
                <p className="text-white/80 text-base mb-4 leading-relaxed">{service.description}</p>
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12l2 2 4-4" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/creators/${username}/book-session`}
                  className="w-full bg-[#C8A97E] text-[#0C0C0C] font-bold font-sans px-6 py-3 rounded-full text-base hover:opacity-90 transition-all text-center block"
                >
                  Book This Session
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Next Available Slots */}
        <section className="mb-16">
          <h2 className="font-serif text-3xl font-bold mb-6"><span className="text-[#C8A97E]">Next</span> Available Slots</h2>
          <div className="flex flex-wrap gap-3 mb-8">
            {slots.map((slot, index) => (
              <button key={index} className="bg-[#141414] border border-[rgba(255,255,255,0.15)] px-4 py-2 rounded text-xs text-white/80 hover:border-[#C8A97E] transition-all">
                {slot}
              </button>
            ))}
          </div>

          {/* Rating Card */}
          <div className="bg-[#111111] border border-[rgba(200,169,126,0.3)] rounded-xl p-8 flex flex-col sm:flex-row items-center gap-10">
            <div className="text-center sm:w-auto">
              <div className="w-36 h-36 rounded-full bg-[rgba(200,169,126,0.05)] flex items-center justify-center border border-[rgba(200,169,126,0.3)]">
                <div>
                  <div className="font-serif text-5xl font-bold text-[#C8A97E]">4.9</div>
                  <div className="text-[#C8A97E] mt-2 mb-1 flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#C8A97E">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-white/60 text-sm">328 reviews</div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full border-l border-[rgba(255,255,255,0.1)] pl-10">
              {[5, 4, 3, 2, 1].map((star, i) => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <div className="text-sm text-white/70 w-6">{star}</div>
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#C8A97E">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="flex-1 h-0.5 bg-[rgba(255,255,255,0.08)] rounded">
                    <div className="h-full bg-[#C8A97E] rounded" style={{ width: star === 5 ? '85%' : star === 4 ? '25%' : star === 3 ? '15%' : star === 2 ? '10%' : '5%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="mb-16">
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div key={index} className="bg-[#111111] border border-[rgba(200,169,126,0.3)] rounded-xl p-8 flex gap-6 relative overflow-hidden">
                <div className="absolute top-6 right-6 text-[#C8A97E] opacity-30">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <img src="/merium in creators section.png" alt={review.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div>
                      <h3 className="font-serif text-base font-bold text-white">{review.name}</h3>
                      <p className="text-white/50 text-xs">{review.role}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-8 bg-[rgba(200,169,126,0.1)] rounded flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#C8A97E">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <p className="text-white/80 text-base leading-relaxed">{review.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Follow Kainat */}
        <section className="mb-10">
          <div className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">Follow {creator.displayName}</h2>
              <p className="text-white/70 text-xs mb-4">Follow {creator.displayName} on social media for updates, behind the scenes and more.</p>
            </div>
            <div className="flex gap-3">
              {creator.socialLinks?.instagram && (
                <a href={creator.socialLinks.instagram} target="_blank" rel="noreferrer" className="bg-[rgba(200,169,126,0.2)] text-[#C8A97E] px-4 py-2 rounded-full text-xs font-semibold border border-[rgba(200,169,126,0.3)]">
                  Instagram
                </a>
              )}
              {creator.socialLinks?.tiktok && (
                <a href={creator.socialLinks.tiktok} target="_blank" rel="noreferrer" className="bg-[rgba(200,169,126,0.2)] text-[#C8A97E] px-4 py-2 rounded-full text-xs font-semibold border border-[rgba(200,169,126,0.3)]">
                  TikTok
                </a>
              )}
              {creator.socialLinks?.youtube && (
                <a href={creator.socialLinks.youtube} target="_blank" rel="noreferrer" className="bg-[rgba(200,169,126,0.2)] text-[#C8A97E] px-4 py-2 rounded-full text-xs font-semibold border border-[rgba(200,169,126,0.3)]">
                  YouTube
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
