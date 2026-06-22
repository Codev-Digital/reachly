'use client';

import { motion } from 'framer-motion';

const SupportPage = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-[#F9F6F2]">Support</h2>
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6"
      >
        <p className="font-sans text-sm text-[#F9F6F2] opacity-70">Support page coming soon...</p>
      </motion.div>
    </motion.div>
  );
};

export default SupportPage;