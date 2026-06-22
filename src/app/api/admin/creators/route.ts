import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email.toLowerCase() !== 'abdullahgotaccess@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find all users who are creators (onboardingStep >= 6 or approvalStatus set)
    const creatorUsers = await User.find({
      $or: [
        { onboardingStep: { $gte: 6 } },
        { approvalStatus: { $in: ['pending', 'approved', 'rejected'] } }
      ]
    }).select('_id name email onboardingStep approvalStatus createdAt').lean();

    const userIds = creatorUsers.map(u => u._id);

    const [profiles, sessions] = await Promise.all([
      CreatorProfile.find({ userId: { $in: userIds } }).lean(),
      SessionType.find({ userId: { $in: userIds } }).lean(),
    ]);

    const creators = creatorUsers.map(user => {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString());
      const userSessions = sessions.filter(s => s.userId.toString() === user._id.toString());
      const minPrice = userSessions.length
        ? Math.min(...userSessions.map(s => s.price))
        : 0;

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        approvalStatus: user.approvalStatus || 'none',
        onboardingStep: user.onboardingStep,
        createdAt: user.createdAt,
        profile: profile ? {
          displayName: profile.displayName,
          username: profile.username,
          profilePhoto: profile.profilePhoto,
          niches: profile.niches,
          city: profile.city,
          country: profile.country,
          shortBio: profile.shortBio,
          isProfileComplete: profile.isProfileComplete,
        } : null,
        sessionCount: userSessions.length,
        startingPrice: minPrice,
      };
    });

    return NextResponse.json({ success: true, creators });
  } catch (error: any) {
    console.error('Admin creators fetch error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
