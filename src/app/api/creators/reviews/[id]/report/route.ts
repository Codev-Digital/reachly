import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { currentCreatorId } from '@/lib/creatorAuth';
import Review from '@/models/Review';
import ReviewReport from '@/models/ReviewReport';

type RouteContext = { params: Promise<{ id: string }> };

const REASON_MAX = 250;

/**
 * POST — creator reports a client review for admin verification.
 * Body: { reason: string } (required, max 250 chars)
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const creatorId = await currentCreatorId();
    if (!creatorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid review id.' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason =
      typeof body?.reason === 'string' ? body.reason.trim().slice(0, REASON_MAX) : '';
    if (!reason) {
      return NextResponse.json(
        { error: 'Please tell us why you are reporting this review.' },
        { status: 422 }
      );
    }

    await connectDB();

    const review = await Review.findById(id).exec();
    if (!review || review.isHidden) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }
    if (review.revieweeId?.toString() !== creatorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (review.reviewerRole !== 'user') {
      return NextResponse.json({ error: 'Only client reviews can be reported.' }, { status: 400 });
    }

    const existing = await ReviewReport.findOne({
      reviewId: review._id,
      reportedBy: creatorId,
    }).exec();

    if (existing) {
      if (existing.status === 'pending') {
        existing.reason = reason;
        await existing.save();
        return NextResponse.json({
          success: true,
          report: {
            id: String(existing._id),
            status: existing.status,
            reason: existing.reason,
          },
          updated: true,
        });
      }
      return NextResponse.json(
        { error: 'This review has already been reported and reviewed by admin.' },
        { status: 409 }
      );
    }

    const report = await ReviewReport.create({
      reviewId: review._id,
      reportedBy: creatorId,
      reason,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      report: {
        id: String(report._id),
        status: report.status,
        reason: report.reason,
      },
    });
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: 'You already reported this review.' },
        { status: 409 }
      );
    }
    console.error('[POST /api/creators/reviews/:id/report]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
