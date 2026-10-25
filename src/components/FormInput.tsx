'use client';

import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { Inter } from 'next/font/google';
import { twMerge } from 'tailwind-merge';
import PasswordToggle from '@/components/PasswordToggle';

// Loaded here (not in the root layout) so Inter is only fetched on pages that use form fields.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter-ui' });

/** Class that defines the `--font-inter-ui` CSS variable used by the label/error classes. */
export const INTER_VARIABLE_CLASS = inter.variable;

// Shared with FormTextarea / RichTextEditor so every field looks the same.
export const LABEL_CLASSES =
  'block mb-2 font-[family-name:var(--font-inter-ui)] font-medium text-[12px] leading-[12px] tracking-[0] text-black';

const ERROR_CLASSES =
  'flex items-center gap-1.5 font-[family-name:var(--font-inter-ui)] font-normal text-[12px] leading-[12px] tracking-[0] text-[#dc2626]';

export const INPUT_CLASSES =
  'w-full bg-white border border-[#e2e2e2] rounded-[8px] py-3 font-sans text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all';

/** Inline error message with a warning icon. Also used for form-level errors. */
export function FormError({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <p id={id} role="alert" className={twMerge(inter.variable, ERROR_CLASSES, className)}>
      <CircleAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** Standalone label in the same style as FormInput labels (for custom controls like chips or photo pickers). */
export function FormLabel({
  children,
  htmlFor,
  required,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={twMerge(inter.variable, LABEL_CLASSES, className)}>
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

export interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /** Label shown above the input. A red * is added when `required` is set. */
  label?: string;
  /** Optional control beside the label (e.g. InfoTooltip). */
  labelAddon?: ReactNode;
  /** Error message shown under the input. Nothing is rendered when empty. */
  error?: string;
  /** Left icon (e.g. a lucide icon). */
  icon?: ReactNode;
  /** Text at the end of the field in its own bordered segment (e.g. "PKR", "min"). */
  suffix?: ReactNode;
  suffixClassName?: string;
  /** Extra classes for the <input> itself — merged over the defaults. */
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  wrapperClassName?: string;
}

export default function FormInput({
  label,
  labelAddon,
  error,
  icon,
  suffix,
  suffixClassName,
  type = 'text',
  className,
  labelClassName,
  errorClassName,
  wrapperClassName,
  id,
  required,
  ...rest
}: FormInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={wrapperClassName}>
      {label &&
        (labelAddon ? (
          <div className="relative mb-2 flex items-center gap-1.5">
            <label htmlFor={inputId} className={twMerge(inter.variable, LABEL_CLASSES, 'mb-0', labelClassName)}>
              {label}
              {required && <span className="text-red-500"> *</span>}
            </label>
            {labelAddon}
          </div>
        ) : (
          <label htmlFor={inputId} className={twMerge(inter.variable, LABEL_CLASSES, labelClassName)}>
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        ))}

      <div
        className={twMerge(
          'relative',
          // With a suffix the border moves to the wrapper so input + suffix read as one field
          suffix &&
            'flex items-stretch bg-white border border-[#e2e2e2] rounded-[8px] overflow-hidden focus-within:border-[#0012FF] transition-all'
        )}
      >
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0012FF] pointer-events-none flex items-center">
            {icon}
          </div>
        )}

        <input
          {...rest}
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={twMerge(
            INPUT_CLASSES,
            icon ? 'pl-11' : 'pl-4',
            isPassword ? 'pr-12' : 'pr-4',
            suffix && 'flex-1 min-w-0 border-0 rounded-none focus:border-0',
            className
          )}
        />

        {suffix && (
          <span
            className={twMerge(
              'flex items-center px-4 border-l border-[#e2e2e2] bg-gray-50 font-sans text-sm font-medium text-gray-500 select-none',
              suffixClassName
            )}
          >
            {suffix}
          </span>
        )}

        {isPassword && (
          <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
        )}
      </div>

      {error && (
        <FormError id={errorId} className={twMerge('mt-2', errorClassName)}>
          {error}
        </FormError>
      )}
    </div>
  );
}
