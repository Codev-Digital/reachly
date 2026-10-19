import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { checkPasswordStrength } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, otp, password, confirmPassword } = await request.json();

    if (!email || !otp || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.', field: 'confirmPassword' },
        { status: 400 }
      );
    }

    const strengthCheck = checkPasswordStrength(password);
    if (strengthCheck.strength === 'weak') {
      return NextResponse.json(
        { error: strengthCheck.message, field: 'password' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    if (!user.otpExpires || new Date() > user.otpExpires) {
      return NextResponse.json(
        { error: 'Code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
