'use client';

import { motion } from 'framer-motion';

const SettingsPage = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-[#F9F6F2]">Settings</h2>
      </div>
      
      <div className="space-y-6">
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5">
          <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-sm text-[#F9F6F2] mb-2">Platform Name</label>
              <input
                type="text"
                defaultValue="Reachly"
                className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 font-sans text-sm text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E]"
              />
            </div>
            <div>
              <label className="block font-sans text-sm text-[#F9F6F2] mb-2">Admin Email</label>
              <input
                type="email"
                defaultValue="admin@reachly.com"
                className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 font-sans text-sm text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E]"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5">
          <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-4">Fee Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-sm text-[#F9F6F2] mb-2">Platform Fee (%)</label>
              <input
                type="number"
                defaultValue="10"
                className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 font-sans text-sm text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E]"
              />
            </div>
          </div>
        </div>
        
        <button className="bg-[#C8A97E] text-[#0C0C0C] px-6 py-3 rounded-full font-serif font-semibold hover:opacity-90 transition-opacity">
          Save Changes
        </button>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
