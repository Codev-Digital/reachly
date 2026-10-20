'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { fromISODate, toISODate } from '@/lib/eventTicketing';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface DaysOfMonthProps {
  /** Selected dates as YYYY-MM-DD. */
  selectedDates: string[];
  /** The selected date that is being edited. It gets the strong blue highlight. */
  activeDate?: string | null;
  /** Called with the clicked date (YYYY-MM-DD). The parent decides whether that selects or removes it. */
  onDateClick: (isoDate: string) => void;
  /** Earlier days are disabled. Defaults to today. */
  minDate?: Date;
  /** How many years after the minimum year can be chosen. */
  yearsAhead?: number;
  /** How many years before the minimum year can still be browsed (their days are shown greyed out). */
  yearsBehind?: number;
  className?: string;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Month + year pickers on either side of a scrollable strip with every day of that month.
 * Supports selecting several days. Reusable anywhere a date (or dates) must be picked.
 */
export default function DaysOfMonth({
  selectedDates,
  activeDate,
  onDateClick,
  minDate,
  yearsAhead = 5,
  yearsBehind = 1,
  className,
}: DaysOfMonthProps) {
  const min = useMemo(() => startOfDay(minDate ?? new Date()), [minDate]);
  const minYear = min.getFullYear();
  const firstYear = minYear - yearsBehind;
  const maxYear = minYear + yearsAhead;

  const initial = activeDate ? fromISODate(activeDate) : selectedDates[0] ? fromISODate(selectedDates[0]) : min;
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());

  const stripRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  // Follow the active date when it changes from outside (e.g. a date chip was clicked)
  useEffect(() => {
    if (!activeDate) return;
    const d = fromISODate(activeDate);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }, [activeDate]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return { iso: toISODate(date), day: i + 1, weekday: WEEKDAYS[date.getDay()], disabled: date < min };
  });

  const atMinMonth = year === firstYear && month === 0;
  const atMaxMonth = year === maxYear && month === 11;

  const shiftMonth = (delta: number) => {
    let y = year;
    let m = month + delta;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    if (y < firstYear || y > maxYear) return;
    setYear(y);
    setMonth(m);
  };

  const shiftYear = (delta: number) => {
    const y = year + delta;
    if (y < firstYear || y > maxYear) return;
    setYear(y);
  };

  const updateScrollState = () => {
    const el = stripRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  };

  // Keep the strip position sensible: centre the active day, otherwise start from the first selectable day
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    // Centre the active day; with nothing active start from the 1st so past days stay visible
    const target = activeDate ? el.querySelector<HTMLElement>(`[data-date="${activeDate}"]`) : null;
    if (target) {
      el.scrollTo({ left: target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2, behavior: 'smooth' });
    } else {
      el.scrollTo({ left: 0 });
    }
    updateScrollState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, activeDate]);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, []);

  const scrollStrip = (direction: 1 | -1) => {
    const el = stripRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: 'smooth' });
  };

  const stepper = 'flex h-full w-5 shrink-0 items-center justify-center text-gray-400 transition-colors enabled:hover:text-[#0012FF] disabled:cursor-not-allowed disabled:opacity-30 enabled:cursor-pointer';
  const box = 'flex items-stretch rounded-[8px] border border-[#e2e2e2] bg-white';

  return (
    <div className={cn('flex flex-wrap items-stretch gap-2 sm:flex-nowrap', className)}>
      {/* Month */}
      <div className={cn(box, 'order-1 h-[52px] px-1.5')}>
        <button type="button" aria-label="Previous month" disabled={atMinMonth} onClick={() => shiftMonth(-1)} className={stepper}>
          <ChevronLeft size={14} />
        </button>
        <div className="flex min-w-[78px] flex-col items-center justify-center px-1 leading-tight" aria-live="polite">
          <span className="text-[9px] text-gray-400">Month</span>
          <span className="text-xs font-semibold text-black">{MONTH_NAMES[month]}</span>
        </div>
        <button type="button" aria-label="Next month" disabled={atMaxMonth} onClick={() => shiftMonth(1)} className={stepper}>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Days of the month */}
      <div className={cn(box, 'order-3 h-[52px] w-full min-w-0 items-center px-1 sm:order-2 sm:w-auto sm:flex-1')}>
        <button type="button" aria-label="Scroll days left" disabled={!canScroll.left} onClick={() => scrollStrip(-1)} className={stepper}>
          <ChevronLeft size={14} />
        </button>
        <div
          ref={stripRef}
          onScroll={updateScrollState}
          className="no-scrollbar relative flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
        >
          {days.map(({ iso, day, weekday, disabled }) => {
            const selected = selectedDates.includes(iso);
            const active = iso === activeDate;
            return (
              <button
                key={iso}
                type="button"
                data-date={iso}
                disabled={disabled}
                aria-pressed={selected}
                aria-label={`${weekday} ${day} ${MONTH_NAMES[month]} ${year}`}
                onClick={() => onDateClick(iso)}
                className={cn(
                  'flex h-9 min-w-[38px] flex-1 flex-col items-center justify-center rounded-[6px] leading-tight transition-colors',
                  disabled ? 'cursor-not-allowed text-gray-300' : 'cursor-pointer',
                  active
                    ? 'bg-[#0012FF] text-white'
                    : selected
                      ? 'bg-[#E8E6F8] text-black'
                      : !disabled && 'text-black hover:bg-gray-100'
                )}
              >
                <span className={cn('text-[9px]', active ? 'text-white/80' : disabled ? 'text-gray-300' : 'text-gray-400')}>{weekday}</span>
                <span className="text-[11px] font-medium">{String(day).padStart(2, '0')}</span>
              </button>
            );
          })}
        </div>
        <button type="button" aria-label="Scroll days right" disabled={!canScroll.right} onClick={() => scrollStrip(1)} className={stepper}>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Year */}
      <div className={cn(box, 'order-2 ml-auto h-[52px] px-1.5 sm:order-3 sm:ml-0')}>
        <button type="button" aria-label="Previous year" disabled={year <= firstYear} onClick={() => shiftYear(-1)} className={stepper}>
          <ChevronLeft size={14} />
        </button>
        <div className="flex min-w-[52px] flex-col items-center justify-center px-1 leading-tight" aria-live="polite">
          <span className="text-[9px] text-gray-400">Year</span>
          <span className="text-xs font-semibold text-black">{year}</span>
        </div>
        <button type="button" aria-label="Next year" disabled={year >= maxYear} onClick={() => shiftYear(1)} className={stepper}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
