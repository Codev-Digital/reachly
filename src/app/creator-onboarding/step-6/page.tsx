'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LoadingAnimation from '@/components/LoadingAnimation';

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentMethod = 'jazzcash' | 'easypaisa' | 'bank';
type PayoutFrequency = 'weekly' | 'biweekly' | 'monthly';

const BANKS = [
  'HBL – Habib Bank Limited',
  'MCB – Muslim Commercial Bank',
  'UBL – United Bank Limited',
  'ABL – Allied Bank Limited',
  'Meezan Bank',
  'Bank Alfalah',
  'Faysal Bank',
  'Standard Chartered Pakistan',
  'JS Bank',
  'Bank of Punjab',
  'Askari Bank',
  'Silk Bank',
  'Soneri Bank',
  'First Women Bank',
  'Other',
];

const PAYOUT_OPTIONS: { value: PayoutFrequency; label: string; sub: string }[] = [
  { value: 'weekly',   label: 'Weekly (every Monday)',   sub: 'Fastest access to your earnings' },
  { value: 'biweekly', label: 'Bi-weekly (every 2 weeks)', sub: 'Good balance of frequency and admin' },
  { value: 'monthly',  label: 'Monthly (last day)',      sub: 'Best for bulk accounting' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isValidPKMobile(n: string) {
  return /^3\d{9}$/.test(n.replace(/\s/g, ''));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreatorOnboardingStep6() {
  const router = useRouter();

  const [fetchingData, setFetchingData]     = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState('');
  const [fieldErrors, setFieldErrors]       = useState<Record<string, string>>({});
  const [cnicExpanded, setCnicExpanded]     = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod]   = useState<PaymentMethod | null>(null);

  // Wallet fields (jazzcash / easypaisa)
  const [mobileNumber, setMobile]           = useState('');
  const [accountTitle, setAccountTitle]     = useState('');

  // Bank fields
  const [bankName, setBankName]             = useState('');
  const [accountNumber, setAccountNumber]   = useState('');
  const [iban, setIban]                     = useState('');
  const [bankAccountTitle, setBankAccTitle] = useState('');

  // Tax
  const [ntnNumber, setNtn]                 = useState('');

  // Payout
  const [payoutFrequency, setPayoutFreq]    = useState<PayoutFrequency>('weekly');

  // CNIC
  const [cnicFrontFile, setCnicFrontFile]   = useState<File | null>(null);
  const [cnicBackFile, setCnicBackFile]     = useState<File | null>(null);
  const [cnicFrontPreview, setCnicFrontPrev] = useState<string | null>(null);
  const [cnicBackPreview, setCnicBackPrev]  = useState<string | null>(null);
  const [cnicFrontUrl, setCnicFrontUrl]     = useState<string | null>(null); // saved Supabase URL
  const [cnicBackUrl, setCnicBackUrl]       = useState<string | null>(null);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);

  // ── Load saved data on mount ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/creator-onboarding/step-6', { cache: 'no-store' });
        if (res.ok) {
          const { payment } = await res.json();
          if (payment) {
            if (payment.paymentMethod) setPaymentMethod(payment.paymentMethod);
            if (payment.mobileNumber)  setMobile(payment.mobileNumber);
            if (payment.accountTitle)  {
              setAccountTitle(payment.accountTitle);
              setBankAccTitle(payment.accountTitle);
            }
            if (payment.bankName)      setBankName(payment.bankName);
            if (payment.accountNumber) setAccountNumber(payment.accountNumber);
            if (payment.iban)          setIban(payment.iban);
            if (payment.ntnNumber)     setNtn(payment.ntnNumber);
            if (payment.payoutFrequency) setPayoutFreq(payment.payoutFrequency);
            if (payment.cnicFront) { setCnicFrontUrl(payment.cnicFront); setCnicFrontPrev(payment.cnicFront); }
            if (payment.cnicBack)  { setCnicBackUrl(payment.cnicBack);  setCnicBackPrev(payment.cnicBack); }
          }
        }
      } finally { setFetchingData(false); }
    })();
  }, []);

  // ── File pick helpers ───────────────────────────────────────────────────
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors(fe => ({ ...fe, [`cnic${side}`]: 'File must be smaller than 5 MB.' }));
      return;
    }
    setFieldErrors(fe => { const n = { ...fe }; delete n[`cnic${side}`]; return n; });
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      if (side === 'front') { setCnicFrontFile(file); setCnicFrontPrev(url); }
      else                  { setCnicBackFile(file);  setCnicBackPrev(url); }
    };
    reader.readAsDataURL(file);
  };

  // ── Validate ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const fe: Record<string, string> = {};

    if (!paymentMethod) {
      fe.paymentMethod = 'Please select a payment method.';
    } else if (paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') {
      if (!mobileNumber.trim())            fe.mobileNumber  = 'Mobile number is required.';
      else if (!isValidPKMobile(mobileNumber)) fe.mobileNumber = 'Enter a valid 10-digit mobile number starting with 3.';
      if (!accountTitle.trim())            fe.accountTitle  = 'Account title is required.';
    } else if (paymentMethod === 'bank') {
      if (!bankAccountTitle.trim())        fe.bankAccountTitle = 'Account title is required.';
      if (!bankName || bankName === '')    fe.bankName      = 'Please select your bank.';
      if (!accountNumber.trim())           fe.accountNumber = 'Account number is required.';
    }

    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  // ── Continue → save to DB ────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true); setError('');

    try {
      const fd = new FormData();
      fd.append('paymentMethod',   paymentMethod!);
      fd.append('payoutFrequency', payoutFrequency);
      fd.append('ntnNumber',       ntnNumber);

      if (paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') {
        fd.append('mobileNumber', mobileNumber.trim());
        fd.append('accountTitle', accountTitle.trim());
      }
      if (paymentMethod === 'bank') {
        fd.append('bankName',      bankName);
        fd.append('accountNumber', accountNumber.trim());
        fd.append('iban',          iban.trim());
        fd.append('accountTitle',  bankAccountTitle.trim());
      }
      if (cnicFrontFile) fd.append('cnicFront', cnicFrontFile);
      if (cnicBackFile)  fd.append('cnicBack',  cnicBackFile);

      const res = await fetch('/api/creator-onboarding/step-6', { method: 'PUT', body: fd });
      const data = await res.json();

      if (data.success) {
        router.push('/creator-onboarding/step-7');
      } else {
        setError(data.error || 'Failed to save. Please try again.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setError('Network error. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  // ── Field border helper ─────────────────────────────────────────────────
  const fb = (key: string) =>
    fieldErrors[key]
      ? 'border-red-500/70 focus:border-red-500'
      : 'border-[rgba(200,169,126,0.15)] focus:border-[#C8A97E]';

  if (fetchingData) return <LoadingAnimation />;

  return (
    <div className="min-h-screen bg-[#0C0C0C]">



      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">

        {/* Heading */}
        <div className="mb-8 sm:mb-10 pb-4 border-b border-[rgba(255,255,255,0.08)]">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#C8A97E] mb-2">
            How would you like to get paid?
          </h1>
          <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm opacity-70">
            Set up your payout method. All details are encrypted and never shared.
          </p>
        </div>

        {/* Top-level error */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
            <p className="font-sans text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Payment method selector */}
        <div className="mb-6">
          <p className="font-sans text-[#F9F6F2] text-xs font-semibold mb-3">
            Select Payment Method <span className="text-red-400">*</span>
          </p>
          {fieldErrors.paymentMethod && (
            <p className="text-red-400 text-xs mb-3">{fieldErrors.paymentMethod}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {([
              { id: 'jazzcash',  label: 'JazzCash',      sub: 'Direct to JazzCash wallet',  num: '01' },
              { id: 'easypaisa', label: 'EasyPaisa',     sub: 'Direct to EasyPaisa wallet', num: '02' },
              { id: 'bank',      label: 'Bank Transfer', sub: 'Direct bank deposit',        num: '03' },
            ] as { id: PaymentMethod; label: string; sub: string; num: string }[]).map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setPaymentMethod(m.id); setFieldErrors(fe => { const n={...fe}; delete n.paymentMethod; return n; }); }}
                className={`bg-[#141414] border rounded-xl p-4 sm:p-5 text-left transition-all ${
                  paymentMethod === m.id
                    ? 'border-[#C8A97E] ring-1 ring-[rgba(200,169,126,0.3)]'
                    : 'border-[rgba(200,169,126,0.15)] hover:border-[rgba(200,169,126,0.4)]'
                }`}
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all ${paymentMethod === m.id ? 'border-[#C8A97E] bg-[rgba(200,169,126,0.1)]' : 'border-[rgba(200,169,126,0.3)]'}`}>
                    {paymentMethod === m.id
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    }
                  </div>
                  <span className="font-serif text-xs text-[#C8A97E] opacity-60">{m.num}</span>
                </div>
                <h3 className={`font-serif text-sm font-semibold mb-1 ${paymentMethod === m.id ? 'text-[#C8A97E]' : 'text-[#F9F6F2]'}`}>
                  {m.label}
                </h3>
                <p className="font-sans text-[#F9F6F2] text-xs opacity-60">{m.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Payment detail forms ── */}
        {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-6 mb-5">
            <h3 className="font-serif text-sm sm:text-base font-semibold text-[#F9F6F2] mb-5">
              {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Details
            </h3>
            <div className="space-y-4">
              {/* Mobile */}
              <div>
                <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                  Registered Mobile Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-[#F9F6F2] text-xs opacity-50 pointer-events-none select-none">
                    +92
                  </span>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={e => { setMobile(e.target.value); setFieldErrors(fe => { const n={...fe}; delete n.mobileNumber; return n; }); }}
                    className={`w-full bg-[#0C0C0C] border rounded-lg pl-12 pr-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none ${fb('mobileNumber')}`}
                    placeholder="3XX XXXXXXX"
                    maxLength={10}
                  />
                </div>
                {fieldErrors.mobileNumber
                  ? <p className="text-red-400 text-xs mt-1">{fieldErrors.mobileNumber}</p>
                  : <p className="font-sans text-[#F9F6F2] text-xs opacity-40 mt-1">10-digit number registered with your wallet</p>
                }
              </div>
              {/* Account title */}
              <div>
                <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                  Account Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={accountTitle}
                  onChange={e => { setAccountTitle(e.target.value); setFieldErrors(fe => { const n={...fe}; delete n.accountTitle; return n; }); }}
                  className={`w-full bg-[#0C0C0C] border rounded-lg px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none ${fb('accountTitle')}`}
                  placeholder="Full name as on CNIC"
                />
                {fieldErrors.accountTitle && <p className="text-red-400 text-xs mt-1">{fieldErrors.accountTitle}</p>}
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'bank' && (
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-6 mb-5">
            <h3 className="font-serif text-sm sm:text-base font-semibold text-[#F9F6F2] mb-5">Bank Account Details</h3>
            <div className="space-y-4">
              {/* Account title */}
              <div>
                <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                  Account Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={bankAccountTitle}
                  onChange={e => { setBankAccTitle(e.target.value); setFieldErrors(fe => { const n={...fe}; delete n.bankAccountTitle; return n; }); }}
                  className={`w-full bg-[#0C0C0C] border rounded-lg px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none ${fb('bankAccountTitle')}`}
                  placeholder="Full name as on bank records"
                />
                {fieldErrors.bankAccountTitle && <p className="text-red-400 text-xs mt-1">{fieldErrors.bankAccountTitle}</p>}
              </div>
              {/* Bank name */}
              <div>
                <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                  Bank Name <span className="text-red-400">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={e => { setBankName(e.target.value); setFieldErrors(fe => { const n={...fe}; delete n.bankName; return n; }); }}
                  className={`w-full bg-[#0C0C0C] border rounded-lg px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none ${fb('bankName')}`}
                >
                  <option value="">Select your bank</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {fieldErrors.bankName && <p className="text-red-400 text-xs mt-1">{fieldErrors.bankName}</p>}
              </div>
              {/* Account number + IBAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                    Account Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => { setAccountNumber(e.target.value); setFieldErrors(fe => { const n={...fe}; delete n.accountNumber; return n; }); }}
                    className={`w-full bg-[#0C0C0C] border rounded-lg px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none ${fb('accountNumber')}`}
                    placeholder="Your account number"
                  />
                  {fieldErrors.accountNumber && <p className="text-red-400 text-xs mt-1">{fieldErrors.accountNumber}</p>}
                </div>
                <div>
                  <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                    IBAN <span className="font-normal opacity-50">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={iban}
                    onChange={e => setIban(e.target.value)}
                    className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.15)] rounded-lg px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none focus:border-[#C8A97E]"
                    placeholder="PK00XXXX0000000000000000"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CNIC Verification (collapsible, optional) ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl mb-5 overflow-hidden">
          {/* Header toggle */}
          <button
            type="button"
            onClick={() => setCnicExpanded(!cnicExpanded)}
            className="w-full px-4 sm:px-5 py-4 flex items-center justify-between hover:bg-[rgba(200,169,126,0.03)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-serif text-sm font-semibold text-[#F9F6F2]">
                  CNIC Verification
                  <span className="ml-2 text-[10px] font-sans font-normal bg-[rgba(200,169,126,0.15)] text-[#C8A97E] px-2 py-0.5 rounded-full align-middle">
                    Optional — recommended
                  </span>
                  {(cnicFrontUrl || cnicFrontFile) && (cnicBackUrl || cnicBackFile) && (
                    <span className="ml-2 text-[10px] font-sans font-normal bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full align-middle">
                      Uploaded ✓
                    </span>
                  )}
                </p>
                <p className="font-sans text-[#F9F6F2] text-xs opacity-60 mt-0.5">
                  Get higher payout limits and a verified trust badge
                </p>
              </div>
            </div>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2"
              className={`flex-shrink-0 transition-transform duration-200 ${cnicExpanded ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Expanded upload area */}
          {cnicExpanded && (
            <div className="px-4 sm:px-5 pb-5 border-t border-[rgba(255,255,255,0.05)]">
              <p className="font-sans text-[#F9F6F2] text-xs opacity-60 mt-4 mb-4">
                Upload both sides of your CNIC. JPG, PNG or WebP — max 5 MB each.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front */}
                <div>
                  <p className="font-sans text-[#F9F6F2] text-xs font-semibold mb-2">Front side</p>
                  <label className="block cursor-pointer">
                    <div className={`relative bg-[#0C0C0C] border-2 border-dashed rounded-xl overflow-hidden transition-all hover:border-[#C8A97E] ${fieldErrors.cnicfront ? 'border-red-500/70' : 'border-[rgba(200,169,126,0.2)]'}`}
                      style={{ aspectRatio: '16/9' }}>
                      {cnicFrontPreview ? (
                        <>
                          <img src={cnicFrontPreview} alt="CNIC front" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs font-semibold">Click to change</p>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                          </svg>
                          <p className="font-sans text-[#F9F6F2] text-xs opacity-60">Click to upload front</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={frontRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={e => handleFileChange(e, 'front')}
                      className="hidden"
                    />
                  </label>
                  {fieldErrors.cnicfront && <p className="text-red-400 text-xs mt-1">{fieldErrors.cnicfront}</p>}
                </div>
                {/* Back */}
                <div>
                  <p className="font-sans text-[#F9F6F2] text-xs font-semibold mb-2">Back side</p>
                  <label className="block cursor-pointer">
                    <div className={`relative bg-[#0C0C0C] border-2 border-dashed rounded-xl overflow-hidden transition-all hover:border-[#C8A97E] ${fieldErrors.cnicback ? 'border-red-500/70' : 'border-[rgba(200,169,126,0.2)]'}`}
                      style={{ aspectRatio: '16/9' }}>
                      {cnicBackPreview ? (
                        <>
                          <img src={cnicBackPreview} alt="CNIC back" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs font-semibold">Click to change</p>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                          </svg>
                          <p className="font-sans text-[#F9F6F2] text-xs opacity-60">Click to upload back</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={backRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={e => handleFileChange(e, 'back')}
                      className="hidden"
                    />
                  </label>
                  {fieldErrors.cnicback && <p className="text-red-400 text-xs mt-1">{fieldErrors.cnicback}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Payout Frequency ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-6 mb-5">
          <h3 className="font-serif text-sm sm:text-base font-semibold text-[#F9F6F2] mb-4">Payout Frequency</h3>
          <div className="space-y-2">
            {PAYOUT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPayoutFreq(opt.value)}
                className={`w-full rounded-xl p-3 sm:p-4 flex items-center gap-3 text-left transition-all ${
                  payoutFrequency === opt.value
                    ? 'bg-[rgba(200,169,126,0.08)] border border-[#C8A97E]'
                    : 'bg-[#0C0C0C] border border-[rgba(200,169,126,0.12)] hover:border-[rgba(200,169,126,0.3)]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${payoutFrequency === opt.value ? 'border-[#C8A97E]' : 'border-[rgba(200,169,126,0.3)]'}`}>
                  {payoutFrequency === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-[#C8A97E]" />}
                </div>
                <div>
                  <p className="font-sans text-sm text-[#F9F6F2]">{opt.label}</p>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tax Information ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-6 mb-5">
          <h3 className="font-serif text-sm sm:text-base font-semibold text-[#F9F6F2] mb-4">
            Tax Information
            <span className="ml-2 text-xs font-sans font-normal opacity-50">(optional)</span>
          </h3>
          <div>
            <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">NTN Number</label>
            <input
              type="text"
              value={ntnNumber}
              onChange={e => setNtn(e.target.value)}
              className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.15)] rounded-lg px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none focus:border-[#C8A97E]"
              placeholder="1234567-8"
            />
            <p className="font-sans text-[#F9F6F2] text-xs opacity-40 mt-1">Provide your NTN for proper tax documentation.</p>
          </div>
        </div>

        {/* ── Security notice ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.1)] rounded-xl p-4 flex items-start gap-3 mb-8">
          <div className="w-8 h-8 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <p className="font-sans text-[#F9F6F2] text-xs opacity-60 leading-5">
            Your payment details are encrypted with AES-256 and are never shared with third parties.
            CNIC images are stored securely in Supabase Storage and only accessible to Reachly's verification team.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push('/creator-onboarding/step-5')}
            className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm hover:border-[#C8A97E] transition-all flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className="flex-1 bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving…</>
            ) : 'Continue'}
          </button>
        </div>

      </div>
    </div>
  );
}


