import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import ReviewReport, { type ReviewReportStatus } from '@/models/ReviewReport';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';

function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

const REPORT_STATUSES: ReviewReportStatus[] = ['pending', 'verified', 'dismissed'];

/** GET — review reports for admin. Supports ?status=&limit= */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status') || 'pending';
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam) || 0)) : null;

    const filter: { status?: ReviewReportStatus } =
      statusParam === 'all'
        ? {}
        : {
            status: REPORT_STATUSES.includes(statusParam as ReviewReportStatus)
              ? (statusParam as ReviewReportStatus)
              : 'pending',
          };
    const total = await ReviewReport.countDocuments(filter);

    let query = ReviewReport.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(limit);

    const reports = await query.lean();

    const reviewIds = reports.map((r: any) => r.reviewId).filter(Boolean);
    const reporterIds = reports.map((r: any) => r.reportedBy).filter(Boolean);

    const reviews = reviewIds.length
      ? await Review.find({ _id: { $in: reviewIds } }).lean()
      : [];
    const reviewMap = new Map((reviews as any[]).map((r) => [String(r._id), r]));

    const reviewerIds = [
      ...new Set(
        (reviews as any[])
          .map((r) => String(r.reviewerId))
          .concat(reporterIds.map(String))
          .concat((reviews as any[]).map((r) => String(r.revieweeId || '')).filter(Boolean))
      ),
    ];

    const [users, profiles] = await Promise.all([
      reviewerIds.length
        ? User.find({ _id: { $in: reviewerIds } }).select('name email profilePhoto').lean()
        : Promise.resolve([]),
      reviewerIds.length
        ? CreatorProfile.find({ userId: { $in: reviewerIds } })
            .select('userId displayName profilePhoto')
            .lean()
        : Promise.resolve([]),
    ]);

    const userMap = new Map((users as any[]).map((u) => [String(u._id), u]));
    const profileMap = new Map(
      (profiles as any[]).map((p) => [String(p.userId), p])
    );

    const nameOf = (id: string) => {
      const p = profileMap.get(id);
      const u = userMap.get(id);
      return p?.displayName || u?.name || 'Unknown';
    };

    const avatarOf = (id: string) => {
      const p = profileMap.get(id);
      const u = userMap.get(id);
      return p?.profilePhoto || u?.profilePhoto || null;
    };

    const items = reports.map((rep: any) => {
      const review = reviewMap.get(String(rep.reviewId));
      const reporterId = String(rep.reportedBy);
      const clientId = review ? String(review.reviewerId) : '';
      const creatorId = review?.revieweeId ? String(review.revieweeId) : reporterId;

      return {
        id: String(rep._id),
        status: rep.status,
        reason: rep.reason || '',
        createdAt: rep.createdAt,
        reviewedAt: rep.reviewedAt || null,
        reporterName: nameOf(reporterId),
        reporterEmail: userMap.get(reporterId)?.email || '',
        clientName: clientId ? nameOf(clientId) : 'Client',
        clientAvatar: clientId ? avatarOf(clientId) : null,
        creatorName: creatorId ? nameOf(creatorId) : 'Creator',
        creatorAvatar: creatorId ? avatarOf(creatorId) : null,
        review: review
          ? {
              id: String(review._id),
              rating: review.rating || 0,
              comment: review.comment || '',
              isHidden: Boolean(review.isHidden),
              bookingRef: review.bookingRef || '',
              createdAt: review.createdAt,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      reports: items,
      total,
      hasMore: limit ? total > limit : false,
    });
  } catch (err) {
    console.error('[GET /api/admin/reviews]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH — admin resolves a report.
 * Body: { reportId, action: 'verified' | 'dismissed' | 'deleted', adminNote? }
 * - verified → hide the review (report valid)
 * - dismissed → keep visible (not harmful)
 * - deleted → permanently delete the review
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const admin = await User.findOne({ email: session.user.email }).select('_id').lean();
    const body = await req.json().catch(() => ({}));
    const reportId = body?.reportId;
    const action = body?.action;

    if (!mongoose.isValidObjectId(reportId)) {
      return NextResponse.json({ error: 'Invalid report id.' }, { status: 400 });
    }
    if (action !== 'verified' && action !== 'dismissed' && action !== 'deleted') {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    const report = await ReviewReport.findById(reportId).exec();
    if (!report) return NextResponse.json({ error: 'Report not found.' }, { status: 404 });

    // Map deleted → store as verified on report, but delete the review
    const reportStatus = action === 'deleted' ? 'verified' : action;
    report.status = reportStatus;
    report.reviewedAt = new Date();
    report.reviewedBy = admin?._id || null;
    if (typeof body?.adminNote === 'string') {
      report.adminNote = body.adminNote.trim().slice(0, 500);
    } else if (action === 'deleted') {
      report.adminNote = 'Review permanently deleted by admin.';
    }
    await report.save();

    if (action === 'verified') {
      await Review.findByIdAndUpdate(report.reviewId, { $set: { isHidden: true } });
    } else if (action === 'deleted') {
      await Review.findByIdAndDelete(report.reviewId);
    }

    return NextResponse.json({
      success: true,
      status: action === 'deleted' ? 'deleted' : report.status,
    });
  } catch (err) {
    console.error('[PATCH /api/admin/reviews]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
