import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import CreatorProfile from '@/models/CreatorProfile';
import User from '@/models/User';
import EventPurchase from '@/models/EventPurchase';
import { isValidObjectId } from '@/lib/eventValidation';
import { formatEventCardDate, formatEventCardTime } from '@/lib/eventDisplay';
import { sendEmail, generateEventModerationEmail } from '@/lib/utils';

function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await connectDB();

    const event = await Event.findOne({ _id: id, deletedAt: null }).lean();
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const [creatorProfile, creatorUser, purchases] = await Promise.all([
      CreatorProfile.findOne({ userId: event.creatorId }).lean(),
      User.findById(event.creatorId).select('name email profilePhoto').lean(),
      EventPurchase.find({
        eventId: event._id,
        status: { $in: ['confirmed', 'completed'] },
        paymentStatus: 'paid',
      }).sort({ createdAt: -1 }).lean(),
    ]);

    const firstDate = (event.dates || [])[0];
    const creatorCity = creatorProfile?.city || '';
    const creatorCountry = creatorProfile?.country || '';
    const locationParts = [creatorCity, creatorCountry].filter(Boolean);
    const venue = locationParts.length > 0 
      ? `${locationParts.join(', ')}`
      : 'Nishat Hotel, Gulberg, Lahore';

    const buyerIds = [...new Set(purchases.map((purchase) => String(purchase.userId)))];
    const buyers = buyerIds.length
      ? await User.find({ _id: { $in: buyerIds } }).select('name email profilePhoto').lean()
      : [];
    const buyerMap = new Map(buyers.map((buyer) => [String(buyer._id), buyer]));
    const buyerPurchases = purchases.map((purchase) => {
      const buyer = buyerMap.get(String(purchase.userId));
      const quantity = Number(purchase.quantity) || 1;
      const persons = Number(purchase.tierPersons) || 1;
      return {
        id: String(purchase._id),
        name: buyer?.name || 'Ticket holder',
        email: buyer?.email || purchase.buyerEmail,
        date: purchase.eventDate,
        tier: purchase.tierTitle,
        quantity,
        seats: quantity * persons,
        amount: (Number(purchase.tierPrice) || 0) * quantity,
        purchasedAt: purchase.createdAt,
        ticketRef: purchase.ticketRef,
      };
    });
    const totalTicketsSold = purchases.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
    const totalRevenue = purchases.reduce((sum, p) => sum + ((p.tierPrice || 0) * (p.quantity || 1)), 0);

    return NextResponse.json({
      success: true,
      event: {
        id: String(event._id),
        title: event.title,
        description: event.description,
        bannerUrl: event.bannerUrl || '',
        category: event.category || 'Workshops',
        status: event.status,
        dates: event.dates || [],
        formattedDate: formatEventCardDate(firstDate?.date) || '5 July 2026',
        formattedTime: formatEventCardTime(firstDate) || '2PM - 6PM',
        venue,
        refundPolicy: event.refundPolicy || '',
        termsAndConditions: event.termsAndConditions || '',
        createdAt: event.createdAt,
        creator: {
          id: String(event.creatorId),
          displayName: creatorProfile?.displayName || creatorUser?.name || 'Creator',
          username: creatorProfile?.username || '',
          profilePhoto: creatorProfile?.profilePhoto || creatorUser?.profilePhoto || null,
          shortBio: creatorProfile?.shortBio || '',
          city: creatorCity,
          country: creatorCountry,
        },
        stats: {
          totalBuyers: buyerIds.length,
          totalPurchases: purchases.length,
          totalTicketsSold,
          totalSeats: purchases.reduce((sum, purchase) =>
            sum + (Number(purchase.quantity) || 1) * (Number(purchase.tierPersons) || 1), 0),
          totalRevenue,
          buyers: buyerPurchases,
        },
        volunteers: (event as any).volunteers || [],
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/events/[id]]', error);
    return NextResponse.json({ error: 'Failed to load event details' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    const body = await req.json().catch(() => ({}));
    if (body?.action !== 'hide' && body?.action !== 'show') {
      return NextResponse.json({ error: 'Choose hide or show for this event.' }, { status: 422 });
    }

    await connectDB();
    const event = await Event.findOne({ _id: id, deletedAt: null });
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    const nextStatus = body.action === 'hide' ? 'draft' : 'published';
    const wasVisible = event.status === 'published';
    if (event.status === 'cancelled') {
      return NextResponse.json({ error: 'Deleted events cannot be shown or hidden.' }, { status: 409 });
    }
    event.status = nextStatus;
    await event.save();

    if (body.action === 'hide' && wasVisible) {
      const [creator, profile] = await Promise.all([
        User.findById(event.creatorId).select('name email').lean(),
        CreatorProfile.findOne({ userId: event.creatorId }).select('displayName').lean(),
      ]);
      if (creator?.email) {
        await sendEmail(
          creator.email,
          `Your event "${event.title}" has been hidden`,
          generateEventModerationEmail(
            profile?.displayName || creator.name || 'Creator',
            'hidden',
            event.title,
            event.bannerUrl || ''
          )
        );
      }
    }

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (error) {
    console.error('[PATCH /api/admin/events/:id]', error);
    return NextResponse.json({ error: 'Unable to update event visibility.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    await connectDB();
    const event = await Event.findOne({ _id: id, deletedAt: null });
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    const hasTicketOrders = await EventPurchase.exists({
      eventId: event._id,
      status: { $in: ['pending', 'confirmed', 'completed'] },
      paymentStatus: { $in: ['pending', 'paid'] },
    });
    if (hasTicketOrders) {
      return NextResponse.json(
        { error: 'This event has ticket orders and cannot be deleted. Hide it instead to stop new purchases.' },
        { status: 409 }
      );
    }

    const [creator, profile] = await Promise.all([
      User.findById(event.creatorId).select('name email').lean(),
      CreatorProfile.findOne({ userId: event.creatorId }).select('displayName').lean(),
    ]);

    event.deletedAt = new Date();
    event.status = 'cancelled';
    await event.save();

    if (creator?.email) {
      await sendEmail(
        creator.email,
        `Your event "${event.title}" has been deleted`,
        generateEventModerationEmail(
          profile?.displayName || creator.name || 'Creator',
          'deleted',
          event.title,
          event.bannerUrl || ''
        )
      );
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('[DELETE /api/admin/events/:id]', error);
    return NextResponse.json({ error: 'Unable to delete event.' }, { status: 500 });
  }
}
