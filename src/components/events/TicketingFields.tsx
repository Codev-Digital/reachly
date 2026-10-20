'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Pencil, Plus, Trash2, X } from 'lucide-react';
import DaysOfMonth from '@/components/DaysOfMonth';
import Dropdown from '@/components/Dropdown';
import TimePicker from '@/components/TimePicker';
import FormInput, { FormLabel } from '@/components/FormInput';
import AddTierDialog, { TIER_DIALOG_IMAGE } from '@/components/events/AddTierDialog';
import { InfoTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { digitsOnly } from '@/lib/sessionForm';
import { usePreloadImages } from '@/lib/usePreloadImages';
import {
  DAY_PERIODS,
  MAX_TIERS_PER_DATE,
  emptyDay,
  formatPrice,
  longDateLabel,
  newTierId,
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
  const { dates, activeDate, days } = values;
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<EventTier | null>(null);
  usePreloadImages([TIER_DIALOG_IMAGE]);

  const day: EventDayData | undefined = activeDate ? days[activeDate] : undefined;

  const removeDate = (iso: string) => {
    const nextDates = dates.filter((d) => d !== iso);
    const { [iso]: _removed, ...nextDays } = days;
    onChange({
      dates: nextDates,
      activeDate: activeDate === iso ? (nextDates[nextDates.length - 1] ?? null) : activeDate,
      days: nextDays,
    });
  };

  const handleDateClick = (iso: string) => {
    if (!dates.includes(iso)) {
      onChange({
        dates: [...dates, iso].sort(),
        activeDate: iso,
        days: { ...days, [iso]: days[iso] ?? emptyDay() },
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
    if (!day) return;
    if (editingTier) {
      // the quantity already entered for this tier is kept
      updateDay({ tiers: day.tiers.map((t) => (t.id === editingTier.id ? { ...t, ...tier } : t)) });
    } else {
      // a new tier is selected right away so its quantity can be filled in
      const created: EventTier = { id: newTierId(), ...tier, quantity: '' };
      updateDay({ tiers: [...day.tiers, created], selectedTierId: created.id });
    }
  };

  const deleteTier = (id: string) => {
    if (!day) return;
    const remaining = day.tiers.filter((t) => t.id !== id);
    updateDay({
      tiers: remaining,
      selectedTierId: day.selectedTierId === id ? (remaining[0]?.id ?? null) : day.selectedTierId,
    });
  };

  const openAddTier = () => {
    setEditingTier(null);
    setTierDialogOpen(true);
  };

  const openEditTier = (tier: EventTier) => {
    setEditingTier(tier);
    setTierDialogOpen(true);
  };

  const tiers = day?.tiers ?? [];
  const selectedTier = tiers.find((t) => t.id === day?.selectedTierId) ?? null;
  const takenTitles = tiers.filter((t) => t.id !== editingTier?.id).map((t) => t.title);

  return (
    <div className="space-y-5">
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

            {/* Tier + quantity */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Dropdown
                label="Tier Name"
                options={tiers.map((t) => t.title)}
                value={selectedTier?.title ?? ''}
                onChange={(title) => {
                  const picked = tiers.find((t) => t.title === title);
                  if (picked) updateDay({ selectedTierId: picked.id });
                }}
                placeholder="Select tier"
                emptyText="No tier created"
                labelAddon={
                  <InfoTooltip title="Tier name">
                    Choose the ticket tier for this date, then set how many tickets are available in Quantity.
                  </InfoTooltip>
                }
                menuFooter={({ close }) =>
                  tiers.length < MAX_TIERS_PER_DATE ? (
                    <button
                      type="button"
                      onClick={() => {
                        close();
                        openAddTier();
                      }}
                      className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] bg-[#0012FF]/10 px-2.5 text-xs font-semibold text-[#0012FF] transition-colors hover:bg-[#0012FF]/15"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Add Tier
                    </button>
                  ) : (
                    <p className="px-1 text-xs text-gray-400">Tier limit reached for this date.</p>
                  )
                }
              />
              <FormInput
                label="Quantity"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={selectedTier?.quantity ?? ''}
                onChange={(e) => {
                  if (!selectedTier) return;
                  updateDay({
                    tiers: tiers.map((t) => (t.id === selectedTier.id ? { ...t, quantity: digitsOnly(e.target.value) } : t)),
                  });
                }}
                disabled={!selectedTier}
                className="disabled:cursor-not-allowed disabled:bg-gray-50"
                placeholder={selectedTier ? 'Enter available quantity' : 'Select a tier first'}
              />
            </div>

            {/* Summary of the chosen tier, with edit / delete */}
            {selectedTier && (
              <div className="flex items-center gap-3 rounded-[8px] border border-[#e2e2e2] bg-white px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-black">{selectedTier.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {Number(selectedTier.persons).toLocaleString('en-US')}{' '}
                    {Number(selectedTier.persons) === 1 ? 'person' : 'people'} allowed
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-[#0012FF]">{formatPrice(selectedTier.price)}</span>
                <button
                  type="button"
                  aria-label={`Edit ${selectedTier.title}`}
                  onClick={() => openEditTier(selectedTier)}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0012FF]"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${selectedTier.title}`}
                  onClick={() => deleteTier(selectedTier.id)}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {tiers.length < MAX_TIERS_PER_DATE ? (
              <button
                type="button"
                onClick={openAddTier}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] border-2 border-dashed border-[#e2e2e2] bg-[#F8F8F8] py-4 font-sans text-sm font-semibold text-gray-600 transition-colors hover:border-[#0012FF]/40 hover:text-[#0012FF]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Tier
              </button>
            ) : (
              <p className="text-xs text-gray-400">You can add up to {MAX_TIERS_PER_DATE} tiers for each date.</p>
            )}
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
