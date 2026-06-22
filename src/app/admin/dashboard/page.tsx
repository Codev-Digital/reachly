'use client';

import { motion } from 'framer-motion';

const AdminDashboard = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search users, creators, or bookings"
            className="w-full bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2]/50 focus:outline-none focus:border-[#C8A97E]"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-[#141414] border border-[rgba(200,169,126,0.3)] flex items-center justify-center text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C8A97E]">
            <img src="/ahad raza mir.png" alt="Admin" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-[#141414] to-[#0C0C0C] border border-[rgba(200,169,126,0.2)] rounded-xl p-5 mb-6"
      >
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F9F6F2]">Welcome back, Admin</h2>
        <p className="font-sans text-sm text-[#F9F6F2] opacity-70">
          Here is an overview of the platform's performance today.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {[
          { label: 'Total Users', value: '1,247' },
          { label: 'Total Creators', value: '58' },
          { label: 'Total Bookings', value: '2,893' },
          { label: 'Total Revenue', value: 'PKR 4,582,430' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5"
          >
            <div className="w-10 h-10 rounded-full bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <p className="font-serif text-lg sm:text-xl font-bold text-[#F9F6F2] mb-1">{stat.value}</p>
            <p className="font-sans text-xs text-[#F9F6F2] opacity-70">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5"
        >
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#F9F6F2] mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {[
              { user: 'Mariam Hussain', creator: 'Ahad Raza Mir', date: '2025-06-28', amount: 'PKR 900' },
              { user: 'Sara Ahmed', creator: 'Mahira Khan', date: '2025-06-28', amount: 'PKR 1,200' },
              { user: 'Nida Shah', creator: 'Humayun Saeed', date: '2025-06-28', amount: 'PKR 800' },
            ].map((booking, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-[rgba(200,169,126,0.05)] rounded-lg gap-2">
                <div>
                  <p className="font-sans text-sm text-[#F9F6F2]">{booking.user}</p>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-60">with {booking.creator}</p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-sm text-[#C8A97E]">{booking.amount}</p>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{booking.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5"
        >
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#F9F6F2] mb-4">New Users</h3>
          <div className="space-y-3">
            {[
              { name: 'Ahmed Raza', email: 'ahmed@example.com', joined: '2025-06-28' },
              { name: 'Bilal Qureshi', email: 'bilal@example.com', joined: '2025-06-28' },
              { name: 'Fatima Ali', email: 'fatima@example.com', joined: '2025-06-28' },
            ].map((user, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-[rgba(200,169,126,0.05)] rounded-lg gap-2">
                <div>
                  <p className="font-sans text-sm text-[#F9F6F2]">{user.name}</p>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{user.email}</p>
                </div>
                <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{user.joined}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 bg-[rgba(20,20,20,0.5)] border-b border-[rgba(255,255,255,0.1)]">
          <h3 className="font-serif text-lg font-bold text-[#C8A97E]">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,20,0.5)]">
                {['User', 'Action', 'Target', 'Date', 'Time'].map((header) => (
                  <th
                    key={header}
                    className="text-left py-4 px-4 sm:px-5 font-sans text-xs font-semibold text-[#C8A97E] uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { user: 'Mariam Hussain', action: 'Booked', target: 'Ahad Raza Mir', date: '2025-06-28', time: '14:30' },
                { user: 'Sara Ahmed', action: 'Registered', target: '-', date: '2025-06-28', time: '12:15' },
                { user: 'Nida Shah', action: 'Left review', target: 'Mahira Khan', date: '2025-06-28', time: '10:45' },
                { user: 'Ahmed Raza', action: 'Booked', target: 'Humayun Saeed', date: '2025-06-28', time: '09:20' },
              ].map((activity, index) => (
                <motion.tr
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.02 }}
                  className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(200,169,126,0.05)]"
                >
                  <td className="py-4 px-4 sm:px-5"><span className="font-sans text-sm text-[#F9F6F2]">{activity.user}</span></td>
                  <td className="py-4 px-4 sm:px-5"><span className="font-sans text-sm text-[#F9F6F2]">{activity.action}</span></td>
                  <td className="py-4 px-4 sm:px-5"><span className="font-sans text-sm text-[#F9F6F2]">{activity.target}</span></td>
                  <td className="py-4 px-4 sm:px-5"><span className="font-sans text-sm text-[#F9F6F2]">{activity.date}</span></td>
                  <td className="py-4 px-4 sm:px-5"><span className="font-sans text-sm text-[#F9F6F2]">{activity.time}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
