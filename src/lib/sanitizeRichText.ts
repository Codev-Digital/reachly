import sanitizeHtml from 'sanitize-html';
import { isRichTextEmpty, looksLikeRichText } from '@/lib/richText';

// SERVER ONLY. Cleans rich text coming from the browser before it is stored or returned,
// so only simple formatting survives (no scripts, images, styles or event handlers).
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote', 'a'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
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
