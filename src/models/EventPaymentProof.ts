import mongoose, { Document, Model, Schema } from 'mongoose';

export type EventPaymentProofMethod = 'easypaisa' | 'jazzcash';
export type EventPaymentProofStatus = 'pending' | 'approved' | 'rejected';

export interface IEventPaymentProof extends Document {
  purchaseId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  buyerName: string;
  buyerEmail: string;
  eventTitle: string;
  eventBannerUrl?: string;
  eventDate: string;
  eventStartTime?: string;
  tierTitle: string;
  quantity: number;
  amount: number;
  paymentMethod: EventPaymentProofMethod;
  screenshotPath: string;
  status: EventPaymentProofStatus;
  reviewedAt?: Date;
  reviewedBy?: string;
  adminRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventPaymentProofSchema = new Schema<IEventPaymentProof>(
  {
    purchaseId: { type: Schema.Types.ObjectId, ref: 'EventPurchase', required: true, unique: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true, lowercase: true, trim: true },
    eventTitle: { type: String, required: true },
    eventBannerUrl: { type: String, default: '' },
    eventDate: { type: String, required: true },
    eventStartTime: { type: String, default: '' },
    tierTitle: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['easypaisa', 'jazzcash'], required: true },
    screenshotPath: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewedAt: { type: Date },
    reviewedBy: { type: String },
    adminRemarks: { type: String, default: '' },
  },
  { timestamps: true }
);

const EventPaymentProof: Model<IEventPaymentProof> =
  mongoose.models.EventPaymentProof ||
  mongoose.model<IEventPaymentProof>('EventPaymentProof', EventPaymentProofSchema);

export default EventPaymentProof;
