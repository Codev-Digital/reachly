import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP, sendEmail, generateOTPEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond with success to avoid leaking whether an email exists
    if (!user || !user.isRegistrationComplete || user.approvalStatus === 'deleted') {
      return NextResponse.json({
        success: true,
        message: 'If that email is registered, you will receive a reset code.',
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      email,
      'Your Reachly verification code',
      generateOTPEmail(user.name || 'User', otp, 'Your verification code')
    );

    return NextResponse.json({
      success: true,
      message: 'If that email is registered, you will receive a reset code.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
