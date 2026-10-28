import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import CreatorProfile from '@/models/CreatorProfile';
import User from '@/models/User';
import { isValidObjectId } from '@/lib/eventValidation';
import { formatEventCardDate, formatEventCardTime } from '@/lib/eventDisplay';
import { generateVolunteerAssignmentEmail } from '@/lib/utils';
import { queueEmail } from '@/lib/emailQueue';

function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET — Get all volunteers assigned to this event
 */
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
    const event = await Event.findById(id).select('volunteers title').lean();
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      volunteers: (event as any).volunteers || [],
    });
  } catch (error) {
    console.error('[GET /api/admin/events/[id]/volunteers]', error);
    return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
  }
}

/**
 * POST — Assign a new volunteer and dispatch an invitation email
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, role } = body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Volunteer name is required' }, { status: 400 });
    }

    const emailTrimmed = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    const roleTrimmed = typeof role === 'string' && role.trim() ? role.trim() : 'Registration Desk';

    await connectDB();
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if volunteer is already assigned by email
    const existingIndex = (event.volunteers || []).findIndex(
      (v: any) => v.email?.toLowerCase() === emailTrimmed
    );
    if (existingIndex !== -1) {
      return NextResponse.json(
        { error: 'A volunteer with this email is already assigned to this event' },
        { status: 409 }
      );
    }

    const newVolunteer = {
      name: name.trim(),
      email: emailTrimmed,
      role: roleTrimmed,
      addedAt: new Date(),
    };

    if (!event.volunteers) {
      event.volunteers = [];
    }
    event.volunteers.push(newVolunteer as any);
    await event.save();

    // Dispatch assignment email asynchronously via background queue
    void (async () => {
      try {
        const [creatorProfile, creatorUser] = await Promise.all([
          CreatorProfile.findOne({ userId: (event as any).creatorId }).lean(),
          User.findById((event as any).creatorId).select('name').lean(),
        ]);

        const creatorName =
          (creatorProfile as any)?.displayName ||
          (creatorUser as any)?.name ||
          'The Event Organizer';

        const firstDate = (event.dates || [])[0];
        const formattedDate = formatEventCardDate(firstDate?.date) || 'To be announced';
        const formattedTime = formatEventCardTime(firstDate) || 'To be announced';

        const creatorCity = (creatorProfile as any)?.city || '';
        const creatorCountry = (creatorProfile as any)?.country || '';
        const locationParts = [creatorCity, creatorCountry].filter(Boolean);
        const venue = locationParts.length > 0 ? locationParts.join(', ') : 'Venue to be confirmed';

        const emailHtml = generateVolunteerAssignmentEmail({
          volunteerName: newVolunteer.name,
          eventTitle: event.title,
          role: newVolunteer.role,
          date: formattedDate,
          time: formattedTime,
          venue,
          creatorName,
        });

        queueEmail({
          to: newVolunteer.email,
          subject: `You've been assigned as a Volunteer for "${event.title}" - Reachly`,
          html: emailHtml,
          description: `Volunteer assignment for ${event.title}`,
        });
      } catch (emailErr) {
        console.error('[Volunteer Assignment Email Background Error]', emailErr);
      }
    })();

    return NextResponse.json({
      success: true,
      message: 'Volunteer added and invitation email queued successfully',
      volunteer: newVolunteer,
      volunteers: event.volunteers,
    });
  } catch (error) {
    console.error('[POST /api/admin/events/[id]/volunteers]', error);
    return NextResponse.json({ error: 'Failed to assign volunteer' }, { status: 500 });
  }
}

/**
 * DELETE — Remove a volunteer from the event
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const url = new URL(req.url);
    const volunteerId = url.searchParams.get('volunteerId');
    const email = url.searchParams.get('email')?.toLowerCase();

    if (!volunteerId && !email) {
      return NextResponse.json({ error: 'volunteerId or email is required' }, { status: 400 });
    }

    await connectDB();
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.volunteers && event.volunteers.length > 0) {
      event.volunteers = (event.volunteers as any[]).filter((v: any) => {
        if (volunteerId && String(v._id) === volunteerId) return false;
        if (email && v.email?.toLowerCase() === email) return false;
        return true;
      });
      await event.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Volunteer removed successfully',
      volunteers: event.volunteers || [],
    });
  } catch (error) {
    console.error('[DELETE /api/admin/events/[id]/volunteers]', error);
    return NextResponse.json({ error: 'Failed to remove volunteer' }, { status: 500 });
  }
}
