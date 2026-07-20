import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UserApprovalRequest from '@/models/UserApprovalRequest';

function isAdmin(email?: string | null) {
  return !!email && ['abdullahgotaccess@gmail.com', 'admin@reachly.com'].includes(email.toLowerCase());
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const requests = await UserApprovalRequest.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Admin user requests GET error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { requestId, action, rejectionReason } = await req.json();
    if (!requestId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const request = await UserApprovalRequest.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const user = await User.findById(request.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.reviewedAt = new Date();
    request.reviewedBy = (session.user as any)?.id ? (session.user as any).id : undefined;
    request.rejectionReason = action === 'reject' ? String(rejectionReason || '').trim() : undefined;
    await request.save();

    user.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    await user.save();

    return NextResponse.json({ success: true, message: `User request ${action}d successfully` });
  } catch (error: any) {
    console.error('Admin user requests PUT error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
