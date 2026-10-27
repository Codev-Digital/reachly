import mongoose, { Document, Model, Schema } from 'mongoose';

export type SessionProofPaymentMethod = 'easypaisa' | 'jazzcash';
export type SessionPaymentProofStatus = 'pending' | 'approved' | 'rejected';

export interface ISessionPaymentProof extends Document {
  bookingId: mongoose.Types.ObjectId;
  bookingRef: string;
  userId?: mongoose.Types.ObjectId;
  payerName: string;
  payerEmail: string;
  creatorId: mongoose.Types.ObjectId;
  creatorName: string;
  creatorUsername: string;
  sessionTypeId: mongoose.Types.ObjectId;
  sessionTitle: string;
  scheduledDate: Date;
  scheduledTime: string;
  paymentMethod: SessionProofPaymentMethod;
  amount: number;
  currency: 'PKR';
  screenshotPath: string;
  status: SessionPaymentProofStatus;
  reviewedAt?: Date;
  reviewedBy?: string;
  adminRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionPaymentProofSchema = new Schema<ISessionPaymentProof>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    bookingRef: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    payerName: { type: String, required: true },
    payerEmail: { type: String, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creatorName: { type: String, required: true },
    creatorUsername: { type: String, required: true },
    sessionTypeId: { type: Schema.Types.ObjectId, ref: 'SessionType', required: true },
    sessionTitle: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    paymentMethod: { type: String, enum: ['easypaisa', 'jazzcash'], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['PKR'], default: 'PKR' },
    screenshotPath: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewedAt: { type: Date },
    reviewedBy: { type: String },
    adminRemarks: { type: String, default: '' },
  },
  { timestamps: true }
);

SessionPaymentProofSchema.index({ status: 1, createdAt: -1 });

const SessionPaymentProof: Model<ISessionPaymentProof> =
  mongoose.models.SessionPaymentProof ||
  mongoose.model<ISessionPaymentProof>('SessionPaymentProof', SessionPaymentProofSchema);

export default SessionPaymentProof;
