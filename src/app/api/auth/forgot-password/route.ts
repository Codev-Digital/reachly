import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP, sendEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond with success to avoid leaking whether an email exists
    if (!user || !user.isRegistrationComplete) {
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
      'Reset your Reachly password',
      `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#C8A97E">Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>Your password reset code is:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#C8A97E;margin:20px 0">${otp}</div>
          <p style="color:#888">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `
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
