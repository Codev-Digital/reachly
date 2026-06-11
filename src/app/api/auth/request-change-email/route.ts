import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP, sendEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { currentEmail, newEmail } = body;

    if (!currentEmail || !newEmail) {
      return NextResponse.json(
        { error: 'Current email and new email are required' },
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

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already in use' },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    user.emailChangeOTP = otp;
    user.emailChangeOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.newEmail = newEmail;
    await user.save();

    await sendEmail(
      newEmail,
      'Confirm email change',
      `<p>Your OTP for email change is: <strong>${otp}</strong></p>`
    );

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your new email'
    });

  } catch (error: any) {
    console.error('Request change email error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
