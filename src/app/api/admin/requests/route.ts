import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';

// GET all pending creator requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email.toLowerCase() !== 'abdullahgotaccess@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find users who have approvalStatus = 'pending'
    const pendingUsers = await User.find({ approvalStatus: 'pending' }).lean();

    // Fetch their creator profiles to show details
    const userIds = pendingUsers.map(u => u._id);
    const profiles = await CreatorProfile.find({ userId: { $in: userIds } }).lean();

    // Combine them
    const requests = pendingUsers.map(user => {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString());
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        profile: profile || null,
      };
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST to approve or reject a request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email.toLowerCase() !== 'abdullahgotaccess@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { userId, action } = await req.json();

    if (!userId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    await user.save();

    return NextResponse.json({ success: true, message: `Creator ${action}d successfully` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
