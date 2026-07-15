import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      onboardingStep: user.onboardingStep || 0,
      approvalStatus: user.approvalStatus || 'none',
      hasSeenWelcome: !!user.hasSeenWelcome,
      isRegistrationComplete: !!user.isRegistrationComplete,
    });
  } catch (error) {
    console.error('Error fetching login redirect info:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
