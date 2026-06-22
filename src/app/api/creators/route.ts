import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Only show approved creators on the public explore page
        const creators = await User.find({
          onboardingStep: { $gte: 6 },
          approvalStatus: 'approved'
        }).select('_id onboardingStep');
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
