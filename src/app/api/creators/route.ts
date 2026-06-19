import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // 1. Fetch all users who have completed onboarding (assuming steps > 6 means live)
        // Actually the user schema says: "7 = Go Live" or similar. Let's just assume onboardingStep >= 6 or 7 means they completed it.
        // Let's filter by onboardingStep >= 6 for safety, or we could just get those who have CreatorProfile AND SessionType.

        // We can just fetch all CreatorProfiles that are marked as complete or users who meet the criteria.
        // Currently CreatorProfile has `isProfileComplete`. Let's just find profiles based on that or we can just fetch all for now and aggregate.

        const creators = await User.find({ onboardingStep: { $gte: 6 } }).select('_id onboardingStep');
        const creatorUserIds = creators.map((c) => c._id);

        if (!creatorUserIds.length) {
            return NextResponse.json({ creators: [] });
        }

        const [profiles, sessions] = await Promise.all([
            CreatorProfile.find({ userId: { $in: creatorUserIds } }),
            SessionType.find({ userId: { $in: creatorUserIds } }),
        ]);

        const formattedCreators = creators.map((user) => {
            const profile = profiles.find((p) => p.userId.toString() === user._id.toString());
            if (!profile) return null;

            const userSessions = sessions.filter((s) => s.userId.toString() === user._id.toString());
            const minPrice = userSessions.length
                ? Math.min(...userSessions.map((s) => s.price))
                : 0;

            return {
                id: user._id,
                username: profile.username,
                displayName: profile.displayName || 'Unknown Creator',
                shortBio: profile.shortBio,
                niches: profile.niches || [],
                profilePhoto: profile.profilePhoto || '/merium.png', // fallback
                startingPrice: minPrice,
                rating: 4.9, // placeholder for now since we don't have reviews implemented
            };
        }).filter(Boolean); // Remove nulls

        return NextResponse.json({ success: true, creators: formattedCreators });
    } catch (error: any) {
        console.error('Fetch creators error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch creators' },
            { status: 500 }
        );
    }
}
