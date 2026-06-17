'use client';

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  sessionName,
  creatorName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sessionName?: string;
  creatorName?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="font-serif text-xl font-semibold text-[#F9F6F2] mb-2">Cancel this booking?</h2>
        <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-6">
          Are you sure you want to cancel your {sessionName} with {creatorName}? If cancelled more than 24 hours before the session, you will receive a full refund.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2.5 rounded-full text-sm font-sans"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-[#f87171] text-[#0C0C0C] px-4 py-2.5 rounded-full text-sm font-sans font-semibold hover:opacity-90 transition-all"
          >
            Yes, cancel
          </button>
        </div>
      </div>
    </div>
  );
}
