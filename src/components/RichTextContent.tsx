import { twMerge } from 'tailwind-merge';
import { looksLikeRichText } from '@/lib/richText';

/**
 * Renders a bio. HTML bios are sanitized on the server (see lib/sanitizeRichText) before they are
 * stored or returned by the API; older plain-text bios are rendered as text.
 */
export default function RichTextContent({
  value,
  className,
}: {
  value?: string | null;
  className?: string;
}) {
  if (!value) return null;

  if (looksLikeRichText(value)) {
    return <div className={twMerge('rich-text', className)} dangerouslySetInnerHTML={{ __html: value }} />;
  }

  return <p className={twMerge('whitespace-pre-line', className)}>{value}</p>;
}
