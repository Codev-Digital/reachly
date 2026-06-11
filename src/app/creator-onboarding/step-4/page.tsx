'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreatorNavbar from '@/components/CreatorNavbar';

const REACHLY_FEE = 0.10; // 10%
const PROMO_DISC  = 0.20; // 20% first-session discount

export default function CreatorOnboardingStep4() {
  const router = useRouter();
  const [fetchingData, setFetchingData]   = useState(true);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');
  const [sessionTypes, setSessionTypes]   = useState<any[]>([]);
  const [offerPromo, setOfferPromo]       = useState(false);
  const [payoutFrequency, setPayoutFreq]  = useState<'weekly'|'biweekly'|'monthly'>('weekly');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/creator-onboarding/step-4', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sessionTypes)) setSessionTypes(data.sessionTypes);
          if (data.pricing) {
            setOfferPromo(data.pricing.offerFirstSessionDiscount ?? false);
            setPayoutFreq(data.pricing.payoutFrequency ?? 'weekly');
          }
        }
      } finally { setFetchingData(false); }
    })();
  }, []);

  const calcEarnings = (price: number) => {
    const fee = Math.round(price * REACHLY_FEE);
    const youReceiveFull = Math.round(price - fee);
    const promoDiscount = Math.round(price * PROMO_DISC);
    const promoPrice = price - promoDiscount;
    const youReceivePromo = Math.round(promoPrice - fee); // Discount comes from creator share

    return {
      youReceiveFull,
      youReceivePromo,
      fee,
      promoPrice,
      promoDiscount,
    };
  };

  const avgPrice = sessionTypes.length
    ? sessionTypes.reduce((s, t) => s + Number(t.price), 0) / sessionTypes.length
    : 0;
  const avgEarnings = sessionTypes.length
    ? sessionTypes.reduce((s, t) => s + calcEarnings(Number(t.price)).youReceiveFull, 0) / sessionTypes.length
    : 0;
  const potentialMonthly = Math.round(avgEarnings * 3 * 20);

  const handleContinue = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/creator-onboarding/step-4', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerFirstSessionDiscount: offerPromo, payoutFrequency }),
      });
      const data = await res.json();
      if (data.success) router.push('/creator-onboarding/step-5');
      else setError(data.error || 'Failed to save. Try again.');
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  if (fetchingData) return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
      <p className="text-[#C8A97E] font-serif text-lg animate-pulse">Loading pricing…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <CreatorNavbar />

      {/* Progress */}
      <div className="border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {[['Welcome','completed'],['Profile','completed'],['Sessions','completed'],['Pricing','active'],['Availability','upcoming'],['Verification','upcoming'],['Go Live','upcoming']].map(([label, status], i) => (
              <React.Fragment key={i}>
                <StepItem num={i+1} label={label} status={status as any} />
                {i < 6 && <div className={`flex-1 h-px mx-1 sm:mx-2 ${['completed','active'].includes(status) && i < 3 ? 'bg-[#C8A97E]' : 'bg-[rgba(200,169,126,0.2)]'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
        <div className="mb-8 sm:mb-10">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#C8A97E] mb-2">Pricing Setup</h1>
          <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm opacity-70">Review your earnings and set any promotions.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg"><p className="text-sm text-red-300">{error}</p></div>}

        {/* No sessions warning */}
        {sessionTypes.length === 0 && (
          <div className="mb-6 p-4 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            <div>
              <p className="font-sans text-[#C8A97E] text-sm font-semibold">No sessions found</p>
              <p className="font-sans text-[#F9F6F2] text-xs opacity-60">Go back to step 3 to add session types first.</p>
            </div>
            <button onClick={() => router.push('/creator-onboarding/step-3')} className="ml-auto border border-[rgba(200,169,126,0.3)] text-[#C8A97E] px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-[#C8A97E] hover:text-[#0C0C0C] transition-all">Go back</button>
          </div>
        )}

        {/* Earnings Breakdown */}
        {sessionTypes.length > 0 && (
          <div className="mb-6">
            <h3 className="font-sans text-[#F9F6F2] text-xs font-semibold mb-4">Earnings Breakdown</h3>
            {sessionTypes.map((s, i) => {
              const e = calcEarnings(Number(s.price));
              return (
                <div key={s._id || i} className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-4 sm:p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[#F9F6F2] mb-1">{s.title}</h4>
                      <p className="font-sans text-[#F9F6F2] text-xs opacity-60">{s.duration} min session</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-sm font-semibold text-[#C8A97E] mb-1">PKR {Number(s.price).toLocaleString()}</p>
                      <p className="font-sans text-[#F9F6F2] text-xs opacity-60">You charge</p>
                    </div>
                  </div>
                  <div className={`grid gap-3 ${offerPromo ? 'grid-cols-4' : 'grid-cols-2'}`}>
                    <div className="bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg p-3 sm:p-4 text-center">
                      <p className="font-serif text-base sm:text-lg font-semibold text-[#C8A97E] mb-1">PKR {e.youReceiveFull.toLocaleString()}</p>
                      <p className="font-sans text-[#F9F6F2] text-xs opacity-60">You receive (full price)</p>
                    </div>
                    <div className="bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg p-3 sm:p-4 text-center">
                      <p className="font-serif text-base sm:text-lg font-semibold text-[#C8A97E] mb-1">PKR {e.fee.toLocaleString()}</p>
                      <p className="font-sans text-[#F9F6F2] text-xs opacity-60">Reachly fee (10%)</p>
                    </div>
                    {offerPromo && (
                      <>
                        <div className="bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg p-3 sm:p-4 text-center">
                          <p className="font-serif text-base sm:text-lg font-semibold text-[#C8A97E] mb-1">PKR {e.promoPrice.toLocaleString()}</p>
                          <p className="font-sans text-[#F9F6F2] text-xs opacity-60">First session (20% off)</p>
                        </div>
                        <div className="bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg p-3 sm:p-4 text-center">
                          <p className="font-serif text-base sm:text-lg font-semibold text-[#C8A97E] mb-1">PKR {e.youReceivePromo.toLocaleString()}</p>
                          <p className="font-sans text-[#F9F6F2] text-xs opacity-60">You receive (with promo)</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Price tip */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-4 sm:p-5 flex items-start gap-3 sm:gap-4 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h4 className="font-serif text-xs sm:text-sm font-semibold text-[#C8A97E] mb-1">Price recommendation</h4>
            <p className="font-sans text-[#F9F6F2] text-xs opacity-60">Creators in your niche charge between PKR 800 and PKR 3,000 per session.</p>
          </div>
        </div>

        {/* Promo toggle */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-4 sm:p-5 flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm font-semibold text-[#C8A97E] mb-1">Offer 20% off first session</h4>
              <p className="font-sans text-[#F9F6F2] text-xs opacity-60">New followers get a discount on their first booking. Helps with conversion.</p>
            </div>
          </div>
          <button onClick={() => setOfferPromo(!offerPromo)} className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-all ${offerPromo ? 'bg-[#C8A97E]' : 'bg-[#333]'}`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${offerPromo ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Payout frequency */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-4 sm:p-5 mb-6">
          <h3 className="font-serif text-xs sm:text-sm font-semibold text-[#F9F6F2] mb-4">Payout Frequency</h3>
          <div className="space-y-2">
            {([['weekly','Weekly (every Monday)','Fastest access to earnings'],['biweekly','Bi-weekly (every 2 weeks)','Balance between frequency and admin'],['monthly','Monthly (last day)','Best for bulk accounting']] as const).map(([val, label, sub]) => (
              <button key={val} onClick={() => setPayoutFreq(val)} className={`w-full rounded-lg p-3 sm:p-4 flex items-center gap-3 text-left transition-all ${payoutFrequency === val ? 'bg-[rgba(200,169,126,0.1)] border border-[#C8A97E]' : 'bg-[#0C0C0C] border border-[rgba(200,169,126,0.15)] opacity-60 hover:opacity-80'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${payoutFrequency === val ? 'border-[#C8A97E]' : 'border-[rgba(200,169,126,0.3)]'}`}>
                  {payoutFrequency === val && <div className="w-2.5 h-2.5 rounded-full bg-[#C8A97E]" />}
                </div>
                <div>
                  <p className="font-sans text-sm text-[#F9F6F2]">{label}</p>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Potential earnings */}
        {sessionTypes.length > 0 && (
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-6 sm:p-8 mb-6 text-center">
            <h3 className="font-serif text-sm font-semibold text-[#F9F6F2] mb-2">Your potential monthly earnings</h3>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-[#C8A97E] mb-3">PKR {potentialMonthly.toLocaleString()}</p>
            <p className="font-sans text-[#F9F6F2] text-xs opacity-50">Based on ~3 sessions/day, 20 days/month at your average rate.</p>
          </div>
        )}

        {/* Change prices link */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-4 sm:p-5 flex items-center justify-between gap-4 mb-8">
          <div>
            <h4 className="font-serif text-xs sm:text-sm font-semibold text-[#F9F6F2] mb-1">Need to change prices?</h4>
            <p className="font-sans text-[#F9F6F2] text-xs opacity-60">Go back to Session Types to edit them inline.</p>
          </div>
          <button onClick={() => router.push('/creator-onboarding/step-3')} className="flex-shrink-0 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] px-4 py-2 rounded-full font-serif font-semibold text-xs hover:bg-[#C8A97E] hover:text-[#0C0C0C] transition-all flex items-center gap-1.5">
            Edit Sessions <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>

        {/* Nav */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button onClick={() => router.push('/creator-onboarding/step-3')} className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm hover:border-[#C8A97E] transition-all flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back
          </button>
          <button onClick={handleContinue} disabled={saving} className="flex-1 bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving…</> : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepItem({ num, label, status }: { num: number; label: string; status: 'completed' | 'active' | 'upcoming' }) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2 min-w-[60px] sm:min-w-[80px]">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-serif text-sm sm:text-base font-semibold transition-all ${status === 'completed' ? 'bg-[#141414] text-[#C8A97E] border border-[#C8A97E]' : status === 'active' ? 'bg-[#C8A97E] text-[#0C0C0C]' : 'bg-[#141414] text-[#F9F6F2] border border-[rgba(200,169,126,0.3)] opacity-60'}`}>
        {status === 'completed' ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> : num}
      </div>
      <span className={`text-[10px] sm:text-xs font-sans font-medium text-center ${status === 'completed' || status === 'active' ? 'text-[#C8A97E]' : 'text-[#F9F6F2] opacity-60'}`}>{label}</span>
    </div>
  );
}
