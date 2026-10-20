'use client';

import { useEffect, useState } from 'react';
import ActionDialog from '@/components/ActionDialog';
import FormInput from '@/components/FormInput';
import { digitsOnly } from '@/lib/sessionForm';
import {
  DEFAULT_TIER_PERSONS,
  TIER_TITLE_MAX_LENGTH,
  validateTier,
  type EventTier,
  type TierFormErrors,
  type TierFormValues,
} from '@/lib/eventTicketing';

export const TIER_DIALOG_IMAGE = '/assets/add-category-sm.webp';

interface AddTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the finished tier values (without an id). */
  onSave: (values: TierFormValues) => void;
  /** When set the popup edits this tier instead of adding a new one. */
  editing?: EventTier | null;
  /** Titles already used by the other tiers of this date. */
  takenTitles: string[];
}

const blank = (): TierFormValues => ({ title: '', price: '', persons: DEFAULT_TIER_PERSONS });

/** "Add Tier" popup: tier title, price (PKR) and the total number of people it allows. */
export default function AddTierDialog({ open, onOpenChange, onSave, editing, takenTitles }: AddTierDialogProps) {
  const [values, setValues] = useState<TierFormValues>(blank());
  const [errors, setErrors] = useState<TierFormErrors>({});

  // Fresh form (or the tier being edited) every time the popup opens
  useEffect(() => {
    if (!open) return;
    setValues(editing ? { title: editing.title, price: editing.price, persons: editing.persons } : blank());
    setErrors({});
  }, [open, editing]);

  const patch = (next: Partial<TierFormValues>) => {
    setValues((prev) => ({ ...prev, ...next }));
    setErrors((prev) => {
      const cleared = { ...prev };
      (Object.keys(next) as (keyof TierFormValues)[]).forEach((key) => delete cleared[key]);
      return cleared;
    });
  };

  const submit = () => {
    const found = validateTier(values, takenTitles);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    onSave({ ...values, title: values.title.trim() });
    onOpenChange(false);
  };

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      image={{ src: TIER_DIALOG_IMAGE, alt: 'Add tier' }}
      title={editing ? 'Edit Tier' : 'Add Tier'}
      description="Set the tier name, its ticket price and how many people it allows."
      actions={[
        { label: 'Cancel', variant: 'outline', onClick: () => onOpenChange(false) },
        { label: editing ? 'Save Tier' : 'Add Tier', onClick: submit },
      ]}
      classNames={{
        content: 'sm:max-w-[480px]',
        imageWrapper: 'w-24 sm:w-28 md:w-32 lg:w-36',
      }}
    >
      <form
        className="mb-6 w-full space-y-4 text-left"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <FormInput
          label="Title"
          required
          type="text"
          maxLength={TIER_TITLE_MAX_LENGTH}
          value={values.title}
          onChange={(e) => patch({ title: e.target.value })}
          error={errors.title}
          placeholder="e.g. Early Bird"
          autoFocus
        />
        <FormInput
          label="Price"
          required
          type="text"
          inputMode="numeric"
          maxLength={8}
          suffix="PKR"
          value={values.price}
          onChange={(e) => patch({ price: digitsOnly(e.target.value) })}
          error={errors.price}
          placeholder="Enter price"
        />
        <FormInput
          label="Total Person"
          required
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={values.persons}
          onChange={(e) => patch({ persons: digitsOnly(e.target.value) })}
          error={errors.persons}
          placeholder="1"
        />
        {/* lets Enter submit the form */}
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </ActionDialog>
  );
}
