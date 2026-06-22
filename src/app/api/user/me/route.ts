import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import CreatorProfile from "@/models/CreatorProfile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
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

    // Only mark hasSeenWelcome as true if user has onboardingStep > 0 OR a CreatorProfile
    // Also ensure approvalStatus is set for existing users
    let needsSave = false;
    if (user.onboardingStep > 0 && !user.hasSeenWelcome) {
      user.hasSeenWelcome = true;
      needsSave = true;
    }
    if (!user.approvalStatus) {
      user.approvalStatus = 'none';
      needsSave = true;
    }
    if (needsSave) {
      await user.save();
    }

    const creatorProfile = await CreatorProfile.findOne({
      userId: user._id,
    });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isRegistrationComplete: user.isRegistrationComplete,
        onboardingStep: user.onboardingStep,
        hasSeenWelcome: user.hasSeenWelcome,
        approvalStatus: user.approvalStatus,
      },
      creatorProfile: creatorProfile
        ? {
            id: creatorProfile._id.toString(),
            username: creatorProfile.username,
            displayName: creatorProfile.displayName,
            profilePhoto: creatorProfile.profilePhoto,
            isProfileComplete: creatorProfile.isProfileComplete,
          }
        : null,
    });
  } catch (error) {
    console.error('Error in /api/user/me:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
