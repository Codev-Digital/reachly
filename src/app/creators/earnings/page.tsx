'use client';

import { motion } from 'framer-motion';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

const CreatorEarnings = () => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('jazzcash');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [methodFilter, setMethodFilter] = useState('all');
  const [withdrawAmount, setWithdrawAmount] = useState('45200');

  const payouts = [
    { id: 1, amount: 42200, requested: 'Fri, 1 May 2026', paid: 'Sun, 3 May 2026', method: 'JazzCash', reference: 'JC-0829701', status: 'Completed' },
    { id: 2, amount: 42200, requested: 'Fri, 1 May 2026', paid: 'Fri, 17 Apr 2026', method: 'Bank Transfer', reference: 'JC-0829701', status: 'Completed' },
    { id: 3, amount: 42200, requested: 'Fri, 1 May 2026', paid: 'Fri, 17 Apr 2026', method: 'EasyPaisa', reference: 'JC-0829701', status: 'Completed' },
    { id: 4, amount: 42200, requested: 'Fri, 1 May 2026', paid: 'Fri, 17 Apr 2026', method: 'JazzCash', reference: 'JC-0829701', status: 'Completed' },
    { id: 5, amount: 42200, requested: 'Fri, 1 May 2026', paid: 'Fri, 17 Apr 2026', method: 'Bank Transfer', reference: 'JC-0829701', status: 'Completed' },
    { id: 6, amount: 42200, requested: 'Fri, 1 May 2026', paid: 'Fri, 17 Apr 2026', method: 'JazzCash', reference: 'JC-0829701', status: 'Completed' },
    { id: 7, amount: 42200, requested: 'Fri, 1 May 2026', paid: 'Fri, 17 Apr 2026', method: 'EasyPaisa', reference: 'JC-0829701', status: 'Completed' },
    { id: 8, amount: 42200, requested: 'Fri, 1 May 2026', paid: 'Fri, 17 Apr 2026', method: 'JazzCash', reference: 'JC-0829701', status: 'Completed' },
  ];

  const sessionEarnings = [
    { name: 'Confidence Coaching', amount: 85300, percentage: 70, sessions: 50, highlight: 'Best Performing' },
    { name: 'Content Strategy', amount: 65300, percentage: 30, sessions: 30, highlight: '' },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
      <CreatorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <CreatorSidebar />

          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <div className="mb-6">
              <h1 className="font-serif text-4xl font-bold text-[#C8A97E] mb-2">Earnings & Payouts</h1>
              <p className="font-sans text-base text-[#F9F6F2] opacity-70">Track your income, request withdrawals, and view your payout history.</p>
            </div>

            <div className="bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] rounded-xl p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <p className="text-sm font-sans text-[#F9F6F2]"><span className="text-[#f87171] font-medium">A recent payout failed.</span></p>
                  <p className="text-xs font-sans text-[#F9F6F2] opacity-70">JC-08249012 - Account number incorrect. Update your payment method to receive your earnings.</p>
                </div>
              </div>
              <button className="bg-[rgba(248,113,113,0.2)] text-[#f87171] px-4 py-2 rounded-lg text-xs font-sans">Update Method</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="bg-[#141414] border border-[rgba(248,113,113,0.4)] rounded-2xl p-7">
                <div className="w-16 h-16 bg-[rgba(255,255,255,0.08)] rounded-full flex items-center justify-center mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <p className="text-lg font-sans text-[#F9F6F2] opacity-60 mb-2">Available Balance</p>
                <p className="text-3xl font-serif font-bold text-[#C8A97E] mb-2">PKR 45,200</p>
                <p className="text-base font-sans text-[#F9F6F2] opacity-60 mb-5">Ready to withdraw</p>
                <button 
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full bg-[#C8A97E] text-[#0C0C0C] py-3 rounded-xl text-lg font-sans font-semibold hover:opacity-90 transition-all"
                >
                  Withdraw
                </button>
              </div>

              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-7">
                <div className="w-16 h-16 bg-[rgba(255,255,255,0.08)] rounded-full flex items-center justify-center mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p className="text-lg font-sans text-[#F9F6F2] opacity-60 mb-2">Pending Balance</p>
                <p className="text-3xl font-serif font-bold text-[#C8A97E] mb-2">PKR 12,800</p>
                <p className="text-base font-sans text-[#F9F6F2] opacity-60">Sessions not yet completed</p>
              </div>

              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-7">
                <div className="w-16 h-16 bg-[rgba(255,255,255,0.08)] rounded-full flex items-center justify-center mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <p className="text-lg font-sans text-[#F9F6F2] opacity-60 mb-2">Total Earned</p>
                <p className="text-3xl font-serif font-bold text-[#C8A97E] mb-2">PKR 287,500</p>
                <p className="text-base font-sans text-[#F9F6F2] opacity-60">Lifetime earnings</p>
              </div>

              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-7">
                <div className="w-16 h-16 bg-[rgba(255,255,255,0.08)] rounded-full flex items-center justify-center mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <polyline points="14 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-lg font-sans text-[#F9F6F2] opacity-60 mb-2">Total Paid Out</p>
                <p className="text-3xl font-serif font-bold text-[#C8A97E] mb-2">PKR 242,300</p>
                <p className="text-base font-sans text-[#F9F6F2] opacity-60">Lifetime withdrawals</p>
              </div>
            </div>

            <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#F9F6F2] mb-1">Earnings Overview</h3>
                  <p className="text-xs font-sans text-[#F9F6F2] opacity-60">Total PKR 54,842 - Daily average PKR 1,028</p>
                </div>
                <div className="flex gap-2">
                  {['7 days', '30 days', '90 days', 'Month', 'Year'].map((period) => (
                    <button
                      key={period}
                      className={`px-3 py-1 rounded-full text-xs font-sans ${
                        period === '30 days'
                          ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E]'
                          : 'bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] opacity-70'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative h-48 overflow-hidden rounded-lg bg-gradient-to-b from-[rgba(200,169,126,0.1)] to-transparent">
                <svg viewBox="0 0 800 200" className="w-full h-full">
                  <path
                    d="M0,150 Q50,100 100,120 T200,80 T300,130 T400,90 T500,140 T600,100 T700,130 T800,110"
                    fill="none"
                    stroke="#C8A97E"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs font-sans text-[#F9F6F2] opacity-40">
                  <span>2026-04-06</span>
                  <span>2026-05-01</span>
                  <span>2026-06-14</span>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-2xl p-7 mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#C8A97E] mb-7">Earnings by Session Type</h3>

              <div className="space-y-7">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-sans text-[#F9F6F2]">Style Consultation</span>
                    <span className="text-lg font-sans text-[#F9F6F2]">PKR 98,400 · 82 bookings</span>
                  </div>
                  <div className="relative h-3.5">
                    <div className="absolute inset-0 bg-[rgba(255,255,255,0.05)] rounded-full" />
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-[#C8A97E] rounded-full flex items-center justify-end"
                      style={{ width: '75%' }}
                    >
                      <div className="w-5 h-5 bg-[#C8A97E] rounded-full border-3 border-[#141414]" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-sans text-[#F9F6F2]">Confidence Coaching</span>
                      <span className="text-base font-sans text-[#C8A97E] font-semibold">Best Performing</span>
                    </div>
                    <span className="text-lg font-sans text-[#F9F6F2]">PKR 102,300 · 57 bookings</span>
                  </div>
                  <div className="relative h-3.5">
                    <div className="absolute inset-0 bg-[rgba(255,255,255,0.05)] rounded-full" />
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-[#C8A97E] rounded-full flex items-center justify-end"
                      style={{ width: '100%' }}
                    >
                      <div className="w-5 h-5 bg-[#C8A97E] rounded-full border-3 border-[#141414]" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-sans text-[#F9F6F2]">Content Strategy</span>
                    <span className="text-lg font-sans text-[#F9F6F2]">PKR 86,800 · 35 bookings</span>
                  </div>
                  <div className="relative h-3.5">
                    <div className="absolute inset-0 bg-[rgba(255,255,255,0.05)] rounded-full" />
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-[#C8A97E] rounded-full flex items-center justify-end"
                      style={{ width: '65%' }}
                    >
                      <div className="w-5 h-5 bg-[#C8A97E] rounded-full border-3 border-[#141414]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-[#F9F6F2]">Payout History</h3>
                <div className="flex gap-4">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] text-xl px-5 py-3 rounded-2xl appearance-none pr-10"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <polyline points="6 10 12 16 18 10" />
                    </svg>
                  </div>

                  <div className="relative">
                    <select
                      value={methodFilter}
                      onChange={(e) => setMethodFilter(e.target.value)}
                      className="bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] text-xl px-5 py-3 rounded-2xl appearance-none pr-10"
                    >
                      <option value="all">All Methods</option>
                      <option value="jazzcash">Jazz Cash</option>
                      <option value="easypaisa">Easy Paisa</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <polyline points="6 10 12 16 18 10" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 text-xs font-sans text-[#F9F6F2] opacity-50 pb-3 border-b border-[rgba(255,255,255,0.05)] mb-3">
                <div>Amount</div>
                <div>Requested</div>
                <div>Paid</div>
                <div>Method</div>
                <div></div>
              </div>

              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div key={payout.id} className="grid grid-cols-5 gap-4 items-center py-2">
                    <div className="text-sm font-sans text-[#F9F6F2] font-medium">PKR {payout.amount.toLocaleString()}</div>
                    <div className="text-xs font-sans text-[#F9F6F2] opacity-60">{payout.requested}</div>
                    <div className="text-xs font-sans text-[#F9F6F2] opacity-60">{payout.paid}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-sans text-[#F9F6F2] opacity-80">{payout.method}</span>
                      <span className="text-xs font-sans text-[#F9F6F2] opacity-50">{payout.reference}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-sans px-2 py-1 rounded ${
                        payout.status === 'Completed'
                          ? 'bg-[rgba(52,211,153,0.1)] text-[#34d399]'
                          : 'bg-[rgba(248,113,113,0.1)] text-[#f87171]'
                      }`}>
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-serif text-3xl font-bold text-[#C8A97E] mb-5">Tax Documents</h3>
              <p className="text-lg font-sans text-[#F9F6F2] opacity-70 mb-6">Download your annual income summary for tax filing. Reachly does not deduct tax.</p>

              <div className="flex gap-4 mb-5">
                <button className="flex items-center gap-3 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl px-7 py-4 text-base font-sans text-[#F9F6F2] opacity-80 hover:opacity-100 transition-all">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  2026 Income Summary
                </button>
                <button className="flex items-center gap-3 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl px-7 py-4 text-base font-sans text-[#F9F6F2] opacity-80 hover:opacity-100 transition-all">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  2025 Income Summary
                </button>
              </div>

              <p className="text-base font-sans text-[#F9F6F2] opacity-50">Documents include gross earnings, platform fees, and net income per calendar year.</p>
            </div>
          </motion.main>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-50">
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-3xl p-7 w-full max-w-lg">
            <h3 className="font-serif text-3xl font-bold text-[#C8A97E] mb-2">Withdraw Earnings</h3>
            <p className="text-lg font-sans text-[#F9F6F2] opacity-80 mb-7">Request a payout to your preferred method.</p>

            <div className="mb-6">
              <label className="text-lg font-sans text-[#F9F6F2] mb-3 block">Amount (PKR)</label>
              <input
                type="text"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(200,169,126,0.3)] rounded-2xl px-5 py-4 text-xl font-sans text-[#F9F6F2] outline-none"
                placeholder="Enter amount"
              />
            </div>

            <div className="mb-6">
              <label className="text-lg font-sans text-[#F9F6F2] mb-4 block">Payment Method</label>
              <div className="flex gap-3">
                {['JazzCash', 'EasyPaisa', 'Bank Transfer'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method.toLowerCase().replace(' ', ''))}
                    className={`flex-1 py-3 px-5 rounded-2xl text-lg font-sans ${
                      selectedMethod === method.toLowerCase().replace(' ', '')
                        ? 'bg-[#C8A97E] text-[#0C0C0C]'
                        : 'bg-[rgba(255,255,255,0.02)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] opacity-80'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
              <p className="text-sm font-sans text-[#F9F6F2] opacity-70 mt-3">Expected processing: 1 to 3 business days.</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 bg-transparent border border-[rgba(200,169,126,0.4)] text-[#F9F6F2] opacity-70 py-3 rounded-full text-xl font-sans font-semibold hover:opacity-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setShowSuccessModal(true);
                }}
                className="flex-1 bg-[#C8A97E] text-[#0C0C0C] py-3 rounded-full text-xl font-sans font-semibold hover:opacity-90 transition-all"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-50">
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-3xl p-8 w-full max-w-md text-center">
            <div className="w-24 h-24 bg-[rgba(200,169,126,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-serif text-3xl font-bold text-[#F9F6F2] mb-3">Payout Requested</h3>
            <p className="text-lg font-sans text-[#F9F6F2] opacity-80 mb-2">You will receive</p>
            <p className="text-4xl font-serif font-bold text-[#C8A97E] mb-2">PKR 45,200</p>
            <p className="text-lg font-sans text-[#F9F6F2] opacity-80 mb-8">within 1 to 3 business days via JazzCash.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-[#C8A97E] text-[#0C0C0C] px-10 py-3 rounded-full text-xl font-sans font-semibold hover:opacity-90 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorEarnings;
