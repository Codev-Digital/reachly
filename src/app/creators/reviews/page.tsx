'use client';

import { useState } from 'react';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';

const reviews = [
  {
    id: 1,
    name: 'Miael Hamedh',
    avatar: '/merium.png',
    rating: 5,
    date: '1 May 2024',
    text: 'Areshia completely transformed how I think about my wardrobe. Her advice on colour palettes for South Asian skin tones was exactly what I needed. The shopping list she gave me saved me so much time and money. Already booked my next session!',
    hasReply: false,
  },
  {
    id: 2,
    name: 'Miael Hamedh',
    avatar: '/merium.png',
    rating: 5,
    date: '1 May 2024',
    text: 'Areshia completely transformed how I think about my wardrobe. Her advice on colour palettes for South Asian skin tones was exactly what I needed. The shopping list she gave me saved me so much time and money. Already booked my next session!...',
    hasReply: true,
    replyText: 'Hey! Just let me know if you want to book a follow-up analytics deep dive! I have a new framework that might be perfect for your channel.',
  },
  {
    id: 3,
    name: 'Miael Hamedh',
    avatar: '/merium.png',
    rating: 5,
    date: '1 May 2024',
    text: 'Areshia completely transformed how I think about my wardrobe. Her advice on colour palettes for South Asian skin tones was exactly what I needed. The shopping list she gave me saved me so much time and money. Already booked my next session!',
    hasReply: false,
  },
  {
    id: 4,
    name: 'Miael Hamedh',
    avatar: '/merium.png',
    rating: 4,
    date: '1 May 2024',
    text: 'Areshia completely transformed how I think about my wardrobe. Her advice on colour palettes for South Asian skin tones was exactly what I needed. The shopping list she gave me saved me so much time and money. Already booked my next session!...',
    hasReply: true,
    replyText: 'Hey! Just let me know if you want to book a follow-up analytics deep dive! I have a new framework that might be perfect for your channel.',
  },
  {
    id: 5,
    name: 'Miael Hamedh',
    avatar: '/merium.png',
    rating: 5,
    date: '1 May 2024',
    text: 'Areshia completely transformed how I think about my wardrobe. Her advice on colour palettes for South Asian skin tones was exactly what I needed. The shopping list she gave me saved me so much time and money. Already booked my next session!...',
    hasReply: false,
  },
  {
    id: 6,
    name: 'Miael Hamedh',
    avatar: '/merium.png',
    rating: 5,
    date: '1 May 2024',
    text: 'Areshia completely transformed how I think about my wardrobe. Her advice on colour palettes for South Asian skin tones was exactly what I needed. The shopping list she gave me saved me so much time and money. Already booked my next session!',
    hasReply: false,
  },
];

const ratingDistribution = [
  { stars: 5, percentage: 69, count: 79 },
  { stars: 4, percentage: 27, count: 4 },
  { stars: 3, percentage: 7, count: 1 },
  { stars: 2, percentage: 0, count: 0 },
  { stars: 1, percentage: 0, count: 0 },
];

