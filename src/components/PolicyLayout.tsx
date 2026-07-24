'use client';

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import React from 'react';

interface PolicyLayoutProps {
  title: string;
  lastUpdated?: string;
  markdownContent: string;
}

function parseInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderMarkdown(md: string) {
  const lines = md.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={key} className="list-disc list-inside space-y-2.5 text-[#CBD5E1] text-sm sm:text-base mb-6 pl-1 font-sans">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`list-${idx}`);
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList(`list-${idx}`);
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList(`list-${idx}`);
      const heading = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h2 key={idx} className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4 tracking-tight pt-2 font-sans">
          {parseInline(heading)}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList(`list-${idx}`);
      const heading = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h3 key={idx} className="text-lg sm:text-xl font-bold text-white mt-6 mb-3 tracking-tight font-sans">
          {parseInline(heading)}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    }

    flushList(`list-${idx}`);
    if (trimmed.startsWith('**Last updated:**')) {
      return;
    }

    elements.push(
      <p key={idx} className="text-[#CBD5E1] text-sm sm:text-base leading-relaxed mb-4 font-sans font-normal">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList('list-end');
  return elements;
}

export default function PolicyLayout({ title, lastUpdated = 'July 9, 2026', markdownContent }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col justify-between overflow-x-hidden selection:bg-[#0012FF] selection:text-white">
      
      {/* Background glow accents */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#0012FF]/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[#E32A2A]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Main Top Header & Body */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-16 flex-1">
        
        {/* Top Header Row */}
        <div className="relative flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-lg">←</span> Back to home
          </Link>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 cursor-pointer">
            <Image
              src="/assets/logo.png"
              alt="Reachly Logo"
              width={120}
              height={44}
              className="h-9 sm:h-11 w-auto object-contain"
              priority
            />
          </Link>
          <div className="w-24 sm:w-32" />
        </div>

        {/* Policy Document Dark Card */}
        <div className="max-w-4xl mx-auto bg-[#0E1326]/90 backdrop-blur-xl border border-white/10 rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 md:p-12 shadow-2xl">
          {/* Header Title */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-2 font-sans">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-medium font-sans">
              Last updated: <span className="text-white font-semibold">{lastUpdated}</span>
            </p>
          </div>

          <div className="w-full border-t border-white/10 my-6" />

          {/* Rendered Markdown Body */}
          <div className="prose prose-invert max-w-none font-sans">
            {renderMarkdown(markdownContent)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
