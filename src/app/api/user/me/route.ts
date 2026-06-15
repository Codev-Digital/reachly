import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    let email: string | undefined;

    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      email = session.user.email;
    } else {
      const token = request.cookies.get('auth_token')?.value;
      const payload = token ? verifyToken(token) : null;
      email = payload?.email;
    }

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email }).select(
      '-password -otp -otpExpires -emailChangeOTP -emailChangeOTPExpires'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [creatorProfile, sessionTypes] = await Promise.all([
      CreatorProfile.findOne({ userId: user._id }),
      SessionType.find({ userId: user._id }).sort({ order: 1 }),
    ]);

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isRegistrationComplete: user.isRegistrationComplete,
      onboardingStep: user.onboardingStep,
      // CreatorProfile (step 2)
      displayName:       creatorProfile?.displayName,
      username:          creatorProfile?.username,
      shortBio:          creatorProfile?.shortBio,
      longBio:           creatorProfile?.longBio,
      city:              creatorProfile?.city,
      country:           creatorProfile?.country,
      languages:         creatorProfile?.languages,
      niches:            creatorProfile?.niches,
      profilePhoto:      creatorProfile?.profilePhoto,
      coverPhoto:        creatorProfile?.coverPhoto,
      socialLinks:       creatorProfile?.socialLinks,
      isProfileComplete: creatorProfile?.isProfileComplete,
      // SessionTypes (step 3)
      sessionTypes: sessionTypes.map(s => ({
        _id:         s._id,
        title:       s.title,
        description: s.description,
        duration:    s.duration,
        price:       s.price,
        features:    s.features,
        maxBookings: s.maxBookings,
        order:       s.order,
      })),
    });
  } catch (error: any) {
    console.error('GET /api/user/me error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
