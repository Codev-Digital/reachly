'use client';

import { CalendarDays, X } from 'lucide-react';
import DaysOfMonth from '@/components/DaysOfMonth';
import Dropdown from '@/components/Dropdown';
import TimePicker from '@/components/TimePicker';
import { FormError, FormLabel } from '@/components/FormInput';
import { cn } from '@/lib/cn';
import {
  DAY_PERIODS,
  cloneTiersForDate,
  emptyDay,
  longDateLabel,
  pickTierTemplateDay,
  shortDateLabel,
  type DayPeriod,
  type EventDayData,
  type TicketingValues,
} from '@/lib/eventTicketing';

export interface ScheduleSlotsErrors {
  dates?: string;
  times?: string;
}

interface ScheduleSlotsFieldsProps {
  /** Full ticketing values — dates, days (times + tiers) are read & written here. */
  values: TicketingValues;
  onChange: (next: TicketingValues) => void;
  errors?: ScheduleSlotsErrors;
  clearError?: (key: keyof ScheduleSlotsErrors) => void;
}

function TimeField({
  label,
  hour,
  minute,
  period,
  onTimeChange,
  onPeriodChange,
  error,
  hint,
}: {
  label: string;
  hour: string;
  minute: string;
  period: DayPeriod;
  onTimeChange: (hour: string, minute: string) => void;
  onPeriodChange: (period: DayPeriod) => void;
  error?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <FormLabel required>{label}</FormLabel>
      <div className="flex items-start gap-3">
        <TimePicker
          hour={hour}
          minute={minute}
          onChange={onTimeChange}
          ariaLabel={label}
          placeholder={`Select ${label.toLowerCase()}`}
          error={error}
          wrapperClassName="min-w-0 flex-1"
        />
        <Dropdown
          options={DAY_PERIODS}
          value={period}
          direction="up"
          onChange={(p) => onPeriodChange(p as DayPeriod)}
          wrapperClassName="w-[92px] shrink-0"
        />
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

export default function ScheduleSlotsFields({
  values,
  onChange,
  errors = {},
  clearError,
}: ScheduleSlotsFieldsProps) {
  const { dates, activeDate, days } = values;

  const day: EventDayData | undefined = activeDate ? days[activeDate] : undefined;

  const removeDate = (iso: string) => {
    const nextDates = dates.filter((d) => d !== iso);
    const { [iso]: _removed, ...nextDays } = days;
    onChange({
      ...values,
      dates: nextDates,
      activeDate: activeDate === iso ? (nextDates[nextDates.length - 1] ?? null) : activeDate,
      days: nextDays,
    });
  };

  const handleDateClick = (iso: string) => {
    if (!dates.includes(iso)) {
      const template = pickTierTemplateDay(days, activeDate);
      const seeded: EventDayData = {
        ...emptyDay(),
        tiers: template ? cloneTiersForDate(template.tiers) : [],
      };
      onChange({
        ...values,
        dates: [...dates, iso].sort(),
        activeDate: iso,
        days: { ...days, [iso]: days[iso] ?? seeded },
      });
      clearError?.('dates');
    } else if (activeDate !== iso) {
      onChange({ ...values, activeDate: iso });
    } else {
      removeDate(iso);
    }
  };

  const updateDay = (patch: Partial<EventDayData>) => {
    if (!activeDate || !day) return;
    onChange({ ...values, days: { ...days, [activeDate]: { ...day, ...patch } } });
    clearError?.('times');
  };

  return (
    <div className="space-y-5">
      {/* Calendar */}
      <div>
        <FormLabel required>Event Date(s)</FormLabel>
        <DaysOfMonth
          selectedDates={dates}
          activeDate={activeDate}
          onDateClick={handleDateClick}
        />

        {errors.dates && (
          <FormError className="mt-2.5">{errors.dates}</FormError>
        )}

        {dates.length === 0 ? (
          <p className="mt-2 text-xs text-gray-400">
            Pick the day(s) your event runs. For a multi-day event, select every day.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {dates.map((iso) => {
              const active = iso === activeDate;
              return (
                <span
                  key={iso}
                  className={cn(
                    'inline-flex items-center overflow-hidden rounded-full border text-xs font-medium transition-colors',
                    active
                      ? 'border-[#0012FF] bg-[#0012FF] text-white'
                      : 'border-[#C9CCF5] bg-[#E8E6F8] text-black'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleDateClick(iso)}
                    className="cursor-pointer py-1.5 pl-3 pr-1.5"
                    title={active ? 'Click to remove this date' : 'Click to set time for this date'}
                  >
                    {shortDateLabel(iso)}
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${shortDateLabel(iso)}`}
                    onClick={() => removeDate(iso)}
                    className="cursor-pointer py-1.5 pl-0.5 pr-2.5 opacity-70 hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
            <span className="text-[11px] text-gray-400">
              {dates.length} {dates.length === 1 ? 'date' : 'dates'} selected
            </span>
          </div>
        )}
      </div>

      {/* Time pickers for the active date */}
      {activeDate && day && (
        <div
          className={cn(
            'space-y-4 rounded-[10px] border bg-white p-4 transition-colors',
            errors.times ? 'border-red-400 ring-1 ring-red-400' : 'border-[#e2e2e2]'
          )}
        >
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CalendarDays size={14} className="shrink-0 text-[#0012FF]" />
            <span>
              Time for{' '}
              <span className="font-semibold text-black">{longDateLabel(activeDate)}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TimeField
              label="Start Time"
              hour={day.startHour}
              minute={day.startMinute}
              period={day.startPeriod}
              error={!!errors.times && !day.startHour}
              onTimeChange={(startHour, startMinute) => updateDay({ startHour, startMinute })}
              onPeriodChange={(startPeriod) => updateDay({ startPeriod })}
            />
            <TimeField
              label="End Time"
              hour={day.endHour}
              minute={day.endMinute}
              period={day.endPeriod}
              error={!!errors.times && !day.endHour}
              onTimeChange={(endHour, endMinute) => updateDay({ endHour, endMinute })}
              onPeriodChange={(endPeriod) => updateDay({ endPeriod })}
            />
          </div>

          {errors.times && (
            <FormError className="mt-1">{errors.times}</FormError>
          )}
        </div>
      )}

      {/* Prompt when no dates yet */}
      {dates.length === 0 && (
        <div
          className={cn(
            'rounded-[8px] border border-dashed px-4 py-8 text-center transition-colors',
            errors.dates ? 'border-red-500 bg-red-50/20' : 'border-[#e2e2e2] bg-[#F8F8F8]'
          )}
        >
          <p className={cn('text-sm font-medium', errors.dates ? 'text-red-600 font-semibold' : 'text-gray-500')}>
            No dates selected yet
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Use the calendar above to pick your event date(s).
          </p>
        </div>
      )}
    </div>
  );
}
