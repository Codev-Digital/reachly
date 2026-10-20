import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import CreatorProfile from '@/models/CreatorProfile';

const CACHE_TTL_MS = 60 * 1000;
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
};
let cachedResponse: { at: number; body: unknown } | null = null;

function serialize(event: any, creator?: any) {
  return {
    id: String(event._id),
    status: event.status,
    title: event.title,
    description: event.description,
    bannerUrl: event.bannerUrl || '',
    category: event.category || '',
    dates: event.dates || [],
    publishedAt: event.publishedAt || null,
    createdAt: event.createdAt,
    creator: creator
      ? {
          id: String(creator.userId),
          username: creator.username || '',
          displayName: creator.displayName || 'Creator',
          profilePhoto: creator.profilePhoto || null,
        }
      : null,
  };
}

/** GET — all published events from every creator (newest first). */
export async function GET() {
  try {
    if (cachedResponse && Date.now() - cachedResponse.at < CACHE_TTL_MS) {
      return NextResponse.json(cachedResponse.body, { headers: CACHE_HEADERS });
    }

    await connectDB();

    const events = await Event.find({ status: 'published' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    const creatorIds = [
      ...new Set((events as any[]).map((e) => String(e.creatorId)).filter(Boolean)),
    ];

    const profiles = creatorIds.length
      ? await CreatorProfile.find({
          userId: { $in: creatorIds },
          isDeactivated: { $ne: true },
        })
          .select('userId username displayName profilePhoto')
          .lean()
      : [];

    const profileMap = new Map((profiles as any[]).map((p) => [String(p.userId), p]));

    const body = {
      success: true,
      events: (events as any[])
        .map((e) => {
          const creator = profileMap.get(String(e.creatorId));
          if (!creator) return null;
          return serialize(e, creator);
        })
        .filter(Boolean),
    };

    cachedResponse = { at: Date.now(), body };
    return NextResponse.json(body, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('[GET /api/events]', error);
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 });
  }
}
