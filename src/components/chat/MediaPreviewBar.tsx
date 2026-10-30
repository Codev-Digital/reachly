'use client';

import React, { useEffect, useState } from 'react';
import { formatFileSizeMb } from '@/lib/chatAttachments';

interface MediaPreviewThumbProps {
  file: File;
  onRemove: () => void;
}

function MediaPreviewThumb({ file, onRemove }: MediaPreviewThumbProps) {
  const [objectUrl, setObjectUrl] = useState<string>('');

  useEffect(() => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const isImg = file.type.startsWith('image/');
  const isVid = file.type.startsWith('video/');

  return (
    <div className="relative group shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-white flex flex-col items-center justify-center shadow-xs">
      {isImg && objectUrl ? (
        <img src={objectUrl} alt={file.name} className="w-full h-full object-cover" />
      ) : isVid && objectUrl ? (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <video src={objectUrl} className="w-full h-full object-cover opacity-80" />
          <span className="absolute inset-0 flex items-center justify-center text-white/90">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </span>
        </div>
      ) : (
        <div className="w-full h-full p-2 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-[9px] font-semibold text-center truncate max-w-full px-1 mt-1 text-gray-700">
            {file.name}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer"
        title="Remove file"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

interface MediaPreviewBarProps {
  files: File[];
  onRemove: (index: number) => void;
  onClear: () => void;
  onAddMore: () => void;
}

export default function MediaPreviewBar({
  files,
  onRemove,
  onClear,
  onAddMore,
}: MediaPreviewBarProps) {
  if (!files || files.length === 0) return null;

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const isAllImages = files.length > 0 && files.every((f) => f.type.startsWith('image/'));

  return (
    <div className="mb-2.5 p-2.5 bg-gray-50/90 border border-gray-200/80 rounded-2xl shadow-xs transition-all">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">
            {files.length === 1 ? '1 attachment' : `${files.length} attachments`}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">
            ({formatFileSizeMb(totalSize)})
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-red-50 cursor-pointer"
          title="Cancel all attachments"
        >
          <span>Cancel</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto py-0.5 scrollbar-thin">
        {files.map((file, idx) => (
          <MediaPreviewThumb
            key={`${file.name}-${idx}`}
            file={file}
            onRemove={() => onRemove(idx)}
          />
        ))}

        {isAllImages && files.length < 10 && (
          <button
            type="button"
            onClick={onAddMore}
            className="shrink-0 w-20 h-20 rounded-xl border border-dashed border-gray-300 hover:border-[#0012FF] bg-white hover:bg-[#0012FF]/5 flex flex-col items-center justify-center text-gray-400 hover:text-[#0012FF] transition-all cursor-pointer"
            title="Add more images"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-[10px] font-semibold mt-1">Add</span>
          </button>
        )}
      </div>
    </div>
  );
}
