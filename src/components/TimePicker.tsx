'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import { INPUT_CLASSES } from '@/components/FormInput';
import { cn } from '@/lib/cn';

/** Hours in natural order: 01 through 12. Overnight hours (01–07) appear at the top so 1 AM / 2 AM are easy to reach. */
export const HOUR_OPTIONS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

/** Minutes 00 to 59. */
export const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const POPUP_WIDTH = 200;
const POPUP_HEIGHT = 270; // used only to decide whether to open upwards

interface TimePickerProps {
  /** Hour as shown in the list ("08" ... "07"), or "" when nothing is chosen. */
  hour: string;
  /** Minute "00" ... "59", or "". */
  minute: string;
  onChange: (hour: string, minute: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  error?: boolean | string;
  disabled?: boolean;
  wrapperClassName?: string;
}

/**
 * One field that shows the chosen time as "hh:mm". Clicking it opens a popup with an hours column and a
 * minutes column. AM/PM is not part of this picker - put a separate AM/PM control next to it.
 */
export default function TimePicker({
  hour,
  minute,
  onChange,
  placeholder = 'Select time',
  ariaLabel,
  error,
  disabled,
  wrapperClassName,
}: TimePickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [draftHour, setDraftHour] = useState(hour);
  const [draftMinute, setDraftMinute] = useState(minute);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPUP_WIDTH - 8));
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < POPUP_HEIGHT && rect.top > spaceBelow;
    setStyle(
      openUp
        ? { left, bottom: window.innerHeight - rect.top + 6 }
        : { left, top: rect.bottom + 6 }
    );
  }, []);

  const openPopup = () => {
    if (disabled) return;
    setDraftHour(hour);
    setDraftMinute(minute);
    place();
    setOpen(true);
  };

  const close = () => setOpen(false);

  // Close on outside click / Escape; keep the popup attached to the field while scrolling or resizing
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popupRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  // Bring the chosen hour / minute into view when the popup opens
  useLayoutEffect(() => {
    if (!open) return;
    [hoursRef.current, minutesRef.current].forEach((column) => {
      const selected = column?.querySelector<HTMLElement>('[data-selected="true"]');
      if (column && selected) column.scrollTop = selected.offsetTop - column.clientHeight / 2 + selected.clientHeight / 2;
    });
  }, [open]);

  const pickHour = (h: string) => {
    setDraftHour(h);
    if (!draftMinute) setDraftMinute('00');
  };

  const done = () => {
    if (!draftHour) return;
    onChange(draftHour, draftMinute || '00');
    close();
    triggerRef.current?.focus();
  };

  const reset = () => {
    setDraftHour('');
    setDraftMinute('');
    onChange('', '');
    close();
  };

  const pill = (selected: boolean) =>
    cn(
      'h-7 w-full shrink-0 cursor-pointer rounded-[8px] text-xs font-medium transition-colors',
      selected ? 'bg-[#0012FF] text-white' : 'bg-[#F4F6FF] text-gray-700 hover:bg-[#E8E9FB]'
    );

  const display = hour ? `${hour}:${minute || '00'}` : '';

  return (
    <div className={wrapperClassName}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : openPopup())}
        className={cn(
          INPUT_CLASSES,
          'relative flex items-center justify-between px-4 text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
          open && 'border-[#0012FF]',
          error && 'border-red-500 focus:border-red-500'
        )}
      >
        <span className={cn('block truncate', !display && 'text-gray-400')}>{display || placeholder}</span>
        <Clock size={16} className="ml-2 shrink-0 text-gray-400" aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <div
            ref={popupRef}
            role="dialog"
            aria-label={ariaLabel ?? 'Choose time'}
            style={{ ...style, width: POPUP_WIDTH }}
            className="fixed z-[100] rounded-[12px] border border-[#e2e2e2] bg-white p-2.5 shadow-xl"
          >
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { title: 'Hours', options: HOUR_OPTIONS, value: draftHour, ref: hoursRef, set: pickHour },
                  { title: 'Minutes', options: MINUTE_OPTIONS, value: draftMinute, ref: minutesRef, set: setDraftMinute },
                ] as const
              ).map((column) => (
                <div key={column.title} className="min-w-0">
                  <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {column.title}
                  </p>
                  <div
                    ref={column.ref}
                    className="no-scrollbar relative flex max-h-[168px] flex-col gap-1.5 overflow-y-auto"
                  >
                    {column.options.map((option) => {
                      const selected = option === column.value;
                      return (
                        <button
                          key={option}
                          type="button"
                          data-selected={selected}
                          aria-pressed={selected}
                          onClick={() => column.set(option)}
                          className={pill(selected)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2.5 flex gap-2 border-t border-[#e2e2e2] pt-2.5">
              <button
                type="button"
                onClick={reset}
                className="h-8 flex-1 cursor-pointer rounded-[8px] border border-[#e2e2e2] bg-white text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={done}
                disabled={!draftHour}
                className="h-8 flex-1 cursor-pointer rounded-[8px] bg-[#0012FF] text-xs font-semibold text-white transition-colors hover:bg-[#0010d0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Done
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
