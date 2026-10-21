export const MAX_CHAT_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB per image
export const MAX_CHAT_IMAGES_PER_MESSAGE = 10;

export type ChatAttachment = {
  url: string;
  fileType: string;
  fileName: string;
  fileSize: number;
};

export function isImageFile(file: File | { type?: string; fileType?: string }) {
  const t = 'type' in file && file.type ? file.type : (file as any).fileType || '';
  return String(t).startsWith('image/') || t === 'image';
}

export function formatFileSizeMb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export type ChatFileFilterResult = {
  /** Files that can be uploaded (≤5MB images / other allowed files). */
  accepted: File[];
  /** Images skipped because they exceed 5 MB. */
  oversized: File[];
  /** Hard error that blocks the whole pick (mixed types, empty, etc.). */
  error: string | null;
};

/**
 * Split a batch into uploadable files vs oversized images.
 * Oversized images are skipped so the rest of the batch can still upload.
 */
export function filterChatFiles(files: File[]): ChatFileFilterResult {
  if (!files.length) {
    return { accepted: [], oversized: [], error: 'No file selected.' };
  }

  const allImages = files.every((f) => f.type.startsWith('image/'));
  if (files.length > 1 && !allImages) {
    return {
      accepted: [],
      oversized: [],
      error: 'Multiple files are only supported for images. Send other files one at a time.',
    };
  }

  const oversized: File[] = [];
  const accepted: File[] = [];

  for (const file of files) {
    if (file.type.startsWith('image/') && file.size > MAX_CHAT_IMAGE_BYTES) {
      oversized.push(file);
    } else {
      accepted.push(file);
    }
  }

  let nextAccepted = accepted;
  if (nextAccepted.length > MAX_CHAT_IMAGES_PER_MESSAGE) {
    nextAccepted = nextAccepted.slice(0, MAX_CHAT_IMAGES_PER_MESSAGE);
  }

  if (!nextAccepted.length && !oversized.length) {
    return { accepted: [], oversized: [], error: 'No file selected.' };
  }

  return { accepted: nextAccepted, oversized, error: null };
}

/** @deprecated Prefer filterChatFiles — kept for callers that only need a hard error string. */
export function validateChatFiles(files: File[]): string | null {
  const result = filterChatFiles(files);
  if (result.error) return result.error;
  if (!result.accepted.length && result.oversized.length) {
    const names = result.oversized.map((f) => `"${f.name}"`).join(', ');
    return `${names} ${result.oversized.length === 1 ? 'is' : 'are'} more than 5 MB.`;
  }
  return null;
}

export function oversizedImagesToastMessage(oversized: File[]): string {
  if (!oversized.length) return '';
  if (oversized.length === 1) {
    return `"${oversized[0].name}" is more than 5 MB`;
  }
  if (oversized.length <= 3) {
    return oversized.map((f) => `"${f.name}"`).join(', ') + ' are more than 5 MB';
  }
  return `${oversized.length} images are more than 5 MB and were skipped`;
}

export function attachmentTypeForFile(file: File): string {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf') return 'pdf';
  return 'document';
}

/** Decode album JSON embedded as `label|||JSON|||` in message content. */
export function decodeAttachmentsFromContent(content?: string): ChatAttachment[] {
  if (!content || !content.includes('|||')) return [];
  const parts = content.split('|||');
  if (parts.length < 3) return [];
  try {
    const parsed = JSON.parse(parts[1]);
    if (Array.isArray(parsed)) return parsed.filter((a) => a?.url);
    if (parsed?.attachments && Array.isArray(parsed.attachments)) {
      return parsed.attachments.filter((a: ChatAttachment) => a?.url);
    }
    if (parsed?.url) return [parsed as ChatAttachment];
  } catch {
    /* ignore */
  }
  return [];
}

function pickRicherAttachments(
  fromFields: ChatAttachment[],
  fromContent: ChatAttachment[]
): ChatAttachment[] {
  // Older rows only persisted singular `attachment` while the full album lived in content.
  if (fromContent.length > fromFields.length) return fromContent;
  if (fromFields.length > 0) return fromFields;
  return fromContent;
}

/** Normalize message to always expose an attachments array (backward compatible). */
export function normalizeMessageAttachments(msg: {
  attachment?: ChatAttachment | null;
  attachments?: ChatAttachment[] | null;
  content?: string;
}): ChatAttachment[] {
  const fromFields =
    Array.isArray(msg.attachments) && msg.attachments.length > 0
      ? msg.attachments.filter((a) => a?.url)
      : msg.attachment?.url
        ? [msg.attachment]
        : [];
  const fromContent = decodeAttachmentsFromContent(msg.content);
  return pickRicherAttachments(fromFields, fromContent);
}

export function parseEncodedAttachmentMessage<T extends { content?: string; attachment?: ChatAttachment; attachments?: ChatAttachment[] }>(
  msg: T
): T {
  if (!msg.content || !msg.content.includes('|||')) return msg;
  const parts = msg.content.split('|||');
  if (parts.length < 3) return msg;
  const list = decodeAttachmentsFromContent(msg.content);
  if (!list.length) return { ...msg, content: parts[0] };
  const fromFields =
    Array.isArray(msg.attachments) && msg.attachments.length > 0
      ? msg.attachments
      : msg.attachment?.url
        ? [msg.attachment]
        : [];
  const attachments = pickRicherAttachments(fromFields, list);
  return {
    ...msg,
    content: parts[0],
    attachments,
    attachment: msg.attachment || attachments[0],
  };
}
