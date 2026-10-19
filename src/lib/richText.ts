// Client-safe helpers for the "Detailed bio" rich text field.
// Rich text is stored as a small, sanitized HTML string. Older bios were plain text,
// so every helper here also handles plain text.

/** True when the value is HTML produced by the rich text editor (vs. legacy plain text). */
export const looksLikeRichText = (value?: string | null): boolean =>
  !!value && /^\s*<(p|ul|ol|h[1-6]|blockquote)[\s>]/i.test(value);

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Turns legacy plain text into paragraphs so the editor can load it. */
export const plainTextToHtml = (text: string): string =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');

/** Value to feed into the editor (HTML as-is, plain text converted). */
export const toEditorHtml = (value?: string | null): string => {
  if (!value) return '';
  return looksLikeRichText(value) ? value : plainTextToHtml(value);
};

/** Visible text of a bio, for length checks, empty checks and short previews. */
export const richTextToPlain = (value?: string | null): string => {
  if (!value) return '';
  if (!looksLikeRichText(value)) return value.trim();
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|h[1-6]|blockquote)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
};

export const isRichTextEmpty = (value?: string | null): boolean => richTextToPlain(value).length === 0;

/**
 * Number of visible characters in a stored value, counted the same way the editor counts them
 * (text only, tags ignored, a line break counts as one). Use this for server-side limit checks.
 */
export const richTextLength = (value?: string | null): number => {
  if (!value) return 0;
  if (!looksLikeRichText(value)) return value.trim().length;
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&').length;
};

/** Max visible characters allowed in the detailed bio. */
export const DETAILED_BIO_MAX_LENGTH = 1000;

/** Max visible characters allowed in a session description. */
export const SESSION_DESCRIPTION_MAX_LENGTH = 5000;
