import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'reachly';

// Use the service-role key on the server so we can bypass RLS for uploads
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Upload a file buffer to Supabase Storage and return the public URL.
 *
 * @param buffer   Raw file bytes
 * @param mimeType e.g. "image/jpeg"
 * @param path     Storage path, e.g. "profiles/userId/profile.jpg"
 */
export async function uploadToSupabase(
  buffer: Buffer,
  mimeType: string,
  path: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: true, // overwrite if same path exists (re-upload scenario)
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
