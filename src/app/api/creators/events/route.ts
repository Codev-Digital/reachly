import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { currentCreatorId } from '@/lib/creatorAuth';
import { uploadToSupabase } from '@/lib/supabase';
import {
  bannerExtension,
  cleanEventPayload,
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
    publishedAt: event.publishedAt || null,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
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

/** GET — list this creator's events (newest first). */
export async function GET(req: NextRequest) {
  const creatorId = await currentCreatorId();
  if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const status = new URL(req.url).searchParams.get('status');
  const filter: Record<string, unknown> = { creatorId, deletedAt: null };
  if (status === 'draft' || status === 'published' || status === 'cancelled') {
    filter.status = status;
  }

  const events = await Event.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, events: events.map(serialize) });
}

/** POST — create a draft or published event. Accepts JSON or multipart (data + banner). */
export async function POST(req: NextRequest) {
  try {
    const creatorId = await currentCreatorId();
    if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    const existingUrl =
      typeof (payload as any)?.bannerUrl === 'string' ? String((payload as any).bannerUrl).trim() : '';
    const bannerCheck = validateBannerFile(banner, status === 'published' && !existingUrl);
    if ('error' in bannerCheck) {
      return NextResponse.json({ error: bannerCheck.error, field: 'banner' }, { status: 422 });
    }

    const cleaned = cleanEventPayload(payload, status, { hasBannerUpload: !!banner });
    if ('error' in cleaned) {
      return NextResponse.json({ error: cleaned.error, field: cleaned.field }, { status: 422 });
    }

    await connectDB();

    let bannerUrl = cleaned.value.bannerUrl;
    if (banner) {
      const buffer = Buffer.from(await banner.arrayBuffer());
      const ext = bannerExtension(banner.type);
      bannerUrl = await uploadToSupabase(
        buffer,
        banner.type,
        `events/${creatorId}/${Date.now()}-banner.${ext}`
      );
    }

    if (status === 'published' && !bannerUrl) {
      return NextResponse.json({ error: 'Banner image is required.', field: 'banner' }, { status: 422 });
    }

    const event = await Event.create({
      creatorId,
      ...cleaned.value,
      bannerUrl,
      publishedAt: status === 'published' ? new Date() : null,
    });

    // Auto-create a broadcast chat channel for this event
    try {
      await ensureEventBroadcastChannel(event);
    } catch (chatErr) {
      console.error('[POST /api/creators/events] broadcast channel:', chatErr);
    }

    return NextResponse.json({ success: true, event: serialize(event) }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/creators/events]', err);
    const { status, body } = eventSaveError(err);
    return NextResponse.json(body, { status });
  }
}
