import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import Review from '@/models/Review';
import { summarizeCreatorRating } from '@/lib/creatorRating';
import {
    getCreatorsListCache,
    setCreatorsListCache,
} from '@/lib/creatorsListCache';

// Public listing data: cache briefly so repeat visits don't pay for 3 DB round-trips each time.
const CACHE_TTL_MS = 60 * 1000;
const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
};

export async function GET(request: NextRequest) {
    try {
        const cachedResponse = getCreatorsListCache();
        if (cachedResponse && Date.now() - cachedResponse.at < CACHE_TTL_MS) {
            return NextResponse.json(cachedResponse.body, { headers: CACHE_HEADERS });
        }

        await connectDB();

        // Only show approved creators on the public explore page
        const creators = await User.find({
          approvalStatus: 'approved'
        }).select('_id onboardingStep isVerified').lean() as any[];
        const creatorUserIds = creators.map((c) => c._id);

        if (!creatorUserIds.length) {
            return NextResponse.json({ creators: [] });
        }

        const [profiles, sessions, ratingAgg] = await Promise.all([
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
            Review.aggregate([
                {
                    $match: {
                        revieweeId: { $in: creatorUserIds },
                        reviewerRole: 'user',
                        isHidden: { $ne: true },
                        rating: { $gte: 1 },
                    },
                },
                {
                    $group: {
                        _id: '$revieweeId',
                        avgRating: { $avg: '$rating' },
                        reviewCount: { $sum: 1 },
                    },
                },
            ]),
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

        const ratingMap = new Map<string, { avgRating: number; reviewCount: number }>();
        for (const row of ratingAgg as any[]) {
            ratingMap.set(String(row._id), {
                avgRating: row.avgRating,
                reviewCount: row.reviewCount,
            });
        }

        const formattedCreators = creators.map((user) => {
            const uIdStr = user._id.toString();
            const profile = profileMap.get(uIdStr);
            if (!profile || profile.isDeactivated) return null;
            if (!minPriceMap.has(uIdStr)) return null; // creator has no active sessions

            const ratingRow = ratingMap.get(uIdStr);
            const summary = summarizeCreatorRating(
                ratingRow?.avgRating,
                ratingRow?.reviewCount ?? 0
            );

            return {
                id: uIdStr,
                username: profile.username,
                displayName: profile.displayName || 'Unknown Creator',
                shortBio: profile.shortBio,
                niches: profile.niches || [],
                profilePhoto: profile.profilePhoto || '/merium.png', // fallback
                startingPrice: minPriceMap.get(uIdStr) || 0,
                rating: summary.rating,
                ratingLabel: summary.ratingLabel,
                reviewCount: summary.reviewCount,
                ratingDisplay: summary.display,
                isVerified: user.isVerified || false,
            };
        }).filter(Boolean); // Remove nulls

        const body = { success: true, creators: formattedCreators };
        setCreatorsListCache(body);
        return NextResponse.json(body, { headers: CACHE_HEADERS });
    } catch (error: any) {
        console.error('Fetch creators error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch creators' },
            { status: 500 }
        );
    }
}
