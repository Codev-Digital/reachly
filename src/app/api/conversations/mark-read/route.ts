import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId, role } = await request.json();
        if (!conversationId || !role) {
            return NextResponse.json({ error: 'Missing conversationId or role' }, { status: 400 });
        }

        await connectDB();

        const senderRoleToMarkRead = role === 'creator' ? 'user' : 'creator';

        await Message.updateMany(
            { 
                conversationId: new mongoose.Types.ObjectId(conversationId), 
                senderRole: senderRoleToMarkRead, 
                read: false 
            },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
