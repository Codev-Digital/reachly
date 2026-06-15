import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { checkPasswordStrength } from '@/lib/utils';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password, confirmPassword } = await request.json();

    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const strengthCheck = checkPasswordStrength(password);
    if (strengthCheck.strength === 'weak') {
      return NextResponse.json(
        { error: strengthCheck.message, strength: strengthCheck.strength },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Please verify your email first' },
        { status: 400 }
      );
    }

    // Save password and mark registration complete in one save
    user.password = password;
    user.isRegistrationComplete = true;
    await user.save();

    // Create JWT token and set as HTTP-only cookie
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Password set successfully. Registration complete.',
      strength: strengthCheck.strength,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingStep: user.onboardingStep,
        isRegistrationComplete: user.isRegistrationComplete,
      },
    });

    // Set cookie with SameSite=Lax and HttpOnly for security
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Set password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
