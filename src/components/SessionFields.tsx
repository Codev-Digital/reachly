'use client';

import FormInput from '@/components/FormInput';
import Dropdown from '@/components/Dropdown';
import RichTextEditor from '@/components/RichTextEditor';
import { InfoTooltip } from '@/components/ui/tooltip';
import { SESSION_DESCRIPTION_MAX_LENGTH } from '@/lib/richText';
import {
  CUSTOM_DURATION_OPTION,
  DURATION_OPTIONS,
  NO_BUFFER_OPTION,
  PRESET_DURATIONS,
  bufferChoicesFor,
  bufferLabel,
  digitsOnly,
  effectiveBufferFor,
  type SessionErrorKey,
  type SessionErrors,
  type SessionFormValues,
} from '@/lib/sessionForm';

interface SessionFieldsProps {
  values: SessionFormValues;
  onChange: (patch: Partial<SessionFormValues>) => void;
  errors: SessionErrors;
  clearError: (key: SessionErrorKey) => void;
}

/**
 * The session form fields (title, rich-text description, duration, buffer, prices, max bookings).
 * Used by the Add/Edit session page and by the creator onboarding sessions step.
 */
export default function SessionFields({ values, onChange, errors, clearError }: SessionFieldsProps) {
  const { customDuration, duration } = values;

  const bufferChoices = bufferChoicesFor(Number(duration));
  const bufferOptions = [NO_BUFFER_OPTION, ...bufferChoices.map(bufferLabel)];
  const effectiveBuffer = effectiveBufferFor(values);

  const handleDurationSelect = (option: string) => {
    if (option === CUSTOM_DURATION_OPTION) {
      if (!customDuration) {
        // start empty so the creator can type their own minutes
        onChange({ customDuration: true, duration: '' });
      }
    } else {
      onChange({
        customDuration: false,
        duration: PRESET_DURATIONS.find((d) => d.label === option)?.value ?? '',
      });
    }
    clearError('duration');
  };

  return (
    <div className="space-y-5">
      <FormInput
        label="Title"
        required
        type="text"
        value={values.title}
        onChange={(e) => {
          onChange({ title: e.target.value });
          clearError('title');
        }}
        error={errors.title}
        placeholder="Style Consultation"
      />

      <RichTextEditor
        label="Description"
        required
        value={values.description}
        onChange={(html) => {
          onChange({ description: html });
          clearError('description');
        }}
        maxLength={SESSION_DESCRIPTION_MAX_LENGTH}
        error={errors.description}
        placeholder="Personal styling session to revamp your wardrobe and discover your signature look."
      />

      {/* Duration: presets, or "Custom Duration" which turns the field into a minutes input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Dropdown
          label="Duration"
          required
          options={DURATION_OPTIONS}
          value={
            customDuration
              ? duration
              : (PRESET_DURATIONS.find((d) => d.value === duration)?.label ?? '')
          }
          selectedOption={
            customDuration
              ? CUSTOM_DURATION_OPTION
              : PRESET_DURATIONS.find((d) => d.value === duration)?.label
          }
          onChange={handleDurationSelect}
          editable={customDuration}
          onInputChange={(text) => {
            onChange({ duration: digitsOnly(text) });
            clearError('duration');
          }}
          inputMode="numeric"
          inputMaxLength={4}
          suffix={customDuration ? 'min' : undefined}
          placeholder={customDuration ? 'Enter duration' : 'Select duration'}
          error={errors.duration}
        />

        <Dropdown
          label="Buffer Time"
          labelAddon={
            <InfoTooltip title="Buffer time">
              A short break kept free after each session, before the next booking can start. It can&apos;t
              be longer than the session duration, so enter a duration first.
            </InfoTooltip>
          }
          options={bufferOptions}
          value={bufferLabel(effectiveBuffer)}
          onChange={(label) =>
            onChange({
              bufferTime: label === NO_BUFFER_OPTION ? 0 : Number(label.replace(/\D/g, '')) || 0,
            })
          }
          disabled={bufferChoices.length === 0}
          placeholder={bufferChoices.length === 0 ? 'Choose a duration first' : 'Select buffer time'}
        />
      </div>

      {/* Session price next to the discounted price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormInput
          label="Session Price"
          required
          type="text"
          inputMode="numeric"
          maxLength={8}
          suffix="PKR"
          value={values.price}
          onChange={(e) => {
            onChange({ price: digitsOnly(e.target.value) });
            clearError('price');
            clearError('discountedPrice');
          }}
          error={errors.price}
          placeholder="1200"
        />
        <FormInput
          label="Discounted Price"
          type="text"
          inputMode="numeric"
          maxLength={8}
          suffix="PKR"
          value={values.discountedPrice}
          onChange={(e) => {
            onChange({ discountedPrice: digitsOnly(e.target.value) });
            clearError('discountedPrice');
          }}
          error={errors.discountedPrice}
          placeholder="Optional"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormInput
          label="Max Bookings Per Day"
          required
          type="text"
          inputMode="numeric"
          maxLength={3}
          value={values.maxBookings}
          onChange={(e) => {
            onChange({ maxBookings: digitsOnly(e.target.value) });
            clearError('maxBookings');
          }}
          error={errors.maxBookings}
          placeholder="4"
        />
      </div>
    </div>
  );
}
