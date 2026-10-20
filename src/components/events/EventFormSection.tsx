'use client';

import { useId, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface EventFormSectionProps {
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** Collapsible card used by the create-event page. The body slides open and closed. */
export default function EventFormSection({
  title,
  description,
  open,
  onToggle,
  children,
}: EventFormSectionProps) {
  const panelId = useId();

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#e2e2e2] bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
      >
        <span className="min-w-0">
          <span className="block text-base font-semibold text-black sm:text-lg">{title}</span>
          <span className="mt-0.5 block text-xs text-gray-400 sm:text-[13px]">{description}</span>
        </span>
        <ChevronDown
          size={18}
          className={cn(
            'shrink-0 text-gray-400 transition-transform duration-300',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#e2e2e2] px-5 pb-6 pt-5 sm:px-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
