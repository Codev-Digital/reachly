'use client';

import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { FormError, INPUT_CLASSES, INTER_VARIABLE_CLASS, LABEL_CLASSES } from '@/components/FormInput';

export interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label?: string;
  error?: string;
  /** Extra classes for the <textarea> itself — merged over the same defaults FormInput uses. */
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  wrapperClassName?: string;
  /** Optional content shown under the field (e.g. a character counter). */
  footer?: ReactNode;
}

export default function FormTextarea({
  label,
  error,
  className,
  labelClassName,
  errorClassName,
  wrapperClassName,
  footer,
  id,
  required,
  rows = 4,
  ...rest
}: FormTextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const errorId = `${textareaId}-error`;

  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={textareaId} className={twMerge(INTER_VARIABLE_CLASS, LABEL_CLASSES, labelClassName)}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <textarea
        {...rest}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={twMerge(INPUT_CLASSES, 'px-4 resize-none', className)}
      />

      {footer}

      {error && (
        <FormError id={errorId} className={twMerge('mt-2', errorClassName)}>
          {error}
        </FormError>
      )}
    </div>
  );
}
