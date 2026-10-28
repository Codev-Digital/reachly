'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { FormError, FormLabel } from '@/components/FormInput';
import { cn } from '@/lib/cn';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

/** Design size for the event banner (width × height). */
export const BANNER_WIDTH = 1200;
export const BANNER_HEIGHT = 400;

interface BannerUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  /** Existing uploaded banner URL (shown when there is no new local file). */
  previewUrl?: string | null;
  label?: string;
  required?: boolean;
  error?: string;
}

/**
 * Banner drop area locked to the 1200×400 (3:1) frame.
 * Uploaded images keep their aspect ratio inside that frame (no stretch).
 */
export default function BannerUpload({
  file,
  onChange,
  previewUrl,
  label,
  required,
  error,
}: BannerUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setLocalPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = localPreview || previewUrl || null;

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

  // Full width, fixed 300px height — image is fitted inside without stretching
  const frame = 'relative h-[300px] w-full overflow-hidden rounded-[8px]';

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
          e.target.value = '';
        }}
      />

      {shown ? (
        <div className={cn(frame, 'group border bg-[#F3F3F5]', error ? 'border-red-500' : 'border-[#e2e2e2]')}>
          {/* Cover the 300px frame; crop edges if needed so the banner always looks full */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shown}
            alt="Event banner preview"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
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
          <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white">
            {BANNER_WIDTH}×{BANNER_HEIGHT}
          </span>
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
          className={cn(
            frame,
            'flex cursor-pointer flex-col items-center justify-center gap-1 border border-dashed bg-[#E8E6F8] transition-colors',
            dragging ? 'border-[#0012FF]' : error ? 'border-red-500 ring-1 ring-red-500' : 'border-[#B8B0F0]'
          )}
        >
          <ImageIcon size={22} className="mb-1 text-[#0012FF]" />
          <span className="text-sm font-semibold text-black">Upload banner</span>
          <span className="text-[11px] text-gray-400">
            {BANNER_WIDTH}×{BANNER_HEIGHT}px recommended
          </span>
        </button>
      )}

      {error && <FormError className="mt-2">{error}</FormError>}
    </div>
  );
}
