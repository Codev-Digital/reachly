import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import EventPurchase from '@/models/EventPurchase';
import CreatorProfile from '@/models/CreatorProfile';
import User from '@/models/User';
import { currentCreatorId } from '@/lib/creatorAuth';
import { uploadToSupabase } from '@/lib/supabase';
import {
  bannerExtension,
  cleanEventPayload,
  isValidObjectId,
  validateBannerFile,
  type EventStatusInput,
} from '@/lib/eventValidation';
import { asUploadBlob, eventSaveError } from '@/lib/eventApi';
import { ensureEventBroadcastChannel } from '@/lib/eventBroadcastChat';

function serialize(event: any) {
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
    refundPolicy: event.refundPolicy || '',
    termsAndConditions: event.termsAndConditions || '',
    volunteers: event.volunteers || [],
    publishedAt: event.publishedAt || null,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

type RouteContext = { params: Promise<{ id: string }> };

async function ownedEvent(creatorId: string, id: string) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  return Event.findOne({
    _id: new mongoose.Types.ObjectId(id),
    creatorId: new mongoose.Types.ObjectId(creatorId),
    deletedAt: null,
  });
}

async function parseBody(req: NextRequest): Promise<{
  payload: unknown;
  banner: ReturnType<typeof asUploadBlob>;
  status: EventStatusInput;
}> {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const raw = form.get('data');
    let payload: unknown = {};
    if (typeof raw === 'string' && raw.trim()) {
      try {
        payload = JSON.parse(raw);
      } catch {
        throw new Error('INVALID_JSON');
      }
    }
    const statusRaw = form.get('status');
    const status: EventStatusInput = statusRaw === 'published' ? 'published' : 'draft';
    return {
      payload,
      banner: asUploadBlob(form.get('banner')),
      status,
    };
  }

  const body = await req.json();
  const status: EventStatusInput = body?.status === 'published' ? 'published' : 'draft';
  return { payload: body, banner: null, status };
}

/** GET — one event owned by this creator. */
export async function GET(_req: NextRequest, context: RouteContext) {
  const creatorId = await currentCreatorId();
  if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const event = await ownedEvent(creatorId, id);
  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

  const purchases = await EventPurchase.find({
    eventId: event._id,
    status: { $in: ['confirmed', 'completed'] },
    paymentStatus: 'paid',
  }).sort({ createdAt: -1 }).lean();
  const buyerIds = [...new Set(purchases.map((purchase) => String(purchase.userId)))];
  const [buyers, creatorProfile] = await Promise.all([
    buyerIds.length
      ? User.find({ _id: { $in: buyerIds } }).select('name email profilePhoto').lean()
      : [],
    CreatorProfile.findOne({ userId: creatorId }).select('username displayName profilePhoto shortBio city country').lean(),
  ]);
  const buyerMap = new Map((buyers as Array<{
    _id: mongoose.Types.ObjectId;
    name?: string;
    email?: string;
    profilePhoto?: string;
  }>).map((buyer) => [String(buyer._id), buyer]));
  const buyerPurchases = purchases.map((purchase) => {
    const buyer = buyerMap.get(String(purchase.userId));
    const quantity = Number(purchase.quantity) || 1;
    const persons = Number(purchase.tierPersons) || 1;
    return {
      id: String(purchase._id),
      name: buyer?.name || 'Ticket holder',
      email: buyer?.email || purchase.buyerEmail,
      profilePhoto: buyer?.profilePhoto || null,
      date: purchase.eventDate,
      tier: purchase.tierTitle,
      quantity,
      seats: quantity * persons,
      amount: Number(purchase.tierPrice) * quantity,
      purchasedAt: purchase.createdAt,
      ticketRef: purchase.ticketRef,
    };
  });
  const eventData = serialize(event);
  return NextResponse.json({
    success: true,
    event: {
      ...eventData,
      creator: creatorProfile ? {
        username: creatorProfile.username || '',
        displayName: creatorProfile.displayName || '',
        profilePhoto: creatorProfile.profilePhoto || null,
        shortBio: creatorProfile.shortBio || '',
        city: creatorProfile.city || '',
        country: creatorProfile.country || '',
      } : null,
    },
    sales: {
      totalBuyers: new Set(purchases.map((purchase) => String(purchase.userId))).size,
      totalTickets: purchases.reduce((sum, purchase) => sum + (Number(purchase.quantity) || 1), 0),
      totalSeats: purchases.reduce((sum, purchase) =>
        sum + (Number(purchase.quantity) || 1) * (Number(purchase.tierPersons) || 1), 0),
      totalRevenue: purchases.reduce((sum, purchase) =>
        sum + (Number(purchase.tierPrice) || 0) * (Number(purchase.quantity) || 1), 0),
      buyers: buyerPurchases,
    },
  });
}

