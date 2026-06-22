'use client';

import { motion } from 'framer-motion';

const CreatorsPage = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-[#F9F6F2]">Creators</h2>
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,20,0.5)]">
                {['Name', 'Username', 'Category', 'Status'].map((header) => (
                  <th
                    key={header}
                    className="text-left py-4 px-5 font-sans text-sm font-semibold text-[#C8A97E]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Ahad Raza Mir', username: 'ahadrazamir', category: 'Actor', status: 'Active' },
                { name: 'Mahira Khan', username: 'mahirakhan', category: 'Actor', status: 'Active' },
                { name: 'Humayun Saeed', username: 'humayunsaeed', category: 'Actor', status: 'Active' },
              ].map((creator, index) => (
                <tr key={index} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(200,169,126,0.05)]">
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{creator.name}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{creator.username}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{creator.category}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#C8A97E]">{creator.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreatorsPage;
