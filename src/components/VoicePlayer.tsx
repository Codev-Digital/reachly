'use client';

import React, { useState, useRef, useEffect } from 'react';

interface VoicePlayerProps {
  url: string;
  isMe: boolean;
  timeStr: string;
  readStatus?: React.ReactNode;
}

export default function VoicePlayer({ url, isMe, timeStr, readStatus }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error('Play failed:', err));
      setIsPlaying(true);
    }
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`flex flex-col gap-1 p-3.5 pb-2 rounded-[24px] shadow-sm select-none border min-w-[250px] max-w-[280px] ${isMe
        ? 'bg-[#E6E8FF] border-[#E6E8FF] rounded-br-sm'
        : 'bg-white border-gray-100 rounded-bl-sm'
      }`}>
      {/* Player controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-[#0012FF] hover:bg-[#0010d0] text-white flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-sm"
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="translate-x-[1px]"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <style>{`
            input[type=range].voice-range::-webkit-slider-thumb { background: #0012FF !important; }
            input[type=range].voice-range::-moz-range-thumb { background: #0012FF !important; border: none; }
            input[type=range].voice-range::-ms-thumb { background: #0012FF !important; }
          `}</style>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleTimelineChange}
            className="voice-range w-full h-1 bg-gray-200/70 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#0012FF' }}
          />
          <div className="flex justify-between text-[9px] text-gray-400 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Footer (Time & Read ticks) */}
      <div className="flex justify-end items-center gap-1 text-[10px] text-gray-400 font-medium mt-1 select-none">
        <span>{timeStr}</span>
        {isMe && readStatus && (
          <span className="inline-flex shrink-0">
            {readStatus}
          </span>
        )}
      </div>
    </div>
  );
}
