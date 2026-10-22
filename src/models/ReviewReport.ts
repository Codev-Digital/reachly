import mongoose, { Schema, Document, Model } from 'mongoose';

export type ReviewReportStatus = 'pending' | 'verified' | 'dismissed';

export interface IReviewReport extends Document {
  reviewId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  /** Creator's reason for reporting (max 250) */
  reason: string;
  status: ReviewReportStatus;
  reviewedBy?: mongoose.Types.ObjectId | null;
  reviewedAt?: Date | null;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewReportSchema = new Schema<IReviewReport>(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'dismissed'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    adminNote: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

/** One open/closed report trail per creator per review (latest wins via update). */
ReviewReportSchema.index({ reviewId: 1, reportedBy: 1 }, { unique: true });

if (mongoose.models.ReviewReport) {
  delete mongoose.models.ReviewReport;
}

const ReviewReport: Model<IReviewReport> = mongoose.model<IReviewReport>(
  'ReviewReport',
  ReviewReportSchema
);

export default ReviewReport;
