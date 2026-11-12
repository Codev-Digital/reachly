import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';

const ADMIN_EMAILS = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];

function isAdmin(email?: string | null) {
  return Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()));
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const messages = await ContactMessage.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      success: true,
      messages: (messages as any[]).map((m) => ({
        id: String(m._id),
        ticketRef: `SUP-${String(m._id).slice(-6).toUpperCase()}`,
        fullName: m.fullName,
        email: m.email,
        subject: m.subject,
        message: m.message,
        status: m.status === 'resolved' ? 'resolved' : 'open',
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('[GET /api/admin/support]', error);
    return NextResponse.json({ error: 'Failed to load support messages' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !['open', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    await connectDB();
    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).lean();
    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('[PATCH /api/admin/support]', error);
    return NextResponse.json({ error: 'Failed to update message status' }, { status: 500 });
  }
}
