'use client';

import type { ReactNode } from 'react';

type Props = {
  isMe: boolean;
  senderName: string;
  timeLabel: string;
  avatarUrl: string;
  children: ReactNode;
};

/** Mockup chat row: name/time above, 44px avatar, bubble/media content. */
export default function ChatMessageShell({
  isMe,
  senderName,
  timeLabel,
  avatarUrl,
  children,
}: Props) {
  return (
    <div className={`flex w-full flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      <div
        className={`mb-1.5 flex max-w-[85%] items-center gap-1.5 ${
          isMe ? 'justify-end' : 'justify-start'
        }`}
      >
        {isMe ? (
          <>
            <span
              className="font-[family-name:var(--font-inter)] text-[10px] font-normal leading-[10px] text-[#6D6D6D]"
              style={{ fontFamily: 'Inter, var(--font-inter), sans-serif' }}
            >
              {timeLabel}
            </span>
            <span
              className="font-[family-name:var(--font-inter)] text-[12px] font-medium leading-[12px] text-black"
              style={{ fontFamily: 'Inter, var(--font-inter), sans-serif' }}
            >
              {senderName}
            </span>
          </>
        ) : (
          <>
            <span
              className="font-[family-name:var(--font-inter)] text-[12px] font-medium leading-[12px] text-black"
              style={{ fontFamily: 'Inter, var(--font-inter), sans-serif' }}
            >
              {senderName}
            </span>
            <span
              className="font-[family-name:var(--font-inter)] text-[10px] font-normal leading-[10px] text-[#6D6D6D]"
              style={{ fontFamily: 'Inter, var(--font-inter), sans-serif' }}
            >
              {timeLabel}
            </span>
          </>
        )}
      </div>

      <div className={`flex max-w-[85%] items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
        <div
          className="mb-0.5 shrink-0 overflow-hidden rounded-full bg-gray-200"
          style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
        >
          <img
            src={avatarUrl}
            alt=""
            className="object-cover"
            style={{ width: 44, height: 44 }}
          />
        </div>
        <div className="relative min-w-0">{children}</div>
      </div>
    </div>
  );
}

/** Text bubble styles matching the chat mockup. */
export function chatTextBubbleClass(isMe: boolean) {
  return [
    'inline-block min-w-[80px] break-words px-4 py-2.5 text-[14px] font-normal leading-[24px] text-black',
    isMe
      ? 'rounded-[8px] rounded-tr-none bg-[#E6E6F7]'
      : 'rounded-[8px] rounded-tl-none bg-[#F8F8F8]',
  ].join(' ');
}
