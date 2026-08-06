import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 });
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'reachly';
    const userId = (session.user as any).id || (session.user as any)._id;
    
    // Generate a secure random filename to avoid collisions
    const ext = fileName.split('.').pop() || '';
    const safeName = crypto.randomBytes(16).toString('hex') + (ext ? `.${ext}` : '');
    const path = `chat-attachments/${userId}/${safeName}`;

    // Create a signed upload URL valid for 60 seconds
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) {
      console.error('Supabase signed URL error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the signed URL and the public URL where the file will be accessible
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (error: any) {
    console.error('Upload token POST error:', error);
    return NextResponse.json({ error: 'Failed to generate upload token' }, { status: 500 });
  }
}
