import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    // Each error carries a `field` so the UI can show it under the right input.
    if (!email) {
      return NextResponse.json(
        { error: 'Please enter your email address.', field: 'email' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Please enter your password.', field: 'password' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { error: 'The email you entered is not registered, please check again.', field: 'email' },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          error: "This account doesn't have a password yet. Use Google sign-in or reset your password.",
          field: 'password',
        },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'The password you provided is incorrect. Please try again.', field: 'password' },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before signing in.', field: 'email' },
        { status: 403 }
      );
    }

    // Note: we do NOT block on isRegistrationComplete here.
    // A user with a verified account should always be able to log in,
    // regardless of whether they've finished onboarding.

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingStep: user.onboardingStep,
        isRegistrationComplete: user.isRegistrationComplete,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
