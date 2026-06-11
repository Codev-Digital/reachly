import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import SessionType from '@/models/SessionType';
import CreatorPricing from '@/models/CreatorPricing';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [sessionTypes, pricing] = await Promise.all([
      SessionType.find({ userId: user._id }).sort({ order: 1 }),
      CreatorPricing.findOne({ userId: user._id }),
    ]);

    return NextResponse.json({ sessionTypes, pricing });
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

    const { offerFirstSessionDiscount, payoutFrequency } = await req.json();

    let pricing = await CreatorPricing.findOne({ userId: user._id });
    if (!pricing) pricing = new CreatorPricing({ userId: user._id });

    pricing.offerFirstSessionDiscount = !!offerFirstSessionDiscount;
    pricing.payoutFrequency = payoutFrequency || 'weekly';
    pricing.isPricingComplete = true; // step 4 has no required fields beyond viewing
    await pricing.save();

    if (user.onboardingStep < 4) { user.onboardingStep = 4; await user.save(); }

    return NextResponse.json({ success: true, pricing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
