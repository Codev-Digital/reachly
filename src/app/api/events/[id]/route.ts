import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import CreatorProfile from '@/models/CreatorProfile';
import { isValidObjectId } from '@/lib/eventValidation';

type RouteContext = { params: Promise<{ id: string }> };

/** GET — one published event (public detail for buyers). */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await connectDB();

    const event = await Event.findOne({
      _id: new mongoose.Types.ObjectId(id),
      status: 'published',
      deletedAt: null,
    }).lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const creator = await CreatorProfile.findOne({
      userId: (event as any).creatorId,
      isDeactivated: { $ne: true },
    })
      .select('userId username displayName profilePhoto shortBio city country')
      .lean();

    if (!creator) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event: {
        id: String((event as any)._id),
        status: (event as any).status,
        title: (event as any).title,
        description: (event as any).description,
        bannerUrl: (event as any).bannerUrl || '',
        category: (event as any).category || '',
        eventMode: (event as any).eventMode || '',
        location: (event as any).location || '',
        dates: (event as any).dates || [],
        refundPolicy: (event as any).refundPolicy || '',
        termsAndConditions: (event as any).termsAndConditions || '',
        publishedAt: (event as any).publishedAt || null,
        createdAt: (event as any).createdAt,
        creator: {
          id: String((creator as any).userId),
          username: (creator as any).username || '',
          displayName: (creator as any).displayName || 'Creator',
          profilePhoto: (creator as any).profilePhoto || null,
          shortBio: (creator as any).shortBio || '',
          city: (creator as any).city || '',
          country: (creator as any).country || '',
        },
      },
    });
  } catch (error) {
    console.error('[GET /api/events/:id]', error);
    return NextResponse.json({ error: 'Failed to load event' }, { status: 500 });
  }
}
