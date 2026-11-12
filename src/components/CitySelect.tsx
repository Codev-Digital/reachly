'use client';

import { useState } from 'react';
import Dropdown, { type DropdownProps } from '@/components/Dropdown';
import FormInput from '@/components/FormInput';
import { getCitiesForCountry, PAKISTAN_CITIES } from '@/lib/locations';

export { PAKISTAN_CITIES };

export const OTHER_CITY_OPTION = 'Others';

export interface CitySelectProps
  extends Pick<
    DropdownProps,
    'label' | 'required' | 'error' | 'disabled' | 'variant' | 'className' | 'menuClassName' | 'labelClassName' | 'errorClassName' | 'wrapperClassName' | 'onBlur'
  > {
  /** The city name that is saved (either one of the country's listed cities or whatever the user typed under "Others"). */
  value: string;
  onChange: (city: string) => void;
  /** Optional country used to choose the preset city list (defaults to 'Pakistan'). */
  country?: string;
  placeholder?: string;
  otherPlaceholder?: string;
}

/**
 * City dropdown with preset cities for the selected country (default: top 10 Pakistan cities).
 * Choosing "Others" turns the field into a text input; for countries without preset cities it renders
 * a text input directly so any city can be entered.
 */
export default function CitySelect({
  value,
  onChange,
  country = 'Pakistan',
  label = 'City',
  placeholder = 'Select your city',
  otherPlaceholder = 'Enter your city',
  ...rest
}: CitySelectProps) {
  const listedCities = getCitiesForCountry(country);
  const options = [...listedCities, OTHER_CITY_OPTION];

  // Track whether the user explicitly switched to "Others" while the input is still empty for this country
  const [explicitOtherCountry, setExplicitOtherCountry] = useState<string | null>(null);
  const otherMode =
    (!!value && !listedCities.includes(value)) ||
    (!value && explicitOtherCountry === country);

  if (listedCities.length === 0) {
    return (
      <FormInput
        label={label}
        required={rest.required}
        error={rest.error}
        disabled={rest.disabled}
        className={rest.className}
        labelClassName={rest.labelClassName}
        errorClassName={rest.errorClassName}
        wrapperClassName={rest.wrapperClassName}
        onBlur={rest.onBlur}
        type="text"
        value={value}
        maxLength={60}
        onChange={(e) => onChange(e.target.value)}
        placeholder={otherPlaceholder}
      />
    );
  }

  const handleSelect = (option: string) => {
    if (option === OTHER_CITY_OPTION) {
      if (!otherMode) {
        setExplicitOtherCountry(country);
        onChange(''); // start with an empty field to type into
      }
    } else {
      setExplicitOtherCountry(null);
      onChange(option);
    }
  };

  return (
    <Dropdown
      {...rest}
      label={label}
      options={options}
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
