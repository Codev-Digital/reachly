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

    const event = await Event.findById(id).lean();
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const [creatorProfile, creatorUser, purchases] = await Promise.all([
      CreatorProfile.findOne({ userId: (event as any).creatorId }).lean(),
      User.findById((event as any).creatorId).select('name email profilePhoto').lean(),
      EventPurchase.find({ eventId: (event as any)._id }).lean(),
    ]);

    const firstDate = (event.dates || [])[0];
    const creatorCity = (creatorProfile as any)?.city || '';
    const creatorCountry = (creatorProfile as any)?.country || '';
    const locationParts = [creatorCity, creatorCountry].filter(Boolean);
    const venue = locationParts.length > 0 
      ? `${locationParts.join(', ')}`
      : 'Nishat Hotel, Gulberg, Lahore';

    const totalTicketsSold = purchases.reduce((sum, p) => sum + (p.quantity || 1), 0);
    const totalRevenue = purchases.reduce((sum, p) => sum + ((p.tierPrice || 0) * (p.quantity || 1)), 0);

    return NextResponse.json({
      success: true,
      event: {
        id: String(event._id),
        title: event.title,
        description: event.description,
        bannerUrl: event.bannerUrl || '/assets/event-1.jpg',
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
          id: String((event as any).creatorId),
          displayName: (creatorProfile as any)?.displayName || (creatorUser as any)?.name || 'Creator',
          username: (creatorProfile as any)?.username || '',
          profilePhoto: (creatorProfile as any)?.profilePhoto || (creatorUser as any)?.profilePhoto || null,
          city: creatorCity,
          country: creatorCountry,
        },
        stats: {
          totalPurchases: purchases.length,
          totalTicketsSold,
          totalRevenue,
        },
        volunteers: (event as any).volunteers || [],
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/events/[id]]', error);
    return NextResponse.json({ error: 'Failed to load event details' }, { status: 500 });
  }
}
