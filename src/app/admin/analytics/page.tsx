'use client';

import { motion } from 'framer-motion';


const AnalyticsPage = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-[#F9F6F2]">Analytics</h2>
      </div>
      
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
      >
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5">
          <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-4">Revenue Overview</h3>
          <div className="h-48 bg-gradient-to-t from-[rgba(200,169,126,0.15)] to-transparent rounded-xl relative overflow-hidden flex items-end">
            <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="adminChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C8A97E" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#C8A97E" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 130 Q30 110 60 100 T120 80 T180 90 T240 70 T300 85 T360 60 T420 75 T500 50 L500 180 L0 180 Z"
                fill="url(#adminChartGradient)"
              />
              <path
                d="M0 130 Q30 110 60 100 T120 80 T180 90 T240 70 T300 85 T360 60 T420 75 T500 50"
                fill="none"
                stroke="#C8A97E"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5">
          <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-4">User Growth</h3>
          <div className="h-48 bg-gradient-to-t from-[rgba(200,169,126,0.15)] to-transparent rounded-xl relative overflow-hidden flex items-end">
            <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="adminUserChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C8A97E" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#C8A97E" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 150 Q30 140 60 130 T120 110 T180 100 T240 90 T300 70 T360 50 T420 40 T500 30 L500 180 L0 180 Z"
                fill="url(#adminUserChartGradient)"
              />
              <path
                d="M0 150 Q30 140 60 130 T120 110 T180 100 T240 90 T300 70 T360 50 T420 40 T500 30"
                fill="none"
                stroke="#C8A97E"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsPage;
