import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Event from '@/models/Event';
import EventPurchase from '@/models/EventPurchase';
import { isValidObjectId, isValidISODate } from '@/lib/eventValidation';
import { verifyToken } from '@/lib/jwt';

type RouteContext = { params: Promise<{ id: string }> };

async function currentUser(req: NextRequest): Promise<{ id: string; email: string } | null> {
  const session = await getServerSession(authOptions);
  let email = session?.user?.email as string | undefined;
  if (!email) {
    const token = req.cookies.get('auth_token')?.value;
    const payload = token ? verifyToken(token) : null;
    email = payload?.email;
  }
  if (!email) return null;
  await connectDB();
  const user = (await User.findOne({ email: email.toLowerCase() }).select('_id email').lean()) as {
    _id: { toString(): string };
    email?: string;
  } | null;
  if (!user) return null;
  return { id: String(user._id), email: (user.email || email).toLowerCase() };
}

function ticketRef() {
  return `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/** POST — buy a ticket for a published event (logged-in user). */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await currentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized. Please sign in again.' }, { status: 401 });

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const eventDate = typeof body?.eventDate === 'string' ? body.eventDate.trim() : '';
    const tierTitle = typeof body?.tierTitle === 'string' ? body.tierTitle.trim() : '';
    const qty = Math.max(1, Math.min(10, Number(body?.quantity) || 1));

    if (!isValidISODate(eventDate)) {
      return NextResponse.json({ error: 'Invalid event date.' }, { status: 422 });
    }
    if (!tierTitle) {
      return NextResponse.json({ error: 'Select a ticket tier.' }, { status: 422 });
    }

    await connectDB();

    const event = await Event.findOne({
      _id: new mongoose.Types.ObjectId(id),
      status: 'published',
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const dayIndex = (event.dates || []).findIndex((d: any) => d.date === eventDate);
    if (dayIndex < 0) {
      return NextResponse.json({ error: 'That date is not available for this event.' }, { status: 422 });
    }

    const day = event.dates[dayIndex] as any;
    const tierIndex = (day.tiers || []).findIndex(
      (t: any) => String(t.title).trim().toLowerCase() === tierTitle.toLowerCase()
    );
    if (tierIndex < 0) {
      return NextResponse.json({ error: 'Ticket tier not found.' }, { status: 422 });
    }

    const tier = day.tiers[tierIndex];
    const available = Number(tier.quantity);
    if (!Number.isFinite(available) || available < qty) {
      return NextResponse.json({ error: 'Not enough tickets left for this tier.' }, { status: 422 });
    }

    tier.quantity = available - qty;
    event.markModified('dates');
    await event.save();

    const startLabel = day.startHour
      ? `${String(day.startHour).padStart(2, '0')}:${String(day.startMinute || '00').padStart(2, '0')} ${day.startPeriod || 'AM'}`
      : '12:00 AM';
    const endLabel = day.endHour
      ? `${String(day.endHour).padStart(2, '0')}:${String(day.endMinute || '00').padStart(2, '0')} ${day.endPeriod || 'PM'}`
      : '';

    const purchase = await EventPurchase.create({
      ticketRef: ticketRef(),
      eventId: event._id,
      creatorId: event.creatorId,
      userId: new mongoose.Types.ObjectId(user.id),
      buyerEmail: user.email,
      eventTitle: event.title,
      eventBannerUrl: event.bannerUrl || '',
      category: event.category || '',
      eventDate,
      eventStartTime: startLabel,
      eventEndTime: endLabel,
      tierTitle: tier.title,
      tierPrice: Number(tier.price) || 0,
      tierPersons: Math.max(1, Number(tier.persons) || 1),
      quantity: qty,
      status: 'confirmed',
      paymentStatus: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        purchase: {
          id: String(purchase._id),
          ticketRef: purchase.ticketRef,
          eventTitle: purchase.eventTitle,
          tierTitle: purchase.tierTitle,
          tierPrice: purchase.tierPrice,
          eventDate: purchase.eventDate,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/events/:id/purchase]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to buy ticket' },
      { status: 500 }
    );
  }
}
