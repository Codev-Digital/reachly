import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
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

function serialize(event: any) {
  return {
    id: String(event._id),
    status: event.status,
    title: event.title,
    description: event.description,
    bannerUrl: event.bannerUrl || '',
    category: event.category || '',
    dates: event.dates || [],
    refundPolicy: event.refundPolicy || '',
    termsAndConditions: event.termsAndConditions || '',
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

  return NextResponse.json({ success: true, event: serialize(event) });
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
    event.dates = cleaned.value.dates;
    event.refundPolicy = cleaned.value.refundPolicy;
    event.termsAndConditions = cleaned.value.termsAndConditions;
    event.status = status;
    if (status === 'published' && !event.publishedAt) {
      event.publishedAt = new Date();
    }

    await event.save();
    return NextResponse.json({ success: true, event: serialize(event) });
  } catch (err) {
    console.error('[PUT /api/creators/events/:id]', err);
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

  if (event.status === 'draft') {
    await event.deleteOne();
    return NextResponse.json({ success: true, deleted: true });
  }

  event.status = 'cancelled';
  await event.save();
  return NextResponse.json({ success: true, cancelled: true });
}
