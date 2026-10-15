import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('_id onboardingStep approvalStatus hasSeenWelcome isRegistrationComplete')
      .lean() as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const creatorProfile = await CreatorProfile.findOne({ userId: user._id }).select('_id').lean();

    return NextResponse.json({
      onboardingStep: user.onboardingStep || 0,
      approvalStatus: user.approvalStatus || 'none',
      hasSeenWelcome: !!user.hasSeenWelcome,
      isRegistrationComplete: !!user.isRegistrationComplete,
      hasCreatorProfile: !!creatorProfile,
    });
  } catch (error) {
    console.error('Error fetching login redirect info:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
