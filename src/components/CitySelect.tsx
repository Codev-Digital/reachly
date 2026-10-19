'use client';

import { useEffect, useState } from 'react';
import Dropdown, { type DropdownProps } from '@/components/Dropdown';

/** Ten largest cities of Pakistan. */
export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Faisalabad',
  'Rawalpindi',
  'Gujranwala',
  'Peshawar',
  'Multan',
  'Hyderabad',
  'Islamabad',
  'Quetta',
] as const;

export const OTHER_CITY_OPTION = 'Others';

const OPTIONS = [...PAKISTAN_CITIES, OTHER_CITY_OPTION];

const isListedCity = (city: string) => (PAKISTAN_CITIES as readonly string[]).includes(city);

export interface CitySelectProps
  extends Pick<
    DropdownProps,
    'label' | 'required' | 'error' | 'disabled' | 'variant' | 'className' | 'menuClassName' | 'labelClassName' | 'errorClassName' | 'wrapperClassName' | 'onBlur'
  > {
  /** The city name that is saved (either one of the top 10 or whatever the user typed under "Others"). */
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  otherPlaceholder?: string;
}

/**
 * City dropdown with the top 10 Pakistan cities. Choosing "Others" turns the same field into a
 * text input where the user types their own city; the typed value becomes the saved city.
 * The chevron still opens the list so they can switch back to a listed city.
 */
export default function CitySelect({
  value,
  onChange,
  label = 'City',
  placeholder = 'Select your city',
  otherPlaceholder = 'Enter your city',
  ...rest
}: CitySelectProps) {
  // A saved city that isn't in the list means the user picked "Others" earlier
  const [otherMode, setOtherMode] = useState(!!value && !isListedCity(value));

  // Stay in sync when the value is loaded/changed from outside (e.g. profile fetched from the API)
  useEffect(() => {
    if (value && !isListedCity(value)) setOtherMode(true);
    else if (isListedCity(value)) setOtherMode(false);
  }, [value]);

  const handleSelect = (option: string) => {
    if (option === OTHER_CITY_OPTION) {
      if (!otherMode) {
        setOtherMode(true);
        onChange(''); // start with an empty field to type into
      }
    } else {
      setOtherMode(false);
      onChange(option);
    }
  };

  return (
    <Dropdown
      {...rest}
      label={label}
      options={OPTIONS}
      value={value}
      selectedOption={otherMode ? OTHER_CITY_OPTION : value}
      editable={otherMode}
      onInputChange={onChange}
      inputMaxLength={60}
      onChange={handleSelect}
      placeholder={otherMode ? otherPlaceholder : placeholder}
    />
  );
}
