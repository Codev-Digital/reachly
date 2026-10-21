import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import CreatorProfile from '@/models/CreatorProfile';
import { richTextPreview } from '@/lib/richText';
import { formatEventCardDate, formatEventCardTime } from '@/lib/eventDisplay';

const PAGE_SIZE = 9;

function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

function todayISO() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

type DisplayStatus = 'Upcoming' | 'Completed' | 'Cancelled' | 'Draft';

function displayStatus(event: { status?: string; dates?: { date?: string }[] }, today: string): DisplayStatus {
  if (event.status === 'cancelled') return 'Cancelled';
  if (event.status === 'draft') return 'Draft';
  const dates = (event.dates || [])
    .map((d) => d.date)
    .filter((d): d is string => !!d)
    .sort();
  const last = dates[dates.length - 1];
  if (!last || last < today) return 'Completed';
  return 'Upcoming';
}

function growthLabel(thisMonth: number, lastMonth: number) {
  if (lastMonth === 0) {
    return thisMonth > 0 ? '↑ +100% from last month' : '→ 0% from last month';
  }
  const pct = ((thisMonth - lastMonth) / lastMonth) * 100;
  const sign = pct >= 0 ? '↑ +' : '↓ ';
  return `${sign}${Math.abs(pct).toFixed(1)}% from last month`;
}

/** GET — admin event KPIs + paginated list (9 per page). */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('limit') || String(PAGE_SIZE), 10) || PAGE_SIZE)
    );
    const search = (searchParams.get('search') || '').trim();
    const category = (searchParams.get('category') || '').trim();

    const today = todayISO();
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const mongoFilter: Record<string, unknown> = {};
    if (category && category !== 'All Categories') {
      mongoFilter.category = category;
    }
    if (search) {
      mongoFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const [kpiRows, profiles, total, pageEvents, categoryRows] = await Promise.all([
      Event.find({})
        .select('status dates createdAt')
        .lean(),
      CreatorProfile.find({}).select('userId username displayName profilePhoto createdAt').lean(),
      Event.countDocuments(mongoFilter),
      Event.find(mongoFilter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Event.distinct('category'),
    ]);

    const profileMap = new Map((profiles as any[]).map((p) => [String(p.userId), p]));

    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;
    let upcomingThisMonth = 0;
    let upcomingLastMonth = 0;
    let completedThisMonth = 0;
    let completedLastMonth = 0;
    let cancelledThisMonth = 0;
    let cancelledLastMonth = 0;

    for (const e of kpiRows as any[]) {
      const status = displayStatus(e, today);
      const created = new Date(e.createdAt);
      const inThisMonth = created >= startOfCurrentMonth;
      const inLastMonth = created >= startOfLastMonth && created < startOfCurrentMonth;

      if (status === 'Upcoming') {
        upcoming += 1;
        if (inThisMonth) upcomingThisMonth += 1;
        if (inLastMonth) upcomingLastMonth += 1;
      } else if (status === 'Completed') {
        completed += 1;
        if (inThisMonth) completedThisMonth += 1;
        if (inLastMonth) completedLastMonth += 1;
      } else if (status === 'Cancelled') {
        cancelled += 1;
        if (inThisMonth) cancelledThisMonth += 1;
        if (inLastMonth) cancelledLastMonth += 1;
      }
    }

    const creatorsThisMonth = (profiles as any[]).filter(
      (p) => new Date(p.createdAt || 0) >= startOfCurrentMonth
    ).length;
    const creatorsLastMonth = (profiles as any[]).filter((p) => {
      const d = new Date(p.createdAt || 0);
      return d >= startOfLastMonth && d < startOfCurrentMonth;
    }).length;

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);

    // If client asked for a page past the end (e.g. after filter change), re-fetch last page
    let rows = pageEvents as any[];
    if (page > totalPages && total > 0) {
      rows = await Event.find(mongoFilter)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * limit)
        .limit(limit)
        .lean();
    }

    const events = rows.map((e) => {
      const first = (e.dates || [])[0];
      const creator = profileMap.get(String(e.creatorId));
      const creatorLabel = creator?.displayName || creator?.username || '';
      return {
        id: String(e._id),
        title: e.title || 'Untitled event',
        description: richTextPreview(e.description, 120) || 'No description yet.',
        date: formatEventCardDate(first?.date),
        time: formatEventCardTime(first),
        venue: creatorLabel
          ? `${e.category || 'Uncategorized'} · ${creatorLabel}`
          : e.category || 'Venue TBA',
        category: e.category || '',
        image: e.bannerUrl || '/assets/event-1.jpg',
        status: displayStatus(e, today),
        creatorName: creatorLabel,
        createdAt: e.createdAt,
      };
    });

    const categories = [
      'All Categories',
      ...(categoryRows as string[])
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    ];

    return NextResponse.json({
      success: true,
      kpis: {
        totalCreators: (profiles as any[]).length,
        totalCreatorsTrend: growthLabel(creatorsThisMonth, creatorsLastMonth),
        upcomingEvents: upcoming,
        upcomingEventsTrend: growthLabel(upcomingThisMonth, upcomingLastMonth),
        completedEvents: completed,
        completedEventsTrend: growthLabel(completedThisMonth, completedLastMonth),
        cancelledEvents: cancelled,
        cancelledEventsTrend: growthLabel(cancelledThisMonth, cancelledLastMonth),
      },
      events,
      categories,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/events]', error);
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 });
  }
}
