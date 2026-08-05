import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { uploadToSupabase } from '@/lib/supabase';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const formData = await request.formData();
        const audioFile = formData.get('audio') as File | null;

        if (!audioFile || audioFile.size === 0) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        const bytes = await audioFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload path: voice-notes/userId/timestamp.webm (or mp3)
        const fileExt = audioFile.type.split('/')[1] || 'webm';
        const storagePath = `voice-notes/${user._id}/${Date.now()}.${fileExt}`;

        const url = await uploadToSupabase(buffer, audioFile.type, storagePath);

        return NextResponse.json({ success: true, url });
    } catch (error: any) {
        console.error('Upload voice error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
