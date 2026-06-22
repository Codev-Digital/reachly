'use client';

import { motion } from 'framer-motion';

const PaymentsPage = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-[#F9F6F2]">Payments</h2>
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
                {['Transaction ID', 'User', 'Creator', 'Amount', 'Date', 'Status'].map((header) => (
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
                { id: 'TXN12345', user: 'Mariam Hussain', creator: 'Ahad Raza Mir', amount: 'PKR 900', date: '2025-06-28', status: 'Completed' },
                { id: 'TXN12346', user: 'Sara Ahmed', creator: 'Mahira Khan', amount: 'PKR 1,200', date: '2025-06-28', status: 'Completed' },
              ].map((payment, index) => (
                <tr key={index} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(200,169,126,0.05)]">
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{payment.id}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{payment.user}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{payment.creator}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#C8A97E]">{payment.amount}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{payment.date}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#C8A97E]">{payment.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentsPage;
