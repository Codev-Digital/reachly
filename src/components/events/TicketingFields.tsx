'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Pencil, Plus, Trash2, X } from 'lucide-react';
import DaysOfMonth from '@/components/DaysOfMonth';
import Dropdown from '@/components/Dropdown';
import TimePicker from '@/components/TimePicker';
import FormInput, { FormLabel } from '@/components/FormInput';
import AddTierDialog from '@/components/events/AddTierDialog';
import { InfoTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { digitsOnly } from '@/lib/sessionForm';
import {
  DAY_PERIODS,
  EVENT_CATEGORIES,
  MAX_TIERS_PER_DATE,
  cloneTiersForDate,
  emptyDay,
  formatPrice,
  longDateLabel,
  newTierId,
  pickTierTemplateDay,
  shortDateLabel,
  type DayPeriod,
  type EventDayData,
  type EventTier,
  type TicketingValues,
  type TierFormValues,
} from '@/lib/eventTicketing';

interface TicketingFieldsProps {
  values: TicketingValues;
  onChange: (next: TicketingValues) => void;
}

function TimeField({
  label,
  hour,
  minute,
  period,
  onTimeChange,
  onPeriodChange,
}: {
  label: string;
  hour: string;
  minute: string;
  period: DayPeriod;
  onTimeChange: (hour: string, minute: string) => void;
  onPeriodChange: (period: DayPeriod) => void;
}) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <div className="flex items-start gap-3">
        {/* one field; its popup has an hours column and a minutes column */}
        <TimePicker
          hour={hour}
          minute={minute}
          onChange={onTimeChange}
          ariaLabel={label}
          placeholder={`Select ${label.toLowerCase()}`}
          wrapperClassName="min-w-0 flex-1"
        />
        <Dropdown
          options={DAY_PERIODS}
          value={period}
          onChange={(p) => onPeriodChange(p as DayPeriod)}
          wrapperClassName="w-[92px] shrink-0"
        />
      </div>
    </div>
  );
}

/**
 * "Ticketing & Pricing" step. Pick one or more dates; every date keeps its own times and tiers.
 * - Click a new date: it is selected and its (empty) details open below.
 * - Click another selected date: the details already entered for the previous date stay saved.
 * - Click the date being edited again: it is removed.
 */
