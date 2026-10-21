'use client';

import type { ReactNode } from 'react';
import ChatImageGrid from '@/components/chat/ChatImageGrid';
import { formatFileSizeMb, type ChatAttachment } from '@/lib/chatAttachments';

type Props = {
  attachments: ChatAttachment[];
  isMe: boolean;
  readStatus?: ReactNode;
  onOpenImage: (images: ChatAttachment[], index: number) => void;
  onOpenVideo: (url: string) => void;
  onLoad?: () => void;
};

/** Media attachments — images have no bubble background (mockup). */
export default function ChatAttachmentBubble({
  attachments,
  isMe,
  readStatus,
  onOpenImage,
  onOpenVideo,
  onLoad,
}: Props) {
  if (!attachments.length) return null;

  const images = attachments.filter((a) => a.fileType === 'image');
  const videos = attachments.filter((a) => a.fileType === 'video');
  const docs = attachments.filter((a) => a.fileType === 'document' || a.fileType === 'pdf');
  const onlyImages = images.length > 0 && videos.length === 0 && docs.length === 0;

  return (
    <div className="relative flex flex-col gap-2">
      {images.length > 0 && (
        <ChatImageGrid
          images={images}
          onOpen={(index) => onOpenImage(images, index)}
          onLoad={onLoad}
        />
      )}

      {videos.map((vid) => (
        <button
          key={vid.url}
          type="button"
          className="group relative cursor-pointer overflow-hidden rounded-[8px]"
          onClick={() => onOpenVideo(vid.url)}
        >
          <video
            src={`${vid.url}#t=0.1`}
            preload="metadata"
            playsInline
            className="max-h-[240px] max-w-[240px] object-cover pointer-events-none"
            onLoadedMetadata={onLoad}
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-[8px] bg-black/10 transition-colors group-hover:bg-black/20">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1 text-gray-900">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </span>
          </span>
        </button>
      ))}

      {docs.map((doc) => (
        <a
          key={doc.url}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
            isMe
              ? 'rounded-[8px] rounded-tr-none bg-[#E6E6F7] hover:bg-[#dcdcF0]'
              : 'rounded-[8px] rounded-tl-none bg-[#F8F8F8] hover:bg-[#efefef]'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <div className="flex min-w-0 flex-col">
            <span className="max-w-[160px] truncate text-[14px] font-normal leading-[24px] text-black">
              {doc.fileName}
            </span>
            <span className="text-[10px] leading-[10px] text-[#6D6D6D]">
              {formatFileSizeMb(doc.fileSize || 0)}
            </span>
          </div>
        </a>
      ))}

      {isMe && readStatus && onlyImages && (
        <div className="flex justify-end pr-0.5">{readStatus}</div>
      )}
    </div>
  );
}
