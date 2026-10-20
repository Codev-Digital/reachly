import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CalendarBlock from '@/models/CalendarBlock';
import { format12h, parse24h } from '@/lib/slots';

async function currentCreator() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  await connectDB();
  return (await User.findOne({ email: session.user.email }).select('_id').lean()) as any;
}

// GET: this creator's upcoming outside sessions
export async function GET() {
  const creator = await currentCreator();
  if (!creator) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const blocks = await CalendarBlock.find({ creatorId: creator._id, scheduledDate: { $gte: since } })
    .sort({ scheduledDate: 1 })
    .lean();
  return NextResponse.json({
    success: true,
    blocks: blocks.map((b: any) => ({
      id: String(b._id),
      date: b.scheduledDate.toISOString().slice(0, 10),
      startTime: b.startTime,
      durationMinutes: b.durationMinutes,
      title: b.title || '',
    })),
  });
}

// POST { date: "YYYY-MM-DD", time: "HH:mm" (24h), durationMinutes, title? }
export async function POST(req: NextRequest) {
  const creator = await currentCreator();
  if (!creator) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { date, time, durationMinutes, title } = await req.json();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{1,2}:\d{2}$/.test(time || '')) {
    return NextResponse.json({ error: 'Choose a valid date and start time.' }, { status: 400 });
  }
  const duration = Number(durationMinutes);
  if (!Number.isInteger(duration) || duration < 5 || duration > 1440) {
    return NextResponse.json({ error: 'Duration must be between 5 and 1440 minutes.' }, { status: 400 });
  }

  const [y, m, d] = date.split('-').map(Number);
  const block = await CalendarBlock.create({
    creatorId: creator._id,
    scheduledDate: new Date(Date.UTC(y, m - 1, d, 12, 0, 0)),
    startTime: format12h(parse24h(time)),
    durationMinutes: duration,
    title: typeof title === 'string' ? title.trim().slice(0, 100) : undefined,
  });
  return NextResponse.json({ success: true, id: String(block._id) });
}

// DELETE ?id=
export async function DELETE(req: NextRequest) {
  const creator = await currentCreator();
  if (!creator) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  const res = await CalendarBlock.deleteOne({ _id: id, creatorId: creator._id });
  return NextResponse.json({ success: res.deletedCount === 1 });
}
