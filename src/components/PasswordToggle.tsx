'use client';

import { Eye, EyeOff } from 'lucide-react';

export default function PasswordToggle({
  visible,
  onToggle,
  className = 'top-1/2 -translate-y-1/2',
}: {
  visible: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`absolute right-4 text-gray-400 hover:text-gray-600 cursor-pointer ${className}`}
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <Eye className="w-[18px] h-[18px]" /> : <EyeOff className="w-[18px] h-[18px]" />}
    </button>
  );
}