export default function CreatorReviewsPage() {
  const [showReportModal, setShowReportModal] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
  const StarRating = ({ rating, maxStars = 5 }: { rating: number; maxStars?: number }) => {
    return (
      
      <div className="flex gap-1">
        {Array.from({ length: maxStars }).map((_, index) => (
          <svg
            key={index}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={index < rating ? '#C8A97E' : 'rgba(255, 255, 255, 0.1)'}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
      <CreatorNavbar />
   
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Find a booking"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-full px-5 py-3 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none focus:border-[#C8A97E]"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] px-5 py-2 rounded-full text-sm font-sans text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Booking Link
                </button>
                <button className="w-10 h-10 rounded-full bg-[#141414] border border-[rgba(200,169,126,0.3)] flex items-center justify-center text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C8A97E]">
                  <img src="/ahad raza mir.png" alt="Ahad" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
        
        <div className="flex gap-8">
          <CreatorSidebar />

          <main className="flex-1">
            <div className="mb-7">
              <div className="flex items-center justify-between mb-2">
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#C8A97E]">Reviews & Ratings</h1>
                <div className="flex items-center gap-3">
                  <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-5 py-3 rounded-xl text-sm font-sans">
                    Mark all as read
                  </button>
                  <select className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-5 py-3 rounded-xl text-sm font-sans outline-none">
                    <option>All Types</option>
                  </select>
                </div>
              </div>
              <p className="font-sans text-base text-[#F9F6F2]">See what followers are saying about your sessions.</p>
            </div>

            {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-6">
  {/* Rating Stats Card */}
  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 md:col-span-2 text-center">
    <div className="text-[#C8A97E] font-serif text-5xl md:text-6xl font-bold mb-3">
      4.6
    </div>

    <div className="flex justify-center mb-2 gap-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={i < 4 ? "#C8A97E" : "rgba(255, 255, 255, 0.15)"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>

    <div className="font-sans text-[#F9F6F2] text-base">
      328 reviews
    </div>
  </div>

  {/* Rating Distribution */}
  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 md:col-span-3">
    <div className="space-y-3">
      {ratingDistribution.map((item) => (
        <div key={item.stars} className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 w-12">
            <span className="font-sans text-lg text-[#F9F6F2]">
              {item.stars}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#C8A97E">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          <div className="flex-1 h-2.5 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C8A97E] rounded-full transition-all"
              style={{ width: `${item.percentage}%` }}
            />
          </div>

          <div className="w-12 text-right font-sans text-base text-[#F9F6F2]">
            {item.count.toString().padStart(2, "0")}
          </div>

          <div className="w-10 text-right font-sans text-base text-[#F9F6F2]">
            {item.percentage}%
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

            {/* Notification Banner */}
            <div className="bg-[rgba(200,169,126,0.08)] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 flex items-start gap-4 mb-7">
              <div className="flex-shrink-0 w-12 h-12 bg-[rgba(200,169,126,0.15)] rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-bold text-[#C8A97E] mb-1">
                  Your rating is 4.6 stars, top 10% in your category
                </h3>
                <p className="font-sans text-base text-[#F9F6F2] opacity-70">
                  You have received 15 reviews with an average of 4.6 stars. Keep responding to reviews to maintain your strong reputation.
                </p>
              </div>
            </div>

            {/* Rating Filter Pills */}
            <div className="flex items-center gap-3 mb-7 flex-wrap">
              <button className="bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border border-[rgba(200,169,126,0.3)] px-5 py-3 rounded-xl text-base font-sans">
                All Ratings
              </button>
              {[5, 4, 3, 2, 1].map((stars) => (
                <button
                  key={stars}
                  className="bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] border border-[rgba(200,169,126,0.2)] px-5 py-3 rounded-xl text-base font-sans flex items-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#C8A97E">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {stars}
                </button>
              ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif text-base font-semibold text-[#F9F6F2]">
                            {review.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                        <div className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-3">
                          {review.date}
                        </div>
                        <p className="font-sans text-sm text-[#F9F6F2] leading-relaxed mb-4">
                          {review.text}
                        </p>

                        {review.hasReply && (
                          <div className="bg-[rgba(200,169,126,0.05)] border border-[rgba(200,169,126,0.15)] rounded-xl p-4">
                            <p className="font-sans text-sm text-[#F9F6F2]">
                              {review.replyText}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="text-[#C8A97E] font-sans text-sm flex items-center gap-2 hover:opacity-80">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                      Reply to review
                    </button>
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="text-[#F9F6F2] opacity-60 font-sans text-sm flex items-center gap-2 hover:opacity-100"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Report review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Report Review Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-8 w-full max-w-lg">
            <h2 className="font-serif text-2xl font-bold text-[#F9F6F2] mb-3">Report Review</h2>
            <p className="font-sans text-base text-[#F9F6F2] opacity-70 mb-8">
              Are you sure you want to report this review? Tell us your motivation team will review it within 24 hours.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-8 py-4 rounded-full text-base font-sans hover:opacity-80"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] text-[#f87171] px-8 py-4 rounded-full text-base font-sans hover:opacity-80"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
