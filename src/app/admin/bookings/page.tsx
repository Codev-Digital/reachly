'use client';

import { motion } from 'framer-motion';

const BookingsPage = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-[#F9F6F2]">Bookings</h2>
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
                {['User', 'Creator', 'Session', 'Date', 'Status', 'Amount'].map((header) => (
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
                { user: 'Mariam Hussain', creator: 'Ahad Raza Mir', session: 'Style Consultation', date: '2025-06-28', status: 'Confirmed', amount: 'PKR 900' },
                { user: 'Sara Ahmed', creator: 'Mahira Khan', session: 'Confidence Coaching', date: '2025-06-28', status: 'Confirmed', amount: 'PKR 1,200' },
              ].map((booking, index) => (
                <tr key={index} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(200,169,126,0.05)]">
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{booking.user}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{booking.creator}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{booking.session}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{booking.date}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#C8A97E]">{booking.status}</span></td>
                  <td className="py-4 px-5"><span className="font-sans text-sm text-[#F9F6F2]">{booking.amount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingsPage;
