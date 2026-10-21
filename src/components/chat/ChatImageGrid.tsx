'use client';

import type { ChatAttachment } from '@/lib/chatAttachments';

type Props = {
  images: ChatAttachment[];
  onOpen: (index: number) => void;
  onLoad?: () => void;
};

/** Single image or 2×2 album grid with +N overlay — no background chrome. */
export default function ChatImageGrid({ images, onOpen, onLoad }: Props) {
  if (!images.length) return null;

  if (images.length === 1) {
    return (
      <button
        type="button"
        onClick={() => onOpen(0)}
        className="block overflow-hidden rounded-[8px] focus:outline-none"
      >
        <img
          src={images[0].url}
          alt={images[0].fileName || 'Attachment'}
          className="max-h-[260px] max-w-[280px] cursor-pointer object-cover transition-opacity hover:opacity-95"
          onLoad={onLoad}
        />
      </button>
    );
  }

  const visible = images.slice(0, 4);
  const extra = images.length - 4;

  return (
    <div className="grid w-[220px] grid-cols-2 gap-1.5 sm:w-[240px]">
      {visible.map((img, i) => {
        const showOverlay = i === 3 && extra > 0;
        return (
          <button
            key={`${img.url}-${i}`}
            type="button"
            onClick={() => onOpen(showOverlay ? 3 : i)}
            className="relative aspect-square overflow-hidden rounded-[8px] focus:outline-none"
          >
            <img
              src={img.url}
              alt={img.fileName || `Image ${i + 1}`}
              className="h-full w-full object-cover transition-opacity hover:opacity-95"
              onLoad={i === 0 ? onLoad : undefined}
            />
            {showOverlay && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xl font-bold tracking-tight text-white">
                +{extra}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
