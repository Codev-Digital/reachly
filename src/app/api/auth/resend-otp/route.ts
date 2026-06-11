import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP, sendEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      email,
      'Verify your email',
      `<p>Your new OTP for email verification is: <strong>${otp}</strong></p>`
    );

    return NextResponse.json({
      success: true,
      message: 'OTP resent successfully'
    });

  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