/** PUT — update a draft / publish (multipart or JSON). */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const creatorId = await currentCreatorId();
    if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    const event = await ownedEvent(creatorId, id);
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    if (event.status === 'cancelled') {
      return NextResponse.json({ error: 'Cancelled events cannot be edited.' }, { status: 409 });
    }

    let parsed: Awaited<ReturnType<typeof parseBody>>;
    try {
      parsed = await parseBody(req);
    } catch (e: any) {
      if (e?.message === 'INVALID_JSON') {
        return NextResponse.json({ error: 'Invalid event data.' }, { status: 400 });
      }
      throw e;
    }

    const { payload, banner, status } = parsed;
    const existingBanner = event.bannerUrl || '';
    const incomingBannerUrl =
      typeof (payload as any)?.bannerUrl === 'string' ? (payload as any).bannerUrl : existingBanner;

    const bannerCheck = validateBannerFile(
      banner,
      status === 'published' && !incomingBannerUrl && !existingBanner
    );
    if ('error' in bannerCheck) {
      return NextResponse.json({ error: bannerCheck.error, field: 'banner' }, { status: 422 });
    }

    const cleaned = cleanEventPayload(
      { ...(payload as object), bannerUrl: incomingBannerUrl || existingBanner },
      status,
      { hasBannerUpload: !!banner }
    );
    if ('error' in cleaned) {
      return NextResponse.json({ error: cleaned.error, field: cleaned.field }, { status: 422 });
    }

    let bannerUrl = cleaned.value.bannerUrl || existingBanner;
    if (banner) {
      const buffer = Buffer.from(await banner.arrayBuffer());
      const ext = bannerExtension(banner.type);
      bannerUrl = await uploadToSupabase(
        buffer,
        banner.type,
        `events/${creatorId}/${id}-banner.${ext}`
      );
    }

    if (status === 'published' && !bannerUrl) {
      return NextResponse.json({ error: 'Banner image is required.', field: 'banner' }, { status: 422 });
    }

    event.title = cleaned.value.title;
    event.description = cleaned.value.description;
    event.bannerUrl = bannerUrl;
    event.category = cleaned.value.category;
    event.eventMode = cleaned.value.eventMode || '';
    event.location = cleaned.value.location || '';
    event.dates = cleaned.value.dates;
    event.refundPolicy = cleaned.value.refundPolicy;
    event.termsAndConditions = cleaned.value.termsAndConditions;
    event.status = status;
    if (status === 'published' && !event.publishedAt) {
      event.publishedAt = new Date();
    }

    await event.save();

    // Keep / create the broadcast chat channel (title & banner stay in sync)
    try {
      await ensureEventBroadcastChannel(event);
    } catch (chatErr) {
      console.error('[PUT /api/creators/events/:id] broadcast channel:', chatErr);
    }

    return NextResponse.json({ success: true, event: serialize(event) });
  } catch (err) {
    console.error('[PUT /api/creators/events/:id]', err);
    const { status, body } = eventSaveError(err);
    return NextResponse.json(body, { status });
  }
}

/**
 * PATCH — show / hide only (`{ visible: boolean }` → published | draft).
 * Unhiding re-validates the stored event so incomplete drafts stay private.
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const creatorId = await currentCreatorId();
    if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    const event = await ownedEvent(creatorId, id);
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    if (event.status === 'cancelled') {
      return NextResponse.json({ error: 'Cancelled events cannot be shown or hidden.' }, { status: 409 });
    }

    const body = await req.json().catch(() => ({}));
    const visible = body?.visible === true;
    const status: EventStatusInput = visible ? 'published' : 'draft';

    if (status === event.status) {
      return NextResponse.json({ success: true, event: serialize(event) });
    }

    if (status === 'published') {
      if (!event.bannerUrl) {
        return NextResponse.json(
          {
            error: 'Add a banner image before showing this event. Open Edit to finish setup.',
            field: 'banner',
          },
          { status: 422 }
        );
      }

      const plain = typeof event.toObject === 'function' ? event.toObject() : event;
      const cleaned = cleanEventPayload(
        {
          title: plain.title,
          description: plain.description,
          bannerUrl: plain.bannerUrl,
          category: plain.category,
          eventMode: plain.eventMode,
          location: plain.location,
          dates: plain.dates,
          refundPolicy: plain.refundPolicy,
          termsAndConditions: plain.termsAndConditions,
        },
        'published',
        { hasBannerUpload: false }
      );
      if ('error' in cleaned) {
        return NextResponse.json(
          {
            error: `${cleaned.error} Open Edit to finish the event before showing it.`,
            field: cleaned.field,
          },
          { status: 422 }
        );
      }
    }

    event.status = status;
    if (status === 'published' && !event.publishedAt) {
      event.publishedAt = new Date();
    }
    await event.save();

    if (status === 'published') {
      try {
        await ensureEventBroadcastChannel(event);
      } catch (chatErr) {
        console.error('[PATCH /api/creators/events/:id] broadcast channel:', chatErr);
      }
    }

    return NextResponse.json({ success: true, event: serialize(event) });
  } catch (err) {
    console.error('[PATCH /api/creators/events/:id]', err);
    const { status, body } = eventSaveError(err);
    return NextResponse.json(body, { status });
  }
}

/** DELETE — remove a draft, or mark a published event cancelled. */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const creatorId = await currentCreatorId();
  if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const event = await ownedEvent(creatorId, id);
  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

  const existingTicketOrders = await EventPurchase.exists({
    eventId: event._id,
    status: { $in: ['pending', 'confirmed', 'completed'] },
    paymentStatus: { $in: ['pending', 'paid'] },
  });
  if (existingTicketOrders) {
    return NextResponse.json(
      { error: 'This event has ticket orders and cannot be deleted. Hide the event instead to prevent new purchases.' },
      { status: 409 }
    );
  }

  event.deletedAt = new Date();
  event.status = 'cancelled';
  await event.save();
  return NextResponse.json({ success: true, deleted: true });
}
