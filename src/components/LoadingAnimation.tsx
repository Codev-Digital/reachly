'use client';

export default function LoadingAnimation() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#0012FF]/20 border-t-[#0012FF] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-400 tracking-wide font-sans">Loading...</span>
      </div>
    </div>
  );
}
