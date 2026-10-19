import sanitizeHtml from 'sanitize-html';
import {
  SESSION_DESCRIPTION_MAX_LENGTH,
  isRichTextEmpty,
  looksLikeRichText,
  richTextLength,
} from '@/lib/richText';

// SERVER ONLY. Cleans rich text coming from the browser before it is stored or returned,
// so only simple formatting survives (no scripts, images, styles or event handlers).
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'a'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    // numbered lists keep their style: 1, a, A, i (roman), I (roman) and the start number
    ol: [{ name: 'type', values: ['1', 'a', 'A', 'i', 'I'] }, 'start'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer nofollow' }),
  },
};

/**
 * Sanitizes a bio. Legacy plain text is returned untouched (it is rendered as text, never as HTML).
 * Returns an empty string when the bio has no visible text.
 */
export function sanitizeRichText(value?: string | null): string {
  if (!value) return '';
  if (!looksLikeRichText(value)) return value.trim();
  const clean = sanitizeHtml(value, OPTIONS).trim();
  return isRichTextEmpty(clean) ? '' : clean;
}

/**
 * Validates + sanitizes a session description (rich text, max SESSION_DESCRIPTION_MAX_LENGTH visible
 * characters). Returns either the cleaned value or an error message for the API response.
 */
export function cleanSessionDescription(value: unknown): { value: string } | { error: string } {
  if (typeof value !== 'string' || !value.trim()) {
    return { error: 'Session description is required.' };
  }
  const clean = sanitizeRichText(value);
  if (!clean) return { error: 'Session description is required.' };
  if (richTextLength(clean) > SESSION_DESCRIPTION_MAX_LENGTH) {
    return { error: `Session description must be ${SESSION_DESCRIPTION_MAX_LENGTH} characters or fewer.` };
  }
  return { value: clean };
}
