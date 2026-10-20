import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISessionQuestion {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  type: 'multiple_choice' | 'short_answer';
  question: string;
  options?: string[]; // predefined options for multiple_choice e.g. ['Option A', 'Option B', 'Option C', 'Option D']
  required?: boolean;
}

export interface ISessionType extends Document {
  userId: mongoose.Types.ObjectId; // owner — ref → User
  title: string;
  description: string;
  duration: number;   // minutes (supports 15, 30, 45, 60 or custom positive minutes)
  price: number;      // PKR
  discountedPrice?: number; // optional discounted price in PKR
  bufferTime?: number; // minutes of rest kept free after a session (0 = none, never more than `duration`)
  questions: ISessionQuestion[]; // pre-session intake questions
  features: string[]; // what's included bullets
  maxBookings?: number; // per day cap (optional)
  isPackage?: boolean; // a bundle of N sessions sold for one price (`price` is the whole package)
  packageSessions?: number; // how many sessions the package includes
  packagePeriod?: 'week' | 'month'; // display label only ("5 sessions per week")
  order: number;      // display order
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionQuestionSchema = new Schema<ISessionQuestion>(
  {
    type: {
      type: String,
      enum: ['multiple_choice', 'short_answer'],
      required: true,
      default: 'short_answer',
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: 300,
    },
    options: {
      type: [String],
      default: [],
    },
    required: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const SessionTypeSchema = new Schema<ISessionType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Session description is required'],
      trim: true,
      maxlength: 50000, // HTML markup; visible text is capped at 5000 by the API
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 24 hours'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least PKR 1'],
    },
    discountedPrice: {
      type: Number,
      min: [0, 'Discounted price cannot be negative'],
    },
    bufferTime: {
      type: Number,
      min: [0, 'Buffer time cannot be negative'],
      default: 0,
    },
    questions: {
      type: [SessionQuestionSchema],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    maxBookings: {
      type: Number,
      min: [1, 'Max bookings must be at least 1'],
    },
    isPackage: { type: Boolean, default: false },
    packageSessions: { type: Number, min: [2, 'A package needs at least 2 sessions'], max: 100 },
    packagePeriod: { type: String, enum: ['week', 'month'] },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

SessionTypeSchema.index({ userId: 1, order: 1 });
SessionTypeSchema.index({ userId: 1, isActive: 1 });

const SessionType: Model<ISessionType> =
  mongoose.models.SessionType ||
  mongoose.model<ISessionType>('SessionType', SessionTypeSchema);

export default SessionType;
