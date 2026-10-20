'use client';

import FormTextarea from '@/components/FormTextarea';

import { EVENT_POLICY_MAX_LENGTH } from '@/lib/eventConstants';

export const POLICY_MAX_LENGTH = EVENT_POLICY_MAX_LENGTH;

export interface PolicyValues {
  refundPolicy: string;
  termsAndConditions: string;
}

export type PolicyErrors = Partial<Record<keyof PolicyValues, string>>;

export const emptyPolicy = (): PolicyValues => ({ refundPolicy: '', termsAndConditions: '' });

interface PolicyFieldsProps {
  values: PolicyValues;
  errors: PolicyErrors;
  onChange: (patch: Partial<PolicyValues>) => void;
  clearError: (key: keyof PolicyValues) => void;
}

/** "Policy" step: refund policy and terms & conditions for the event. */
export default function PolicyFields({ values, errors, onChange, clearError }: PolicyFieldsProps) {
  return (
    <div className="space-y-5">
      <FormTextarea
        label="Refund Policy"
        required
        rows={5}
        maxLength={POLICY_MAX_LENGTH}
        value={values.refundPolicy}
        onChange={(e) => {
          onChange({ refundPolicy: e.target.value });
          clearError('refundPolicy');
        }}
        error={errors.refundPolicy}
        placeholder="Enter Refund Policy"
        footer={
          <p className="mt-1.5 text-right text-xs text-gray-400">
            {values.refundPolicy.length}/{POLICY_MAX_LENGTH}
          </p>
        }
      />

      <FormTextarea
        label="Terms & Conditions"
        required
        rows={5}
        maxLength={POLICY_MAX_LENGTH}
        value={values.termsAndConditions}
        onChange={(e) => {
          onChange({ termsAndConditions: e.target.value });
          clearError('termsAndConditions');
        }}
        error={errors.termsAndConditions}
        placeholder="Enter terms & conditions"
        footer={
          <p className="mt-1.5 text-right text-xs text-gray-400">
            {values.termsAndConditions.length}/{POLICY_MAX_LENGTH}
          </p>
        }
      />
    </div>
  );
}
