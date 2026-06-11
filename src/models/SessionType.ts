import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISessionType extends Document {
  userId: mongoose.Types.ObjectId; // owner — ref → User
  title: string;
  description: string;
  duration: number;   // minutes  (15 | 30 | 45 | 60 | 90)
  price: number;      // PKR
  features: string[]; // what's included bullets
  maxBookings?: number; // per day cap (optional)
  order: number;      // display order
  createdAt: Date;
  updatedAt: Date;
}

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
      maxlength: 500,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      enum: {
        values: [15, 30, 45, 60, 90],
        message: 'Duration must be 15, 30, 45, 60, or 90 minutes',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least PKR 1'],
    },
    features: {
      type: [String],
      default: [],
    },
    maxBookings: {
      type: Number,
      min: [1, 'Max bookings must be at least 1'],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const SessionType: Model<ISessionType> =
  mongoose.models.SessionType ||
  mongoose.model<ISessionType>('SessionType', SessionTypeSchema);

export default SessionType;
