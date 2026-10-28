'use client';

import Image from 'next/image';
import { Mail, AlertTriangle, Copy, Check, Calendar, User, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export interface RejectedBookingInfo {
  id?: string | number;
  bookingRef?: string;
  ref?: string;
  creator?: string;
  date?: string;
  shortDate?: string;
  time?: string;
  scheduledDate?: string | Date;
  scheduledTime?: string;
  price?: string | number;
  adminRemarks?: string;
  [key: string]: any;
}

interface PaymentRejectedDialogProps {
  booking: RejectedBookingInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminEmail?: string;
}

export default function PaymentRejectedDialog({
  booking,
  open,
  onOpenChange,
  adminEmail = 'admin@reachly.com',
}: PaymentRejectedDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const bookingReference = booking.bookingRef || booking.ref || 'N/A';
  const creatorName = booking.creator || 'Creator';
  const displayDate = booking.date || booking.shortDate || (booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'N/A');
  const displayTime = booking.time || booking.scheduledTime || '';
  const displayPrice = typeof booking.price === 'number' ? `PKR ${booking.price.toLocaleString()}` : (booking.price || 'N/A');
  const reasonText = booking.adminRemarks?.trim() || 'The submitted payment proof could not be verified by the admin team.';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopied(true);
    toast.success('Admin email copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoSubject = encodeURIComponent(`Payment Rejected Inquiry - Booking ${bookingReference}`);
  const mailtoBody = encodeURIComponent(
    `Hello Admin,\n\nI am contacting you regarding my rejected payment for booking reference ${bookingReference} with ${creatorName}.\n\nReason stated: ${reasonText}\n\nPlease advise on next steps.\n\nThank you.`
  );
  const mailtoHref = `mailto:${adminEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-poppins max-w-md max-h-[92vh] overflow-y-auto rounded-[32px] p-6 sm:p-8 text-center">
        {/* Illustration Artwork */}
        <div className="w-28 sm:w-36 aspect-[3/2] mx-auto mt-1 mb-3">
          <Image
            src="/assets/cancel-appointment-sm.webp"
            alt="Payment Rejected"
            width={180}
            height={120}
            unoptimized
            loading="eager"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Header */}
        <DialogTitle className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
          Payment Rejected
        </DialogTitle>
        <DialogDescription className="text-xs text-gray-400 font-medium mt-1 mb-4 leading-relaxed">
          Your payment verification for this session was not approved by the admin team.
        </DialogDescription>

        {/* Admin Remarks Box */}
        <div className="w-full bg-rose-50/90 border border-rose-200 rounded-2xl p-4 text-left mb-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-rose-700 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Admin Remarks / Reason</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-950 font-bold leading-relaxed break-words whitespace-pre-line">
            {reasonText}
          </p>
        </div>

        {/* Booking Details Breakdown */}
        {/* <div className="w-full bg-gray-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-gray-100 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Booking Ref</span>
            <span className="font-bold text-gray-900">{bookingReference}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Creator</span>
            <span className="font-bold text-gray-900">{creatorName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Session Date</span>
            <span className="font-bold text-gray-900">
              {displayDate} {displayTime ? `at ${displayTime}` : ''}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Amount</span>
            <span className="font-bold text-[#0012FF]">{displayPrice}</span>
          </div>
        </div> */}

        {/* Admin Email Box */}
        <div className="w-full bg-[#0012FF]/5 border border-[#0012FF]/15 rounded-2xl p-3.5 text-left flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#0012FF]/10 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-[#0012FF]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin Contact</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{adminEmail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="shrink-0 text-xs font-bold text-[#0012FF] hover:bg-[#0012FF]/10 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy admin email"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
          <a
            href={mailtoHref}
            className="flex-1 py-3 bg-[#0012FF] hover:bg-[#000EB4] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-[#0012FF]/20"
          >
            <Mail className="w-3.5 h-3.5" />
            Contact Admin
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
