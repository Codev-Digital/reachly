import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP, sendEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      // If registration is fully complete, reject
      if (existingUser.isRegistrationComplete) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in instead.' },
          { status: 400 }
        );
      }
      // If the user started but never finished, resend OTP so they can continue
      const otp = generateOTP();
      existingUser.otp = otp;
      existingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await existingUser.save();

      await sendEmail(
        normalizedEmail,
        'Verify your Reachly account',
        `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2 style="color:#C8A97E">Verify your email</h2>
            <p>Hi ${existingUser.name},</p>
            <p>Your verification code is:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#C8A97E;margin:20px 0">${otp}</div>
            <p style="color:#888">This code expires in 10 minutes.</p>
          </div>
        `
      );

      return NextResponse.json({
        success: true,
        message: 'OTP resent to your email',
        userId: existingUser._id,
      });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email: normalizedEmail,
      otp,
      otpExpires,
      isVerified: false,
      isRegistrationComplete: false,
      onboardingStep: 0,
    });

    await sendEmail(
      normalizedEmail,
      'Verify your Reachly account',
      `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#C8A97E">Welcome to Reachly!</h2>
          <p>Hi ${name},</p>
          <p>Your verification code is:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#C8A97E;margin:20px 0">${otp}</div>
          <p style="color:#888">This code expires in 10 minutes.</p>
        </div>
      `
    );

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      userId: user._id,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
