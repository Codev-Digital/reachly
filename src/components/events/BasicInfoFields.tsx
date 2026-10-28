'use client';

import FormInput from '@/components/FormInput';
import RichTextEditor from '@/components/RichTextEditor';
import BannerUpload from '@/components/events/BannerUpload';
import Dropdown from '@/components/Dropdown';
import { MapPin } from 'lucide-react';

import { EVENT_DESCRIPTION_MAX_LENGTH, EVENT_TITLE_MAX_LENGTH } from '@/lib/eventConstants';
import { EVENT_CATEGORIES } from '@/lib/eventTicketing';

export { EVENT_DESCRIPTION_MAX_LENGTH };

export type EventMode = 'Online' | 'Physical';
const EVENT_MODES: EventMode[] = ['Online', 'Physical'];

export interface BasicInfoValues {
  title: string;
  category: string;
  description: string;
  banner: File | null;
  eventMode: EventMode | '';
  location: string;
}

export type BasicInfoErrors = Partial<Record<keyof BasicInfoValues, string>>;

export const emptyBasicInfo = (): BasicInfoValues => ({
  title: '',
  category: '',
  description: '',
  banner: null,
  eventMode: '',
  location: '',
});

interface BasicInfoFieldsProps {
  values: BasicInfoValues;
  errors: BasicInfoErrors;
  onChange: (patch: Partial<BasicInfoValues>) => void;
  clearError: (key: keyof BasicInfoValues) => void;
  /** Banner already saved on the server (shown when there is no new local file). */
  bannerUrl?: string;
  onClearBannerUrl?: () => void;
}

/** "Basic Info" step of the create-event form: title, category, event mode, description and banner. */
export default function BasicInfoFields({
  values,
  errors,
  onChange,
  clearError,
  bannerUrl,
  onClearBannerUrl,
}: BasicInfoFieldsProps) {
  const isPhysical = values.eventMode === 'Physical';

  return (
    <div className="space-y-5">
      <FormInput
        label="Title"
        required
        type="text"
        maxLength={EVENT_TITLE_MAX_LENGTH}
        value={values.title}
        onChange={(e) => {
          onChange({ title: e.target.value });
          clearError('title');
        }}
        error={errors.title}
        placeholder="e.g. Creator Growth Summit"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Dropdown
          label="Category"
          required
          options={[...EVENT_CATEGORIES]}
          value={values.category}
          onChange={(category) => {
            onChange({ category });
            clearError('category');
          }}
          error={errors.category}
          placeholder="Select category"
        />

        {/* Event Mode */}
        <div>
          <Dropdown
            label="Event Mode"
            required
            options={EVENT_MODES}
            value={values.eventMode}
            onChange={(mode) => {
              onChange({ eventMode: mode as EventMode, location: '' });
              clearError('eventMode');
            }}
            error={errors.eventMode}
            placeholder="Select event mode"
          />
        </div>
      </div>
      

      {/* Location — only when Physical */}
      {isPhysical && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <FormInput
            label="Location"
            required
            type="text"
            value={values.location}
            icon={<MapPin size={16} />}
            onChange={(e) => {
              onChange({ location: e.target.value });
              clearError('location');
            }}
            error={errors.location}
            placeholder="e.g. Expo Centre, Karachi"
          />
        </div>
      )}

      <RichTextEditor
        label="Description"
        required
        value={values.description}
        onChange={(html) => {
          onChange({ description: html });
          clearError('description');
        }}
        maxLength={EVENT_DESCRIPTION_MAX_LENGTH}
        autoHeight
        hint="Appears on your event cards"
        error={errors.description}
        placeholder="Enter Description"
      />

      <BannerUpload
        label="Banner Image"
        required
        file={values.banner}
        previewUrl={bannerUrl}
        onChange={(banner) => {
          onChange({ banner });
          if (!banner) onClearBannerUrl?.();
          clearError('banner');
        }}
        error={errors.banner}
      />
    </div>
  );
}
