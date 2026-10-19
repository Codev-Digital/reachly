'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { FormError, FormLabel, INPUT_CLASSES } from '@/components/FormInput';

type Variant = 'light' | 'dark';

export interface DropdownProps {
  options: string[];
  /** Text shown in the field (the selected option, or the typed text when `editable`). */
  value: string;
  onChange: (value: string) => void;
  /** Called when the menu closes / the field loses focus (use it to mark the field as touched). */
  onBlur?: () => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  /** `dark` matches the dark creator dashboard pages. */
  variant?: Variant;
  /**
   * When true the field itself becomes a text input in the same place (e.g. after picking "Others"),
   * and the chevron still opens the list so the user can go back to a listed option.
   */
  editable?: boolean;
  onInputChange?: (text: string) => void;
  /** Which option is highlighted as selected. Defaults to `value`. */
  selectedOption?: string;
  inputMaxLength?: number;
  /** Extra classes for the field — merged over the same defaults FormInput uses. */
  className?: string;
  menuClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  wrapperClassName?: string;
}

const MENU_THEME: Record<Variant, { menu: string; option: string; active: string; selected: string }> = {
  light: {
    menu: 'bg-white border-[#e2e2e2] shadow-lg text-black',
    option: 'text-gray-700',
    active: 'bg-gray-100',
    selected: 'text-[#0012FF] font-semibold',
  },
  dark: {
    menu: 'bg-[#141414] border-[rgba(200,169,126,0.3)] shadow-xl text-[#F9F6F2]',
    option: 'text-[#F9F6F2]/80',
    active: 'bg-white/10',
    selected: 'text-[#C8A97E] font-semibold',
  },
};

export default function Dropdown({
  options,
  value,
  onChange,
  onBlur,
  label,
  required,
  placeholder = 'Select an option',
  error,
  disabled,
  variant = 'light',
  editable = false,
  onInputChange,
  selectedOption,
  inputMaxLength,
  className,
  menuClassName,
  labelClassName,
  errorClassName,
  wrapperClassName,
}: DropdownProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const listId = `${id}-list`;
  const theme = MENU_THEME[variant];
  const selected = selectedOption ?? value;

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasEditable = useRef(editable);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const close = () => {
    if (!open) return;
    setOpen(false);
    onBlur?.();
  };

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(Math.max(0, options.indexOf(selected)));
    setOpen(true);
  };

  const select = (option: string) => {
    onChange(option);
    setOpen(false);
    if (!editable) onBlur?.();
  };

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the highlighted option visible while using the keyboard
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  // When the field turns into a text input, put the cursor in it right away
  useEffect(() => {
    if (editable && !wasEditable.current) inputRef.current?.focus();
    wasEditable.current = editable;
  }, [editable]);

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case 'Enter':
        // in a text input Enter should keep its normal behaviour unless the list is open
        if (editable && !open) break;
        e.preventDefault();
        if (!open) openMenu();
        else if (activeIndex >= 0) select(options[activeIndex]);
        break;
      case ' ':
        if (editable) break; // typing a space
        e.preventDefault();
        if (!open) openMenu();
        else if (activeIndex >= 0) select(options[activeIndex]);
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          close();
        }
        break;
      case 'Tab':
        if (open) close();
        break;
    }
  };

  const fieldClasses = twMerge(
    INPUT_CLASSES,
    'px-4 pr-11',
    open && 'border-[#0012FF]',
    className
  );

  return (
    <div className={wrapperClassName}>
      {label && (
        <FormLabel htmlFor={id} required={required} className={labelClassName}>
          {label}
        </FormLabel>
      )}

      <div ref={rootRef} className="relative">
        {editable ? (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={value}
            disabled={disabled}
            maxLength={inputMaxLength}
            placeholder={placeholder}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => onInputChange?.(e.target.value)}
            onBlur={() => {
              // moving focus to the list (mouse) keeps the field "active"
              if (!open) onBlur?.();
            }}
            onKeyDown={handleKeyDown}
            className={fieldClasses}
          />
        ) : (
          <button
            id={id}
            type="button"
            disabled={disabled}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onClick={() => (open ? close() : openMenu())}
            onKeyDown={handleKeyDown}
            className={twMerge(fieldClasses, 'text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-60')}
          >
            <span className={twMerge('block truncate', !value && 'opacity-50')}>{value || placeholder}</span>
          </button>
        )}

        {editable ? (
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label="Show options"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => (open ? close() : openMenu())}
            className="absolute right-0 top-0 h-full w-11 flex items-center justify-center cursor-pointer"
          >
            <ChevronDown
              aria-hidden="true"
              className={twMerge('w-4 h-4 opacity-50 transition-transform', open && 'rotate-180')}
            />
          </button>
        ) : (
          <ChevronDown
            aria-hidden="true"
            className={twMerge(
              'pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 transition-transform',
              open && 'rotate-180'
            )}
          />
        )}

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            className={twMerge(
              'absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-[8px] border py-1 text-sm font-sans',
              theme.menu,
              menuClassName
            )}
          >
            {options.map((option, index) => {
              const isSelected = option === selected;
              return (
                <li
                  key={option}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  // mousedown (not click) so selection happens before any blur handling
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(option);
                  }}
                  className={twMerge(
                    'flex items-center justify-between gap-2 px-4 py-2.5 cursor-pointer',
                    theme.option,
                    index === activeIndex && theme.active,
                    isSelected && theme.selected
                  )}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
                </li>
              );
            })}
          </ul>
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
