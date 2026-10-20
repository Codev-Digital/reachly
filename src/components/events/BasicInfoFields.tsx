'use client';

import FormInput from '@/components/FormInput';
import RichTextEditor from '@/components/RichTextEditor';
import BannerUpload from '@/components/events/BannerUpload';

import { EVENT_DESCRIPTION_MAX_LENGTH, EVENT_TITLE_MAX_LENGTH } from '@/lib/eventConstants';

export { EVENT_DESCRIPTION_MAX_LENGTH };

export interface BasicInfoValues {
  title: string;
  description: string;
  banner: File | null;
}

export type BasicInfoErrors = Partial<Record<keyof BasicInfoValues, string>>;

export const emptyBasicInfo = (): BasicInfoValues => ({ title: '', description: '', banner: null });

interface BasicInfoFieldsProps {
  values: BasicInfoValues;
  errors: BasicInfoErrors;
  onChange: (patch: Partial<BasicInfoValues>) => void;
  clearError: (key: keyof BasicInfoValues) => void;
  /** Banner already saved on the server (shown when there is no new local file). */
  bannerUrl?: string;
  onClearBannerUrl?: () => void;
}

/** "Basic Info" step of the create-event form: title, description and banner. */
export default function BasicInfoFields({
  values,
  errors,
  onChange,
  clearError,
  bannerUrl,
  onClearBannerUrl,
}: BasicInfoFieldsProps) {
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
        placeholder="e.g. Creator Growth"
      />

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
