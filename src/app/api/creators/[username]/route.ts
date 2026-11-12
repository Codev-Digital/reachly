import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import Booking from '@/models/Booking';
import Review from '@/models/Review';
import Event from '@/models/Event';
import { sanitizeRichText } from '@/lib/sanitizeRichText';
import { summarizeCreatorRating } from '@/lib/creatorRating';
import { verifyToken } from '@/lib/jwt';

/** Today as YYYY-MM-DD in local time (matches event date storage). */
function todayISODate() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function eventHasFutureOrTodayDate(event: any, today: string) {
    const dates = Array.isArray(event?.dates) ? event.dates : [];
    return dates.some((d: any) => typeof d?.date === 'string' && d.date >= today);
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        await connectDB();

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const lowerUsername = username.toLowerCase();
        const cleanUsername = lowerUsername.replace(/-/g, '');
        const profile = await CreatorProfile.findOne({
            $or: [
                { username: lowerUsername },
                { username: cleanUsername }
            ]
        }).lean() as any;

        if (!profile) {
            return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        // Increment views in background without blocking the read response
        CreatorProfile.updateOne({ _id: profile._id }, { $inc: { views: 1 } }).exec().catch(() => {});

        // Fetch User, Sessions, Bookings, reviews, and published events concurrently
        const [user, sessions, allBookings, clientReviews, publishedEvents] = (await Promise.all([
            User.findById(profile.userId).select('name isVerified email approvalStatus').lean(),
            SessionType.find({ userId: profile.userId, isActive: { $ne: false } }).sort({ order: 1 }).lean(),
            Booking.find({ creatorId: profile.userId, status: { $ne: 'cancelled' } })
                .select('scheduledDate scheduledTime guestDetails.email')
                .lean(),
            Review.find({
                revieweeId: profile.userId,
                reviewerRole: 'user',
                isHidden: { $ne: true },
                rating: { $gte: 1 },
            })
                .sort({ createdAt: -1 })
                .lean(),
            Event.find({
                creatorId: profile.userId,
                status: 'published',
            })
                .sort({ publishedAt: -1, createdAt: -1 })
                .lean(),
        ])) as [any, any[], any[], any[], any[]];

        if (!user) {
            return NextResponse.json({ error: 'User data not found' }, { status: 404 });
        }

        // Only completed, approved, and active creators are publicly bookable
        if (
            user.approvalStatus !== 'approved' ||
            !profile.isProfileComplete ||
            profile.isDeactivated
        ) {
            return NextResponse.json({ error: 'Creator profile is not complete or available for booking' }, { status: 404 });
        }

        // Total session types this creator offers
        const totalCategories = sessions.length;

        // Sessions completed = bookings with this creator where scheduled date+time has passed
        const now = new Date();
        const uniqueEmails = new Set<string>();
        let sessionsCompleted = 0;

        allBookings.forEach((b: any) => {
            if (b.guestDetails?.email) {
                uniqueEmails.add(b.guestDetails.email.toLowerCase());
            }
            if (b.scheduledDate) {
                try {
                    const baseDate = new Date(b.scheduledDate);
                    const timeStr = (b.scheduledTime || '').split(' to ')[0].trim();
                    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (match) {
                        let hours = parseInt(match[1]);
                        const minutes = parseInt(match[2]);
                        const ampm = match[3].toUpperCase();
                        if (ampm === 'PM' && hours < 12) hours += 12;
                        if (ampm === 'AM' && hours === 12) hours = 0;
                        baseDate.setHours(hours, minutes, 0, 0);
                    } else {
                        baseDate.setHours(23, 59, 59, 999);
                    }
                    if (now > baseDate) sessionsCompleted++;
                } catch {}
            }
        });

        const happyCustomers = uniqueEmails.size;

        const reviewCount = clientReviews.length;
        const avgRating =
            reviewCount > 0
                ? clientReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount
                : null;
        const ratingSummary = summarizeCreatorRating(avgRating, reviewCount);

        const reviewerIds = [
            ...new Set(clientReviews.map((r) => String(r.reviewerId)).filter(Boolean)),
        ];
        const [reviewerUsers, reviewerProfiles] = await Promise.all([
            reviewerIds.length
                ? User.find({ _id: { $in: reviewerIds } }).select('name profilePhoto').lean()
                : Promise.resolve([]),
            reviewerIds.length
                ? CreatorProfile.find({ userId: { $in: reviewerIds } })
                    .select('userId displayName profilePhoto')
                    .lean()
                : Promise.resolve([]),
        ]);
        const reviewerUserMap = new Map((reviewerUsers as any[]).map((u) => [String(u._id), u]));
        const reviewerProfileMap = new Map(
            (reviewerProfiles as any[]).map((p) => [String(p.userId), p])
        );

        let alreadyBookedFreeConsultation = false;
        const freeSessionIds = sessions
            .filter((s: any) => s.isFreeConsultation)
            .map((s: any) => s._id);
        if (freeSessionIds.length > 0) {
            let callerEmail: string | undefined;
            const authSession = await getServerSession(authOptions);
            if (authSession?.user?.email) {
                callerEmail = authSession.user.email;
            } else {
                const token = request.cookies.get('auth_token')?.value;
                const payload = token ? verifyToken(token) : null;
                callerEmail = payload?.email;
            }
            if (callerEmail) {
                const normalizedCallerEmail = callerEmail.toLowerCase().trim();
                const escapedCaller = normalizedCallerEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const callerUser = await User.findOne({ email: normalizedCallerEmail })
                    .select('_id')
                    .lean() as any;
                const callerOr: any[] = [
                    { 'guestDetails.email': { $regex: new RegExp(`^${escapedCaller}$`, 'i') } },
                ];
                if (callerUser?._id) callerOr.push({ userId: callerUser._id });
                const existingFree = await Booking.findOne({
                    creatorId: profile.userId,
                    sessionTypeId: { $in: freeSessionIds },
                    status: { $ne: 'cancelled' },
                    paymentStatus: { $ne: 'failed' },
                    $or: callerOr,
                })
                    .select('_id')
                    .lean();
                alreadyBookedFreeConsultation = Boolean(existingFree);
            }
        }

        const reviews = clientReviews.map((r: any, index: number) => {
            const uid = String(r.reviewerId);
            const ru = reviewerUserMap.get(uid);
            const rp = reviewerProfileMap.get(uid);
            return {
                id: String(r._id),
                name: rp?.displayName || ru?.name || 'Client',
                avatar: rp?.profilePhoto || ru?.profilePhoto || '/avatar.png',
                rating: r.rating || 0,
                comment: r.comment || '',
                dateLabel: r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })
                    : '',
                commaIdx: index % 3,
            };
        });

        return NextResponse.json({
            success: true,
            creator: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: profile.username,
                displayName: profile.displayName,
                shortBio: profile.shortBio,
                longBio: sanitizeRichText(profile.longBio),
                profilePhoto: profile.profilePhoto || '/avatar.png',
                coverPhoto: profile.coverPhoto,
                city: profile.city,
                country: profile.country,
                languages: profile.languages,
                niches: profile.niches,
                socialLinks: profile.socialLinks,
                isVerified: user.isVerified,
                isDeactivated: Boolean(profile.isDeactivated),
                rating: ratingSummary.rating,
                ratingLabel: ratingSummary.ratingLabel,
                reviewCount: ratingSummary.reviewCount,
                ratingDisplay: ratingSummary.display,
                stats: {
                    sessionsCompleted: sessionsCompleted,
                    happyCustomers: happyCustomers,
                    totalCategories: totalCategories,
                    rating: ratingSummary.rating,
                    ratingLabel: ratingSummary.ratingLabel,
                    reviewCount: ratingSummary.reviewCount,
                    ratingDisplay: ratingSummary.display,
                }
            },
            sessions: sessions
                .filter((s: any) => s.isActive !== false)
                .map((s: any) => ({
                    id: s._id,
                    title: s.title,
                    description: s.description,
                    duration: `${s.duration} mins`,
                    durationMinutes: s.duration,
                    bufferTime: Math.max(0, Number(s.bufferTime) || 0),
                    price: s.price,
                    discountedPrice: s.discountedPrice,
                    minAdvanceDays: Math.max(0, Number(s.minAdvanceDays) || 0),
                    questions: s.questions || [],
                    features: s.features,
                    isPackage: !!s.isPackage,
                    isFreeConsultation: !!s.isFreeConsultation,
                    alreadyBookedFreeConsultation: Boolean(
                        s.isFreeConsultation && alreadyBookedFreeConsultation
                    ),
                    packageSessions: s.packageSessions,
                    packagePeriod: s.packagePeriod,
                })),
            reviews,
            events: (() => {
                const today = todayISODate();
                return publishedEvents
                    .filter((e) => eventHasFutureOrTodayDate(e, today))
                    .map((e) => ({
                        id: String(e._id),
                        title: e.title,
                        description: e.description || '',
                        bannerUrl: e.bannerUrl || '',
                        category: e.category || '',
                        dates: e.dates || [],
                        publishedAt: e.publishedAt || null,
                    }));
            })(),
        });
    } catch (error: any) {
        console.error('Fetch creator profile error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
