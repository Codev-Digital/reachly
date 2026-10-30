import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import CreatorProfile from '@/models/CreatorProfile';
import { pktTodayISO } from '@/lib/pkt';

const CACHE_TTL_MS = 60 * 1000;
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
};
let cachedResponse: { at: number; body: unknown } | null = null;
let featuredCache: { at: number; body: unknown } | null = null;
let featuredRequest: Promise<unknown> | null = null;

function serialize(event: any, creator?: any) {
  return {
    id: String(event._id),
    status: event.status,
    title: event.title,
    description: event.description,
    bannerUrl: event.bannerUrl || '',
    category: event.category || '',
    eventMode: event.eventMode || '',
    location: event.location || '',
    dates: event.dates || [],
    publishedAt: event.publishedAt || null,
    createdAt: event.createdAt,
    creator: creator
      ? {
          id: String(creator.userId),
          username: creator.username || '',
          displayName: creator.displayName || 'Creator',
          profilePhoto: creator.profilePhoto || null,
          city: creator.city || '',
          country: creator.country || '',
        }
      : null,
  };
}

async function getFeaturedEvents() {
  if (featuredCache && Date.now() - featuredCache.at < CACHE_TTL_MS) {
    return featuredCache.body;
  }
  if (featuredRequest) return featuredRequest;

  featuredRequest = (async () => {
    await connectDB();
    const today = pktTodayISO();
    const events = await Event.aggregate([
      { $match: { status: 'published', deletedAt: null, 'dates.date': { $gte: today } } },
      { $unwind: '$dates' },
      { $match: { 'dates.date': { $gte: today } } },
      { $sort: { 'dates.date': 1, publishedAt: -1, _id: 1 } },
      { $group: { _id: '$_id', event: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$event' } },
      { $limit: 4 },
      {
        $project: {
          title: 1,
          description: 1,
          bannerUrl: 1,
          category: 1,
          eventMode: 1,
          location: 1,
          creatorId: 1,
          publishedAt: 1,
          dates: ['$dates'],
        },
      },
    ]);

    const creatorIds = [...new Set(events.map((event) => String(event.creatorId)).filter(Boolean))];
    const profiles = creatorIds.length
      ? await CreatorProfile.find({
          userId: { $in: creatorIds },
          isDeactivated: { $ne: true },
        })
          .select('userId username displayName profilePhoto city country')
          .lean()
      : [];
    const profileMap = new Map(profiles.map((profile) => [String(profile.userId), profile]));

    const body = {
      success: true,
      events: events.flatMap((event) => {
        const creator = profileMap.get(String(event.creatorId));
        if (!creator) return [];
        return [{
          id: String(event._id),
          title: event.title,
          description: event.description,
          bannerUrl: event.bannerUrl || '',
          category: event.category || '',
          eventMode: event.eventMode || '',
          location: event.location || '',
          dates: event.dates || [],
          creator: {
            username: creator.username || '',
            displayName: creator.displayName || 'Creator',
            city: creator.city || '',
            country: creator.country || '',
          },
        }];
      }),
    };

    featuredCache = { at: Date.now(), body };
    return body;
  })();

  try {
    return await featuredRequest;
  } finally {
    featuredRequest = null;
  }
}

/** GET — published events, or the next four upcoming events for the landing page. */
export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get('featured') === '1') {
      const body = await getFeaturedEvents();
      return NextResponse.json(body, { headers: CACHE_HEADERS });
    }

    if (cachedResponse && Date.now() - cachedResponse.at < CACHE_TTL_MS) {
      return NextResponse.json(cachedResponse.body, { headers: CACHE_HEADERS });
    }

    await connectDB();

    const events = await Event.find({ status: 'published', deletedAt: null })
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
          .select('userId username displayName profilePhoto city country')
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
