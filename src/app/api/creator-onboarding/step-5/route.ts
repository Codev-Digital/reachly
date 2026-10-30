import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorAvailability from '@/models/CreatorAvailability';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select('_id').lean() as any;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const availability = await CreatorAvailability.findOne({ userId: user._id }).lean();
    return NextResponse.json({ availability });
  } catch (error: any) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { 
      schedule, 
      bufferMinutes, 
      timezone, 
      bookingWindowDays, 
      minNoticeHours, 
      blockedDates,
      duration,
      location,
      meetingLimits
    } = body;

    // Must have at least one enabled day
    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const hasEnabledDay = days.some(d => schedule?.[d]?.enabled);
    if (!hasEnabledDay) {
      return NextResponse.json(
        { error: 'Enable at least one day in your weekly schedule.' },
        { status: 422 }
      );
    }

    let availability = await CreatorAvailability.findOne({ userId: user._id });
    if (!availability) availability = new CreatorAvailability({ userId: user._id });

    if (schedule) availability.schedule = schedule;
    if (bufferMinutes !== undefined) availability.bufferMinutes = bufferMinutes;
    if (timezone) availability.timezone = timezone;
    if (bookingWindowDays !== undefined) availability.bookingWindowDays = bookingWindowDays;
    if (minNoticeHours !== undefined) availability.minNoticeHours = minNoticeHours;
    if (blockedDates) availability.blockedDates = blockedDates;
    if (duration !== undefined) {
      if (typeof duration === 'object' && duration !== null && typeof (duration as any).value === 'number') {
        availability.duration = {
          value: (duration as any).value,
          unit: (duration as any).unit === 'hr' ? 'hr' : 'min',
        };
      } else if (typeof duration === 'string' && duration !== '[object Object]') {
        const lower = duration.toLowerCase();
        if (lower.includes('hour') || lower.includes('hr')) {
          const match = lower.match(/\d+(\.\d+)?/);
          availability.duration = {
            value: match ? Math.max(1, Number(match[0])) : 1,
            unit: 'hr',
          };
        } else {
          const match = lower.match(/\d+/);
          availability.duration = {
            value: match ? Math.max(15, Number(match[0])) : 45,
            unit: 'min',
          };
        }
      } else if (typeof duration === 'number') {
        availability.duration = {
          value: duration,
          unit: 'min',
        };
      }
    }
    if (location !== undefined) {
      if (typeof location === 'string') {
        availability.location = {
          type: 'in-person',
          address: location
        };
      } else {
        availability.location = location;
      }
    }
    if (meetingLimits) availability.meetingLimits = meetingLimits;
    
    availability.isAvailabilityComplete = true;
    await availability.save();

    if (user.onboardingStep < 5) { user.onboardingStep = 5; await user.save(); }

    return NextResponse.json({ success: true, availability });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
