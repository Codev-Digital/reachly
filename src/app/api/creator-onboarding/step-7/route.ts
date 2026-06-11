import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import CreatorAvailability from '@/models/CreatorAvailability';
import CreatorPayment from '@/models/CreatorPayment';
import CreatorPricing from '@/models/CreatorPricing';

// GET — load all data for the review / go-live summary page
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [profile, sessionTypes, availability, payment, pricing] = await Promise.all([
      CreatorProfile.findOne({ userId: user._id }),
      SessionType.find({ userId: user._id }).sort({ order: 1 }),
      CreatorAvailability.findOne({ userId: user._id }),
      CreatorPayment.findOne({ userId: user._id }),
      CreatorPricing.findOne({ userId: user._id }),
    ]);

    // Compute completion checklist
    const checklist = {
      profile:      !!profile?.isProfileComplete,
      sessions:     sessionTypes.length > 0,
      pricing:      !!pricing?.isPricingComplete,
      availability: !!availability?.isAvailabilityComplete,
      payment:      !!payment?.isPaymentComplete,
    };
    const allComplete = Object.values(checklist).every(Boolean);

    return NextResponse.json({ profile, sessionTypes, availability, payment, pricing, checklist, allComplete });
  } catch (error: any) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PUT — activate (or save as draft) the creator profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { activate } = await req.json();

    // Verify all prior steps are done before activating
    if (activate) {
      const [profile, sessionTypes, availability, payment] = await Promise.all([
        CreatorProfile.findOne({ userId: user._id }),
        SessionType.countDocuments({ userId: user._id }),
        CreatorAvailability.findOne({ userId: user._id }),
        CreatorPayment.findOne({ userId: user._id }),
      ]);

      if (!profile?.isProfileComplete)       return NextResponse.json({ error: 'Complete your profile first (Step 2).' }, { status: 422 });
      if (!sessionTypes)                     return NextResponse.json({ error: 'Add at least one session type (Step 3).' }, { status: 422 });
      if (!availability?.isAvailabilityComplete) return NextResponse.json({ error: 'Set your availability (Step 5).' }, { status: 422 });
      if (!payment?.isPaymentComplete)       return NextResponse.json({ error: 'Add your payment details (Step 6).' }, { status: 422 });
    }

    user.onboardingStep = 7;
    await user.save();

    return NextResponse.json({ success: true, activated: !!activate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
