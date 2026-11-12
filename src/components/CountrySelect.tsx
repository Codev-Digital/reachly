'use client';

import { useState } from 'react';
import Dropdown, { type DropdownProps } from '@/components/Dropdown';
import { COUNTRIES } from '@/lib/locations';

export const OTHER_COUNTRY_OPTION = 'Others';

const OPTIONS = [...COUNTRIES, OTHER_COUNTRY_OPTION];

const isListedCountry = (country: string) =>
  (COUNTRIES as readonly string[]).includes(country);

export interface CountrySelectProps
  extends Pick<
    DropdownProps,
    'label' | 'required' | 'error' | 'disabled' | 'variant' | 'className' | 'menuClassName' | 'labelClassName' | 'errorClassName' | 'wrapperClassName' | 'onBlur'
  > {
  value: string;
  onChange: (country: string) => void;
  placeholder?: string;
  otherPlaceholder?: string;
}

/**
 * Country dropdown with common countries and an "Others" option that switches to an editable input.
 */
export default function CountrySelect({
  value,
  onChange,
  label = 'Country',
  placeholder = 'Select your country',
  otherPlaceholder = 'Enter your country',
  ...rest
}: CountrySelectProps) {
  const [explicitOther, setExplicitOther] = useState(false);
  const otherMode =
    (!!value && !isListedCountry(value)) ||
    (!value && explicitOther);

  const handleSelect = (option: string) => {
    if (option === OTHER_COUNTRY_OPTION) {
      if (!otherMode) {
        setExplicitOther(true);
        onChange('');
      }
    } else {
      setExplicitOther(false);
      onChange(option);
    }
  };

  return (
    <Dropdown
      {...rest}
      label={label}
      options={OPTIONS}
      value={value}
      selectedOption={otherMode ? OTHER_COUNTRY_OPTION : value}
      editable={otherMode}
      onInputChange={onChange}
      inputMaxLength={60}
      onChange={handleSelect}
      placeholder={otherMode ? otherPlaceholder : placeholder}
    />
  );
}