export default function TicketingFields({ values, onChange }: TicketingFieldsProps) {
  const { category, dates, activeDate, days } = values;
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<EventTier | null>(null);

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
      // New date gets the same tiers as an existing date (creator can edit/delete per date after)
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
    } else if (activeDate !== iso) {
      onChange({ ...values, activeDate: iso });
    } else {
      removeDate(iso);
    }
  };

  const updateDay = (patch: Partial<EventDayData>) => {
    if (!activeDate || !day) return;
    onChange({ ...values, days: { ...days, [activeDate]: { ...day, ...patch } } });
  };

  const saveTier = (tier: TierFormValues) => {
    if (!day || !activeDate) return;
    if (day.tiers.length >= MAX_TIERS_PER_DATE && !editingTier) return;
    if (editingTier) {
      // Edit only affects the date being viewed
      updateDay({ tiers: day.tiers.map((t) => (t.id === editingTier.id ? { ...t, ...tier } : t)) });
      return;
    }

    // New tier is added on this date and mirrored onto other selected dates
    const created: EventTier = { id: newTierId(), ...tier, quantity: '' };
    const nextDays: Record<string, EventDayData> = {
      ...days,
      [activeDate]: { ...day, tiers: [...day.tiers, created] },
    };

    for (const iso of dates) {
      if (iso === activeDate) continue;
      const other = nextDays[iso] ?? emptyDay();
      if (other.tiers.length >= MAX_TIERS_PER_DATE) continue;
      const alreadyHas = other.tiers.some(
        (t) => t.title.trim().toLowerCase() === created.title.trim().toLowerCase()
      );
      if (alreadyHas) continue;
      nextDays[iso] = {
        ...other,
        tiers: [
          ...other.tiers,
          {
            id: newTierId(),
            title: created.title,
            price: created.price,
            persons: created.persons,
            quantity: '',
          },
        ],
      };
    }

    onChange({ ...values, days: nextDays });
  };

  const deleteTier = (id: string) => {
    if (!day) return;
    // Delete only on this date — other dates keep their copy
    updateDay({ tiers: day.tiers.filter((t) => t.id !== id) });
  };

  const setTierQuantity = (id: string, quantity: string) => {
    if (!day) return;
    updateDay({
      tiers: day.tiers.map((t) => (t.id === id ? { ...t, quantity: digitsOnly(quantity) } : t)),
    });
  };

  const openAddTier = () => {
    if ((day?.tiers.length ?? 0) >= MAX_TIERS_PER_DATE) return;
    setEditingTier(null);
    setTierDialogOpen(true);
  };

  const openEditTier = (tier: EventTier) => {
    setEditingTier(tier);
    setTierDialogOpen(true);
  };

  const tiers = day?.tiers ?? [];
  const takenTitles = tiers.filter((t) => t.id !== editingTier?.id).map((t) => t.title);

  return (
    <div className="space-y-5">
      <Dropdown
        label="Category"
        options={[...EVENT_CATEGORIES]}
        value={category}
        onChange={(category) => onChange({ ...values, category })}
        placeholder="Select category"
      />

      {/* Date */}
      <div>
        <FormLabel>Date</FormLabel>
        <DaysOfMonth selectedDates={dates} activeDate={activeDate} onDateClick={handleDateClick} />

        {dates.length === 0 ? (
          <p className="mt-2 text-xs text-gray-400">
            Pick the day your event runs. For a multi-day event, pick every day and fill in each one.
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
                    active ? 'border-[#0012FF] bg-[#0012FF] text-white' : 'border-[#C9CCF5] bg-[#E8E6F8] text-black'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleDateClick(iso)}
                    className="cursor-pointer py-1.5 pl-3 pr-1.5"
                    title={active ? 'Click to remove this date' : 'Click to edit this date'}
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

      {/* Details for the date being edited */}
      <AnimatePresence mode="wait" initial={false}>
        {activeDate && day ? (
          <motion.div
            key={activeDate}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2 rounded-[8px] bg-[#F8F8F8] px-3 py-2 text-xs text-gray-600">
              <CalendarDays size={14} className="shrink-0 text-[#0012FF]" />
              <span>
                Details for <span className="font-semibold text-black">{longDateLabel(activeDate)}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TimeField
                label="Starting Time"
                hour={day.startHour}
                minute={day.startMinute}
                period={day.startPeriod}
                onTimeChange={(startHour, startMinute) => updateDay({ startHour, startMinute })}
                onPeriodChange={(startPeriod) => updateDay({ startPeriod })}
              />
              <TimeField
                label="Ending Time"
                hour={day.endHour}
                minute={day.endMinute}
                period={day.endPeriod}
                onTimeChange={(endHour, endMinute) => updateDay({ endHour, endMinute })}
                onPeriodChange={(endPeriod) => updateDay({ endPeriod })}
              />
            </div>

            {/* Tiers — up to 3; each row has its own quantity */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <FormLabel className="mb-0">Ticket Tiers</FormLabel>
                  <InfoTooltip title="Ticket tiers">
                    Add up to {MAX_TIERS_PER_DATE} ticket tiers for this date. Set a quantity for each tier.
                  </InfoTooltip>
                </div>
                <span className="text-[11px] font-medium text-gray-400">
                  {tiers.length}/{MAX_TIERS_PER_DATE} used
                </span>
              </div>

              {tiers.length === 0 ? (
                <p className="mb-3 text-xs text-gray-400">No tiers yet. Add at least one ticket tier for this date.</p>
              ) : (
                <div className="mb-3 overflow-hidden rounded-[8px] border border-[#e2e2e2] bg-white">
                  {/* Column headers — desktop */}
                  <div className="hidden items-center gap-4 border-b border-[#e2e2e2] bg-[#F8F8FA] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:grid sm:grid-cols-[minmax(0,1.4fr)_100px_120px_72px]">
                    <span>Tier</span>
                    <span className="text-right">Price</span>
                    <span>Quantity</span>
                    <span className="text-right">Actions</span>
                  </div>

                  <ul className="divide-y divide-[#e2e2e2]">
                    {tiers.map((tier, index) => (
                      <li key={tier.id} className="px-4 py-3.5 transition-colors hover:bg-[#FAFAFC]">
                        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1.4fr)_100px_120px_72px] sm:gap-4">
                          {/* Tier identity */}
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#E8E9FB] text-[11px] font-bold text-[#0012FF]">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-black">{tier.title}</p>
                              <p className="mt-0.5 text-xs text-gray-400">
                                {Number(tier.persons).toLocaleString('en-US')}{' '}
                                {Number(tier.persons) === 1 ? 'person' : 'people'} allowed
                              </p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between gap-2 sm:block sm:text-right">
                            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 sm:hidden">
                              Price
                            </span>
                            <span className="inline-flex rounded-md bg-[#EEF0FF] px-2.5 py-1 text-xs font-bold text-[#0012FF]">
                              {formatPrice(tier.price)}
                            </span>
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400 sm:hidden">
                              Quantity
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={tier.quantity}
                              onChange={(e) => setTierQuantity(tier.id, e.target.value)}
                              placeholder="0"
                              aria-label={`Quantity for ${tier.title}`}
                              className="w-full rounded-[8px] border border-[#e2e2e2] bg-white px-3 py-2 font-sans text-sm text-black placeholder:text-gray-300 transition-colors focus:border-[#0012FF] focus:outline-none"
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              aria-label={`Edit ${tier.title}`}
                              onClick={() => openEditTier(tier)}
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[8px] text-gray-400 transition-colors hover:bg-[#E8E9FB] hover:text-[#0012FF]"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${tier.title}`}
                              onClick={() => deleteTier(tier.id)}
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[8px] text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tiers.length < MAX_TIERS_PER_DATE ? (
                <button
                  type="button"
                  onClick={openAddTier}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#cfd2f0] bg-[#F8F8FA] py-3.5 font-sans text-sm font-semibold text-[#0012FF] transition-colors hover:border-[#0012FF]/50 hover:bg-[#EEF0FF]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add Tier
                </button>
              ) : (
                <p className="text-center text-xs text-gray-400">
                  Maximum of {MAX_TIERS_PER_DATE} tiers reached for this date.
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          dates.length === 0 && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-[8px] border border-dashed border-[#e2e2e2] bg-[#F8F8F8] px-4 py-8 text-center text-sm text-gray-400"
            >
              Select a date above to set its time and ticket tiers.
            </motion.p>
          )
        )}
      </AnimatePresence>

      <AddTierDialog
        open={tierDialogOpen}
        onOpenChange={setTierDialogOpen}
        onSave={saveTier}
        editing={editingTier}
        takenTitles={takenTitles}
      />
    </div>
  );
}
