'use client';

import { motion } from 'framer-motion';

const ReviewsPage = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-[#F9F6F2]">Reviews</h2>
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {[
          { user: 'Mariam Hussain', creator: 'Ahad Raza Mir', rating: 5, comment: 'Amazing session!', date: '2025-06-28' },
          { user: 'Sara Ahmed', creator: 'Mahira Khan', rating: 5, comment: 'Very helpful.', date: '2025-06-28' },
        ].map((review, index) => (
          <div key={index} className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src="/ahad raza mir.png" alt="User" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-sans text-sm text-[#F9F6F2]">{review.user}</p>
                <p className="font-sans text-xs text-[#F9F6F2] opacity-60">for {review.creator}</p>
              </div>
              <div className="ml-auto">
                <div className="flex gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#C8A97E">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="font-sans text-sm text-[#F9F6F2] opacity-80">{review.comment}</p>
            <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mt-2">{review.date}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ReviewsPage;
