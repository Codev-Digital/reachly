import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { currentEmail, otp } = body;

    if (!currentEmail || !otp) {
      return NextResponse.json(
        { error: 'Current email and OTP are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: currentEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailChangeOTP !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    if (!user.emailChangeOTPExpires || new Date() > user.emailChangeOTPExpires) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (user.newEmail) {
      user.email = user.newEmail;
    }
    user.newEmail = undefined;
    user.emailChangeOTP = undefined;
    user.emailChangeOTPExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Email changed successfully'
    });

  } catch (error: any) {
    console.error('Verify change email error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
