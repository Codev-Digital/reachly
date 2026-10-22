import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { currentCreatorId } from '@/lib/creatorAuth';
import Review from '@/models/Review';
import ReviewReport from '@/models/ReviewReport';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';

/** GET — client reviews of this creator (user → creator), with report status. */
export async function GET() {
  try {
    const creatorId = await currentCreatorId();
    if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const reviews = await Review.find({
      revieweeId: creatorId,
      reviewerRole: 'user',
      isHidden: { $ne: true },
      rating: { $gte: 1 },
    })
      .sort({ createdAt: -1 })
      .lean();

    const reviewerIds = [
      ...new Set(reviews.map((r: any) => String(r.reviewerId)).filter(Boolean)),
    ];
    const reviewIds = reviews.map((r: any) => r._id);

    const [users, profiles, reports] = await Promise.all([
      reviewerIds.length
        ? User.find({ _id: { $in: reviewerIds } }).select('name profilePhoto').lean()
        : Promise.resolve([]),
      reviewerIds.length
        ? CreatorProfile.find({ userId: { $in: reviewerIds } })
            .select('userId displayName profilePhoto')
            .lean()
        : Promise.resolve([]),
      reviewIds.length
        ? ReviewReport.find({
            reviewId: { $in: reviewIds },
            reportedBy: creatorId,
          })
            .select('reviewId status')
            .lean()
        : Promise.resolve([]),
    ]);

    const userMap = new Map((users as any[]).map((u) => [String(u._id), u]));
    const profileMap = new Map(
      (profiles as any[]).map((p) => [String(p.userId), p])
    );
    const reportMap = new Map(
      (reports as any[]).map((r) => [String(r.reviewId), r.status as string])
    );

    const items = reviews.map((r: any, index: number) => {
      const uid = String(r.reviewerId);
      const user = userMap.get(uid);
      const profile = profileMap.get(uid);
      const name = profile?.displayName || user?.name || 'Client';
      const avatar = profile?.profilePhoto || user?.profilePhoto || '/avatar.png';
      const reportStatus = reportMap.get(String(r._id)) || null;

      return {
        id: String(r._id),
        name,
        avatar,
        rating: r.rating || 0,
        comment: r.comment || '',
        sessionDurationMins: r.sessionDurationMins || null,
        bookingRef: r.bookingRef || '',
        createdAt: r.createdAt,
        dateLabel: r.createdAt
          ? new Date(r.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '',
        reported: Boolean(reportStatus),
        reportStatus,
        commaIdx: index % 3,
      };
    });

    return NextResponse.json({ success: true, reviews: items });
  } catch (err) {
    console.error('[GET /api/creators/reviews]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
