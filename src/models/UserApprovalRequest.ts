import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserApprovalRequest extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserApprovalRequestSchema = new Schema<IUserApprovalRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    phone: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    reason: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const UserApprovalRequest: Model<IUserApprovalRequest> =
  mongoose.models.UserApprovalRequest ||
  mongoose.model<IUserApprovalRequest>('UserApprovalRequest', UserApprovalRequestSchema);

export default UserApprovalRequest;
