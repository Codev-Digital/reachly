'use client';

import { useState, useEffect, useRef } from 'react';

export default function CustomSelect({
  value,
  options,
  onChange,
  label,
  placeholder,
  buttonClassName,
  buttonBg = '#141414',
  textSize = 'text-sm',
  iconColor = '#C8A97E',
  containerClassName,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  buttonClassName?: string;
  buttonBg?: string;
  textSize?: string;
  iconColor?: string;
  containerClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative flex-1 min-w-[120px] ${containerClassName}`} ref={containerRef}>
      {label && (
        <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
          {label}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border border-[rgba(200,169,126,0.3)] rounded-xl px-4 py-3 font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E] hover:border-[rgba(200,169,126,0.4)] transition-all ${textSize} ${buttonClassName}`}
        style={{ backgroundColor: buttonBg }}
      >
        <span>{selectedOption?.label || placeholder || 'Select...'}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl overflow-hidden z-50 shadow-2xl">
         <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-sans transition-all ${
                  option.value === value
                    ? 'bg-[#C8A97E] text-[#0C0C0C]'
                    : 'text-[#F9F6F2] opacity-70 hover:bg-[rgba(200,169,126,0.1)] hover:opacity-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
