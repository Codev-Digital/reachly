import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';
import { MAX_CHAT_IMAGE_BYTES } from '@/lib/chatAttachments';

const ALLOWED_PREFIXES = ['image/', 'video/', 'application/pdf', 'application/msword', 'application/vnd'];
const ALLOWED_EXACT = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, fileType, fileSize } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 });
    }

    const typeOk =
      ALLOWED_EXACT.has(fileType) ||
      ALLOWED_PREFIXES.some((p) => fileType.startsWith(p));
    if (!typeOk) {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 422 });
    }

    if (fileType.startsWith('image/')) {
      const size = Number(fileSize);
      if (Number.isFinite(size) && size > MAX_CHAT_IMAGE_BYTES) {
        return NextResponse.json(
          { error: 'Each image must be 5 MB or less.' },
          { status: 422 }
        );
      }
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'reachly';
    const userId = (session.user as any).id || (session.user as any)._id;

    const ext = fileName.split('.').pop() || '';
    const safeName = crypto.randomBytes(16).toString('hex') + (ext ? `.${ext}` : '');
    const path = `chat-attachments/${userId}/${safeName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) {
      console.error('Supabase signed URL error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
      maxImageBytes: MAX_CHAT_IMAGE_BYTES,
    });
  } catch (error: any) {
    console.error('Upload token POST error:', error);
    return NextResponse.json({ error: 'Failed to generate upload token' }, { status: 500 });
  }
}
