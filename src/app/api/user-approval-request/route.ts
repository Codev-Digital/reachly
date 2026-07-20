import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UserApprovalRequest from '@/models/UserApprovalRequest';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const request = await UserApprovalRequest.findOne({ userId: user._id }).lean();
    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error('User approval request GET error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.approvalStatus === 'approved') {
      return NextResponse.json({ error: 'User is already approved' }, { status: 400 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const { phone, city, country, reason } = body;

    const request = await UserApprovalRequest.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: phone ? String(phone).trim() : undefined,
        city: city ? String(city).trim() : undefined,
        country: country ? String(country).trim() : undefined,
        reason: reason ? String(reason).trim() : '',
        status: 'pending',
        rejectionReason: undefined,
        reviewedAt: undefined,
        reviewedBy: undefined,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    user.approvalStatus = 'pending';
    await user.save();

    return NextResponse.json({ success: true, request });
  } catch (error: any) {
    console.error('User approval request POST error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
