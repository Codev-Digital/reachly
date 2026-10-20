import mongoose from 'mongoose';

/** FormData file from the browser (File in modern Node / Blob in some runtimes). */
export type UploadBlob = {
  name?: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export function asUploadBlob(value: FormDataEntryValue | null): UploadBlob | null {
  if (!value || typeof value === 'string') return null;
  const file = value as UploadBlob;
  if (typeof file.arrayBuffer !== 'function' || !file.size) return null;
  return file;
}

/** Turn a caught error into a safe JSON body for the client. */
export function eventSaveError(err: unknown): { status: number; body: { error: string; field?: string } } {
  if (err instanceof mongoose.Error.ValidationError) {
    const first = Object.values(err.errors)[0];
    return {
      status: 422,
      body: { error: first?.message || 'Event data is invalid.' },
    };
  }
  if (err instanceof Error) {
    const message = err.message || 'Failed to save event.';
    // Surface upload / config problems clearly; keep unknown internals short
    if (/supabase|upload|storage|bucket/i.test(message)) {
      return { status: 502, body: { error: message, field: 'banner' } };
    }
    if (process.env.NODE_ENV !== 'production') {
      return { status: 500, body: { error: message } };
    }
  }
  return { status: 500, body: { error: 'Failed to save event.' } };
}
