import mongoose, { Schema, Document, Model } from 'mongoose';

export type ReviewerRole = 'user' | 'creator';

export interface IReview extends Document {
  bookingId: mongoose.Types.ObjectId;
  bookingRef?: string;
  /** Person who submitted the review */
  reviewerId: mongoose.Types.ObjectId;
  reviewerRole: ReviewerRole;
  /** Person being reviewed (creator when user reviews; user when creator reviews) */
  revieweeId?: mongoose.Types.ObjectId | null;
  rating?: number | null;
  comment?: string;
  sessionDurationMins?: number;
  /** Hidden after admin verifies an abuse report */
  isHidden?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    bookingRef: { type: String, default: '', index: true },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewerRole: {
      type: String,
      enum: ['user', 'creator'],
      required: true,
    },
    revieweeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    comment: {
      type: String,
      default: '',
      maxlength: 250,
      trim: true,
    },
    sessionDurationMins: {
      type: Number,
      default: null,
      min: 1,
      max: 480,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

/** One review per booking per side (user vs creator). */
ReviewSchema.index({ bookingId: 1, reviewerRole: 1 }, { unique: true });

if (mongoose.models.Review) {
  delete mongoose.models.Review;
}

const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
