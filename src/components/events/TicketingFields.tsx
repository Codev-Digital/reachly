'use client';

import { useState } from 'react';
import { Pencil, Plus, Ticket, Trash2 } from 'lucide-react';
import { FormError, FormLabel } from '@/components/FormInput';
import AddTierDialog from '@/components/events/AddTierDialog';
import { InfoTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { digitsOnly } from '@/lib/sessionForm';
import {
  MAX_TIERS_PER_DATE,
  formatPrice,
  newTierId,
  type EventTier,
  type TicketingValues,
  type TierFormValues,
} from '@/lib/eventTicketing';

interface TicketingFieldsProps {
  values: TicketingValues;
  onChange: (next: TicketingValues) => void;
  error?: string;
  clearError?: () => void;
}

/**
 * "Ticketing & Pricing" step.
 * Shows only Ticket Tiers — the date/time schedule is handled in Schedule Slots.
 * Tiers are stored on the first date (if any), otherwise globally in a temp key.
 */
export default function TicketingFields({ values, onChange, error, clearError }: TicketingFieldsProps) {
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<EventTier | null>(null);

  // We store tiers on a synthetic key so they survive even before dates are picked.
  const GLOBAL_KEY = '__global__';
  const dayKey = values.dates[0] ?? GLOBAL_KEY;
  const day = values.days[dayKey];
  const tiers: EventTier[] = day?.tiers ?? [];
  const takenTitles = tiers.filter((t) => t.id !== editingTier?.id).map((t) => t.title);

  const updateTiers = (nextTiers: EventTier[]) => {
    const base = day ?? {
      startHour: '', startMinute: '', startPeriod: 'AM' as const,
      endHour: '', endMinute: '', endPeriod: 'PM' as const,
      tiers: [], selectedTierId: null,
    };
    onChange({ ...values, days: { ...values.days, [dayKey]: { ...base, tiers: nextTiers } } });
  };

  const saveTier = (tier: TierFormValues) => {
    if (tiers.length >= MAX_TIERS_PER_DATE && !editingTier) return;
    if (editingTier) {
      updateTiers(tiers.map((t) => (t.id === editingTier.id ? { ...t, ...tier } : t)));
      clearError?.();
      return;
    }
    const created: EventTier = { id: newTierId(), ...tier, quantity: '' };
    updateTiers([...tiers, created]);
    clearError?.();
  };

  const deleteTier = (id: string) => updateTiers(tiers.filter((t) => t.id !== id));

  const setTierQuantity = (id: string, quantity: string) => {
    updateTiers(tiers.map((t) => (t.id === id ? { ...t, quantity: digitsOnly(quantity) } : t)));
    clearError?.();
  };

  const openAddTier = () => {
    if (tiers.length >= MAX_TIERS_PER_DATE) return;
    setEditingTier(null);
    setTierDialogOpen(true);
  };

  const openEditTier = (tier: EventTier) => {
    setEditingTier(tier);
    setTierDialogOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <FormLabel required className="mb-0">Ticket Tiers</FormLabel>
          <InfoTooltip title="Ticket tiers">
            Add up to {MAX_TIERS_PER_DATE} ticket tiers. Set the price and capacity for each tier.
          </InfoTooltip>
        </div>
        <span className="text-[11px] font-medium text-gray-400">
          {tiers.length}/{MAX_TIERS_PER_DATE} used
        </span>
      </div>

      {error && (
        <FormError className="mt-1">{error}</FormError>
      )}

      {/* Tier list */}
      {tiers.length === 0 ? (
        <div
          className={cn(
            'rounded-[10px] border border-dashed px-4 py-10 text-center transition-colors',
            error ? 'border-red-500 bg-red-50/20' : 'border-[#e2e2e2] bg-[#F8F8F8]'
          )}
        >
          <Ticket size={28} className={cn('mx-auto mb-2', error ? 'text-red-400' : 'text-[#C9CCF5]')} />
          <p className={cn('text-sm font-medium', error ? 'text-red-600 font-semibold' : 'text-gray-500')}>
            No tiers yet
          </p>
          <p className="mt-1 text-xs text-gray-400">Add at least one ticket tier for your event.</p>
        </div>
      ) : (
        <div
          className={cn(
            'overflow-hidden rounded-[10px] border bg-white transition-colors',
            error ? 'border-red-400 ring-1 ring-red-400' : 'border-[#e2e2e2]'
          )}
        >
          {/* Column headers — desktop */}
          <div className="hidden items-center gap-4 border-b border-[#e2e2e2] bg-[#F8F8FA] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:grid sm:grid-cols-[minmax(0,1.4fr)_100px_90px_120px_72px]">
            <span>Tier</span>
            <span className="text-right">Price</span>
            <span>No of seats</span>
            <span>Tickets available</span>
            <span className="text-right">Actions</span>
          </div>

          <ul className="divide-y divide-[#e2e2e2]">
            {tiers.map((tier, index) => (
              <li key={tier.id} className="px-4 py-3.5 transition-colors hover:bg-[#FAFAFC]">
                <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1.4fr)_100px_90px_120px_72px] sm:gap-4">
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
                    <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 sm:hidden">Price</span>
                    <span className="inline-flex rounded-md bg-[#EEF0FF] px-2.5 py-1 text-xs font-bold text-[#0012FF]">
                      {formatPrice(tier.price)}
                    </span>
                  </div>

                  {/* Seats allowed per ticket, as configured in the tier popup */}
                  <div>
                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400 sm:hidden">
                      No of seats
                    </label>
                    <span className="inline-flex min-h-9 items-center rounded-[8px] border border-[#e2e2e2] bg-[#F8F8FA] px-3 text-sm font-semibold text-gray-700">
                      {Number(tier.persons || 0).toLocaleString('en-US')}
                    </span>
                  </div>

                  {/* Ticket inventory */}
                  <div>
                    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400 sm:hidden">
                      Tickets available
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={tier.quantity}
                      onChange={(e) => setTierQuantity(tier.id, e.target.value)}
                      placeholder="0"
                      aria-label={`Tickets available for ${tier.title}`}
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

      {/* Add tier button */}
      {tiers.length < MAX_TIERS_PER_DATE ? (
        <button
          type="button"
          onClick={openAddTier}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#cfd2f0] bg-[#F8F8FA] py-3.5 font-sans text-sm font-semibold text-[#0012FF] transition-colors hover:border-[#0012FF]/50 hover:bg-[#EEF0FF]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Tier
        </button>
      ) : (
        <p className="text-center text-xs text-gray-400">
          Maximum of {MAX_TIERS_PER_DATE} tiers reached.
        </p>
      )}

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
