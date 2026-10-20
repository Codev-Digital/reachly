'use client';

import { Plus, Trash2 } from 'lucide-react';
import { INPUT_CLASSES } from '@/components/FormInput';
import { cn } from '@/lib/cn';
import type { EventDayData } from '@/lib/eventTicketing';
import {
  MAX_SLOTS_PER_DATE,
  SLOT_ACCENTS,
  SLOT_DESCRIPTION_MAX_LENGTH,
  emptySlot,
  formatDayStartTime,
  slotDateDayMonth,
  slotDateWeekday,
  type ScheduleSlot,
  type ScheduleSlotsValues,
} from '@/lib/eventSlots';

interface ScheduleSlotsFieldsProps {
  /** Dates chosen in Ticketing & Pricing (YYYY-MM-DD), already sorted. */
  dates: string[];
  /** Category chosen in Ticketing & Pricing — shown on every slot row. */
  category: string;
  /** Per-date times from Ticketing; each slot shows that day's starting time. */
  days: Record<string, EventDayData>;
  values: ScheduleSlotsValues;
  onChange: (next: ScheduleSlotsValues) => void;
}

/** One schedule row: coloured bar, start time, category, optional description, delete. */
function SlotRow({
  startTime,
  category,
  slot,
  accent,
  canDelete,
  onChange,
  onDelete,
}: {
  startTime: string;
  category: string;
  slot: ScheduleSlot;
  accent: string;
  canDelete: boolean;
  onChange: (patch: Partial<ScheduleSlot>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#e2e2e2] bg-white">
      <div className="flex items-stretch">
        <span className="w-1 shrink-0" style={{ backgroundColor: accent }} aria-hidden="true" />

        <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-3 sm:px-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Start time from Ticketing — display only, no dropdown */}
            <span
              className={cn(
                'shrink-0 text-sm font-semibold tabular-nums',
                startTime ? 'text-black' : 'text-gray-300'
              )}
            >
              {startTime || '—:— —'}
            </span>

            <span
              className={cn(
                'min-w-0 flex-1 truncate text-sm',
                category ? 'text-gray-500' : 'text-gray-300'
              )}
            >
              {category || 'Select a category in Ticketing'}
            </span>

            <button
              type="button"
              aria-label="Delete slot"
              disabled={!canDelete}
              onClick={onDelete}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-300"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {slot.showDescription || slot.description ? (
            <div>
              <textarea
                value={slot.description}
                maxLength={SLOT_DESCRIPTION_MAX_LENGTH}
                onChange={(e) => onChange({ description: e.target.value, showDescription: true })}
                placeholder="Add a short description for this slot"
                rows={2}
                className={cn(INPUT_CLASSES, 'resize-none px-3 py-2 text-xs leading-relaxed')}
                autoFocus={!slot.description}
              />
              <div className="mt-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ showDescription: false, description: '' })}
                  className="cursor-pointer text-[11px] font-medium text-gray-400 hover:text-red-500"
                >
                  Remove description
                </button>
                <span className="text-[11px] text-gray-400">
                  {slot.description.length}/{SLOT_DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onChange({ showDescription: true })}
              className="inline-flex w-fit cursor-pointer items-center gap-1 text-xs font-semibold text-[#0012FF] hover:text-[#0010d0]"
            >
              <Plus size={12} strokeWidth={2.5} />
              Add Description
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * "Schedule Slots" step. Dates, start time and category come from Ticketing & Pricing.
 * Creators only add descriptions (and extra slots) here.
 */
export default function ScheduleSlotsFields({
  dates,
  category,
  days,
  values,
  onChange,
}: ScheduleSlotsFieldsProps) {
  if (dates.length === 0) {
    return (
      <div className="rounded-[8px] border border-dashed border-[#e2e2e2] bg-[#F8F8F8] px-4 py-10 text-center">
        <p className="text-sm font-medium text-gray-500">No dates selected yet</p>
        <p className="mt-1 text-xs text-gray-400">
          Pick one or more dates in Ticketing & Pricing, then come back to schedule their slots.
        </p>
      </div>
    );
  }

  const updateSlot = (iso: string, id: string, patch: Partial<ScheduleSlot>) => {
    onChange({
      ...values,
      [iso]: (values[iso] ?? []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const deleteSlot = (iso: string, id: string) => {
    const list = values[iso] ?? [];
    if (list.length <= 1) return;
    onChange({ ...values, [iso]: list.filter((s) => s.id !== id) });
  };

  const addSlot = (iso: string) => {
    const list = values[iso] ?? [];
    if (list.length >= MAX_SLOTS_PER_DATE) return;
    onChange({ ...values, [iso]: [...list, emptySlot()] });
  };

  let accentIndex = 0;

  return (
    <div className="space-y-5">
      {dates.map((iso) => {
        const slots = values[iso] ?? [];
        const startTime = formatDayStartTime(days[iso]);
        return (
          <div key={iso} className="space-y-2.5">
            {slots.map((slot, index) => {
              const accent = SLOT_ACCENTS[accentIndex % SLOT_ACCENTS.length];
              accentIndex += 1;
              return (
                <div key={slot.id} className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={cn(
                      'w-[84px] shrink-0 rounded-[8px] bg-[#F3F3F5] px-2 py-2 text-center sm:w-[96px]',
                      index > 0 && 'invisible'
                    )}
                    aria-hidden={index > 0}
                  >
                    <p className="text-xs font-bold leading-tight text-gray-700 sm:text-[13px]">
                      {slotDateDayMonth(iso)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-400 sm:text-[11px]">{slotDateWeekday(iso)}</p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <SlotRow
                      startTime={startTime}
                      category={category}
                      slot={slot}
                      accent={accent}
                      canDelete={slots.length > 1}
                      onChange={(patch) => updateSlot(iso, slot.id, patch)}
                      onDelete={() => deleteSlot(iso, slot.id)}
                    />
                  </div>
                </div>
              );
            })}

            {slots.length < MAX_SLOTS_PER_DATE && (
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-[84px] shrink-0 sm:w-[96px]" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => addSlot(iso)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#0012FF] hover:text-[#0010d0]"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  Add Slot
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
