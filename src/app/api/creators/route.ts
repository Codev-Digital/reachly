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
          approvalStatus: 'approved'
        }).select('_id onboardingStep isVerified').lean() as any[];
        const creatorUserIds = creators.map((c) => c._id);

        if (!creatorUserIds.length) {
            return NextResponse.json({ creators: [] });
        }

        const [profiles, sessions] = await Promise.all([
            CreatorProfile.find({
                userId: { $in: creatorUserIds },
                isDeactivated: { $ne: true },
            })
                .select('userId username displayName shortBio niches profilePhoto isDeactivated')
                .lean(),
            SessionType.find({
                userId: { $in: creatorUserIds },
                isActive: { $ne: false },
            })
                .select('userId price')
                .lean(),
        ]);

        const profileMap = new Map((profiles as any[]).map(p => [p.userId.toString(), p]));
        const minPriceMap = new Map<string, number>();
        for (const s of (sessions as any[])) {
            const uid = s.userId.toString();
            const cur = minPriceMap.get(uid);
            if (cur === undefined || s.price < cur) {
                minPriceMap.set(uid, s.price);
            }
        }

        const formattedCreators = creators.map((user) => {
            const uIdStr = user._id.toString();
            const profile = profileMap.get(uIdStr);
            if (!profile || profile.isDeactivated) return null;
            if (!minPriceMap.has(uIdStr)) return null; // creator has no active sessions

            return {
                id: uIdStr,
                username: profile.username,
                displayName: profile.displayName || 'Unknown Creator',
                shortBio: profile.shortBio,
                niches: profile.niches || [],
                profilePhoto: profile.profilePhoto || '/merium.png', // fallback
                startingPrice: minPriceMap.get(uIdStr) || 0,
                rating: 4.9, // placeholder for now since we don't have reviews implemented
                isVerified: user.isVerified || false,
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
