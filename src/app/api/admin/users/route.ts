import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import UserApprovalRequest from '@/models/UserApprovalRequest';
import mongoose from 'mongoose';

// Helper to verify admin session
function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

// GET all users (who are not creators), or a single user with ?id=<userId>
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const id = new URL(req.url).searchParams.get('id');

    // Fetch all creator profiles to identify creator IDs
    const profiles = await CreatorProfile.find({}).lean();
    const creatorUserIds = profiles.map((p: any) => p.userId.toString());

    // Single user (detail page)
    if (id) {
      if (!mongoose.isValidObjectId(id) || creatorUserIds.includes(id)) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const single = await User.findById(id).lean();
      if (!single) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const reqDoc = await UserApprovalRequest.findOne({ userId: single._id }).lean();
      return NextResponse.json({ success: true, user: formatUser(single, reqDoc) });
    }

    // Fetch all users who are NOT creators
    const normalUsers = await User.find({ _id: { $nin: creatorUserIds } }).sort({ createdAt: -1 }).lean();

    const requests = await UserApprovalRequest.find({ userId: { $in: normalUsers.map((u: any) => u._id) } }).lean();
    const reqByUser = new Map(requests.map((r: any) => [r.userId.toString(), r]));
    const formattedUsers = normalUsers.map((u: any) => formatUser(u, reqByUser.get(u._id.toString())));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error: any) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// Map database user data to table/detail shape
function formatUser(user: any, request?: any) {
  const d = new Date(user.createdAt);
  const joinedDate = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
    const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  let deletedDate = '';
  let deletedTime = '';
  if (user.deletedAt) {
    const dDel = new Date(user.deletedAt);
    deletedDate = dDel.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    deletedTime = dDel.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Map status
  // Only an admin-approved account is Active; not-yet-applied ('none') is Inactive
  // Only an admin-approved account is Active; not-yet-applied ('none') is Inactive
  let status: 'Active' | 'Pending' | 'Inactive' | 'Suspended' | 'Rejected' | 'Deleted' = 'Inactive';
  if (user.approvalStatus === 'approved') status = 'Active';
  else if (user.approvalStatus === 'pending') status = 'Pending';
  else if (user.approvalStatus === 'rejected') status = 'Rejected';
  else if (user.approvalStatus === 'suspended') status = 'Suspended';
  else if (user.approvalStatus === 'deleted') status = 'Deleted';

  return {
    id: `USR-${user._id.toString().slice(-5).toUpperCase()}`,
    dbId: user._id.toString(),
    name: user.name || 'User',
    username: `@${(user.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
    email: user.email,
    joinedDate,
    time,
    status,
    avatar: user.profilePhoto || '/avatar.png',
    city: request?.city || '',
    country: request?.country || '',
    phone: request?.phone || '',
    languages: 'English',
    bio: request?.reason || ''
  };
}

// POST/PUT to approve, reject, or suspend a user
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { userId, action } = await req.json();

    if (!userId || !['approve', 'reject', 'suspend', 'activate', 'restore'].includes(action)) {
      return NextResponse.json({ error: 'Invalid data parameters' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'approve') {
      user.approvalStatus = 'approved';
    } else if (action === 'reject') {
      user.approvalStatus = 'rejected';
    } else if (action === 'suspend') {
      user.approvalStatus = 'suspended';
    } else if (action === 'activate') {
      user.approvalStatus = 'approved';
    }

    await user.save();

    // Keep the approval request in sync so /admin/user-requests matches
    if (action === 'approve' || action === 'reject') {
      await UserApprovalRequest.updateOne(
        { userId: user._id },
        { status: action === 'approve' ? 'approved' : 'rejected', reviewedAt: new Date() },
      );
    }

    return NextResponse.json({ success: true, message: `User status changed to ${action}d successfully` });
  } catch (error: any) {
    console.error('Admin users PUT error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

// DELETE a user
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Soft delete: keep the data, block the account, hide any creator profile
    const user = await User.findByIdAndUpdate(userId, { approvalStatus: 'deleted', deletedAt: new Date() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await CreatorProfile.updateOne({ userId }, { isDeactivated: true });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Admin users DELETE error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
