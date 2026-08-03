'use client';

import { useEffect, useRef, useState } from 'react';
import DailyIframe, { DailyCall as DailyCallType } from '@daily-co/daily-js';
import { useRouter } from 'next/navigation';

export default function DailyCall({ url, onLeave }: { url: string; onLeave?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [callFrame, setCallFrame] = useState<DailyCallType | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;

    let newCallFrame = DailyIframe.getCallInstance();

    const initFrame = async () => {
      if (newCallFrame) {
        await newCallFrame.destroy();
      }

      newCallFrame = DailyIframe.createFrame(containerRef.current!, {
        showLeaveButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px',
        },
      });

      setCallFrame(newCallFrame);

      const handleLeave = () => {
        if (newCallFrame) newCallFrame.destroy();
        if (onLeave) {
          onLeave();
        } else {
          router.push('/');
        }
      };

      newCallFrame.on('left-meeting', handleLeave);
      await newCallFrame.join({ url });
    };

    initFrame();

    return () => {
      if (newCallFrame) {
        newCallFrame.destroy();
      }
    };
  }, [url, router, onLeave]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black p-0 md:p-10 flex flex-col items-center justify-center backdrop-blur-md">
      <div ref={containerRef} className="w-full h-full max-w-[1400px] bg-[#1a1a1a] md:rounded-[24px] shadow-2xl overflow-hidden" />
    </div>
  );
}
