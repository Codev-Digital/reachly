'use client';

import FormInput from '@/components/FormInput';
import SessionQuestionsSection from '@/components/SessionQuestionsSection';
import Dropdown from '@/components/Dropdown';
import RichTextEditor from '@/components/RichTextEditor';
import { InfoTooltip } from '@/components/ui/tooltip';
import { SESSION_DESCRIPTION_MAX_LENGTH } from '@/lib/richText';
import {
  CUSTOM_BUFFER_OPTION,
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
  const { customDuration, duration, customBufferTime, bufferTime } = values;
  const durationNum = Number(duration);
  const bufferChoices = bufferChoicesFor(durationNum);
  const bufferOptions = [
    NO_BUFFER_OPTION,
    ...bufferChoices.map(bufferLabel),
    CUSTOM_BUFFER_OPTION,
  ];
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

  const handleBufferSelect = (option: string) => {
    if (option === CUSTOM_BUFFER_OPTION) {
      if (!customBufferTime) {
        onChange({ customBufferTime: true, bufferTime: '' });
      }
    } else if (option === NO_BUFFER_OPTION) {
      onChange({ customBufferTime: false, bufferTime: 0 });
    } else {
      onChange({
        customBufferTime: false,
        bufferTime: Number(option.replace(/\D/g, '')) || 0,
      });
    }
    clearError('bufferTime');
  };

  return (
    <div className="space-y-5">
      {/* Single session or a package of several sessions sold together */}
      <div>
        <p className="block mb-2 font-medium text-[12px] text-black">Session type</p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Session type">
          {([['Single session', false], ['Package', true]] as const).map(([label, pkg]) => (
            <button
              key={label}
              type="button"
              aria-pressed={values.isPackage === pkg}
              onClick={() => onChange({ isPackage: pkg })}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                values.isPackage === pkg
                  ? 'border-[#0012FF] bg-[#0012FF] text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#0012FF]/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {values.isPackage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormInput
            label="Number of sessions"
            required
            type="text"
            inputMode="numeric"
            maxLength={3}
            suffix="sessions"
            value={values.packageSessions}
            onChange={(e) => {
              onChange({ packageSessions: digitsOnly(e.target.value) });
              clearError('packageSessions');
            }}
            error={errors.packageSessions}
            placeholder="5"
          />
          <div>
            <p className="block mb-2 font-medium text-[12px] text-black">Per</p>
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="Package period">
              {(['week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={values.packagePeriod === p}
                  onClick={() => onChange({ packagePeriod: p })}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-colors ${
                    values.packagePeriod === p
                      ? 'border-[#0012FF] bg-[#0012FF]/5 text-[#0012FF]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#0012FF]/50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
        autoHeight
        error={errors.description}
        placeholder="Personal styling session to revamp your wardrobe and discover your signature look."
      />

      {/* Duration: presets, or "Custom Duration" which turns the field into a minutes input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Dropdown
          label="Duration"
          required
          options={DURATION_OPTIONS}
          // the field shows just the number; "min" sits in its own box at the end (like PKR)
          value={customDuration ? duration : (PRESET_DURATIONS.find((d) => d.value === duration)?.value ?? '')}
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
          suffix="min"
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
          // the field shows just the number; "min" sits in its own box at the end (like PKR)
          value={
            customBufferTime
              ? String(bufferTime ?? '')
              : effectiveBuffer === 0
                ? NO_BUFFER_OPTION
                : String(effectiveBuffer)
          }
          selectedOption={
            customBufferTime
              ? CUSTOM_BUFFER_OPTION
              : bufferLabel(effectiveBuffer)
          }
          suffix="min"
          onChange={handleBufferSelect}
          editable={customBufferTime}
          onInputChange={(text) => {
            onChange({ bufferTime: digitsOnly(text) });
            clearError('bufferTime');
          }}
          inputMode="numeric"
          inputMaxLength={4}
          disabled={!durationNum || durationNum < 1}
          placeholder={
            !durationNum || durationNum < 1
              ? 'Choose a duration first'
              : customBufferTime
                ? 'Enter buffer time'
                : 'Select buffer time'
          }
          error={errors.bufferTime}
        />
      </div>

      {/* Session price, discounted price and max bookings on one line */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <FormInput
          label={values.isPackage ? 'Package Price (total)' : 'Session Price'}
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
        <FormInput
          label="Max Booking"
          required
          suffix="Per day"
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

      <FormInput
        label="Minimum notice (days)"
        required
        labelAddon={
          <InfoTooltip title="Minimum notice">
            How many days ahead clients must book. Example: set 2 — if today is Sunday, Tuesday is the
            first day they can choose.
          </InfoTooltip>
        }
        type="text"
        inputMode="numeric"
        maxLength={2}
        suffix="days"
        value={values.minAdvanceDays}
        onChange={(e) => {
          onChange({ minAdvanceDays: digitsOnly(e.target.value) });
          clearError('minAdvanceDays');
        }}
        error={errors.minAdvanceDays}
        placeholder="1"
      />

      {/* Intake questions: multiple choice, short answer, or both */}
      <SessionQuestionsSection
        questions={values.questions}
        onChange={(questions) => {
          onChange({ questions });
          clearError('questions');
        }}
        showErrors={!!errors.questions}
      />
    </div>
  );
}
