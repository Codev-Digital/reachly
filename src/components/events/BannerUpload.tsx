'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { FormError, FormLabel } from '@/components/FormInput';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

interface BannerUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

/** Dashed drop area for the event banner. Shows a local preview only (nothing is uploaded yet). */
export default function BannerUpload({ file, onChange, label, required, error }: BannerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (selected?: File | null) => {
    if (!selected) return;
    if (!ACCEPTED.includes(selected.type)) {
      toast.error('Please choose a JPG, PNG or WebP image.');
      return;
    }
    if (selected.size > MAX_BYTES) {
      toast.error('The banner must be smaller than 5 MB.');
      return;
    }
    onChange(selected);
  };

  return (
    <div>
      {label && (
        <FormLabel required={required} htmlFor="event-banner">
          {label}
        </FormLabel>
      )}

      <input
        ref={inputRef}
        id="event-banner"
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = ''; // allow re-selecting the same file
        }}
      />

      {preview ? (
        <div className="group relative h-[180px] w-full overflow-hidden rounded-[8px] border border-[#e2e2e2] bg-gray-100 sm:h-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Event banner preview" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-gray-100"
            >
              Change
            </button>
          </div>
          <button
            type="button"
            aria-label="Remove banner"
            onClick={() => onChange(null)}
            className="absolute right-3 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          className={`flex h-[180px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed bg-[#E8E6F8] transition-colors sm:h-[200px] ${
            dragging ? 'border-[#0012FF]' : error ? 'border-red-400' : 'border-[#B8B0F0]'
          }`}
        >
          <ImageIcon size={22} className="mb-1 text-[#0012FF]" />
          <span className="text-sm font-semibold text-black">Upload banner</span>
          <span className="text-[11px] text-gray-400">1200×400px recommended</span>
        </button>
      )}

      {error && <FormError className="mt-2">{error}</FormError>}
    </div>
  );
}
