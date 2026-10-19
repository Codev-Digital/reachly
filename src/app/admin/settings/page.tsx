'use client';

import { motion } from 'framer-motion';
import FormInput from '@/components/FormInput';

const DARK_LABEL = 'font-sans font-normal text-sm leading-normal text-[#F9F6F2]';
const DARK_INPUT =
  'bg-[#0C0C0C] border-[rgba(200,169,126,0.3)] rounded-lg font-sans text-sm text-[#F9F6F2] focus:border-[#C8A97E]';

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
            <FormInput
              label="Platform Name"
              type="text"
              defaultValue="Reachly"
              labelClassName={DARK_LABEL}
              className={DARK_INPUT}
            />
            <FormInput
              label="Admin Email"
              type="email"
              defaultValue="admin@reachly.com"
              labelClassName={DARK_LABEL}
              className={DARK_INPUT}
            />
          </div>
        </div>
        
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5">
          <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-4">Fee Settings</h3>
          <div className="space-y-4">
            <FormInput
              label="Platform Fee (%)"
              type="number"
              defaultValue="10"
              labelClassName={DARK_LABEL}
              className={DARK_INPUT}
            />
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
