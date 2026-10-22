import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import { sanitizeRichText } from '@/lib/sanitizeRichText';
import CreatorPayment from '@/models/CreatorPayment';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

// Helper to verify admin session
function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

// GET all creators, or a single creator with ?id=<userId>
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const id = new URL(req.url).searchParams.get('id');
    if (id && !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Fetch creator profiles, payments, and bookings (only this creator's when ?id= is given)
    const [profiles, payments, allBookings] = await Promise.all([
      CreatorProfile.find(id ? { userId: id } : {}).lean(),
      CreatorPayment.find(id ? { userId: id } : {}).lean(),
      Booking.find(id ? { creatorId: id } : {}).lean(),
    ]);

    const creatorUserIds = profiles.map((p: any) => p.userId.toString());

    // Fetch all users who are creators
    const creatorUsers = await User.find({ _id: { $in: creatorUserIds } }).sort({ createdAt: -1 }).lean();

    // Map database creator data to table shape
    const formattedCreators = creatorUsers.map((user: any) => {
      const profile = profiles.find((p: any) => p.userId.toString() === user._id.toString());
      const payment = payments.find((pay: any) => pay.userId.toString() === user._id.toString());
      
      const creatorBookings = allBookings.filter((b: any) => b.creatorId.toString() === user._id.toString());
      const completedSessions = creatorBookings.filter((b: any) => b.status === 'completed').length;
      
      const uniqueBookers = new Set<string>();
      creatorBookings.forEach((b: any) => {
        if (b.userId) uniqueBookers.add(b.userId.toString());
        if (b.guestDetails?.email) uniqueBookers.add(b.guestDetails.email);
      });
      const happyUsers = uniqueBookers.size;
      const totalCategories = profile?.niches?.length || 0;

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
      let status: 'Active' | 'Pending' | 'Inactive' | 'Suspended' | 'Rejected' | 'Deleted' = 'Inactive';
      if (user.approvalStatus === 'approved') status = 'Active';
      else if (user.approvalStatus === 'pending') status = 'Pending';
      else if (user.approvalStatus === 'rejected') status = 'Rejected';
      else if (user.approvalStatus === 'suspended') status = 'Suspended';
      else if (user.approvalStatus === 'deleted') status = 'Deleted';

      // Build contact details
      const contactInfo = [
        payment?.mobileNumber ? `+92 ${payment.mobileNumber.replace(/^(\+?92|0)/, '')}` : null,
        user.email?.toUpperCase()
      ].filter(Boolean).join('   |   ');

      return {
        id: `CRT-${user._id.toString().slice(-5).toUpperCase()}`,
        dbId: user._id.toString(),
        name: user.name || 'Creator',
        username: profile?.username ? `@${profile.username}` : `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
        email: user.email,
        joinedDate,
        time,
        deletedDate,
        deletedTime,
        status,
        avatar: profile?.profilePhoto || user.profilePhoto || '/avatar.png',
        coverPhoto: profile?.coverPhoto || '',
        city: profile?.city || '',
        country: profile?.country || '',
        languages: profile?.languages?.join(', ') || 'English',
        bio: profile?.shortBio || '',
        longBio: sanitizeRichText(profile?.longBio),
        niches: profile?.niches || [],
        bannerName: profile?.displayName || user.name || 'Creator Name',
        bannerNiche: profile?.niches?.[0] || 'Content Creator',
        bannerContact: contactInfo,
        sessionsCompleted: completedSessions,
        happyUsers: happyUsers,
        totalCategories: totalCategories
      };
    });

    if (id) {
      const creator = formattedCreators[0];
      if (!creator) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, creator });
    }

    return NextResponse.json({ success: true, creators: formattedCreators });
  } catch (error: any) {
    console.error('Admin creators GET error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PUT to approve, reject, or suspend a creator
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

    if (action === 'approve' && user.approvalStatus !== 'pending') {
      return NextResponse.json({ error: 'This creator has not submitted their application yet.' }, { status: 400 });
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

    return NextResponse.json({ success: true, message: `Creator status changed to ${action}d successfully` });
  } catch (error: any) {
    console.error('Admin creators PUT error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

// DELETE a creator
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

    // Soft delete: keep the data, block the account, hide the creator profile
    const user = await User.findByIdAndUpdate(userId, { approvalStatus: 'deleted', deletedAt: new Date() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await CreatorProfile.updateOne({ userId }, { isDeactivated: true });

    return NextResponse.json({ success: true, message: 'Creator deleted successfully' });
  } catch (error: any) {
    console.error('Admin creators DELETE error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
