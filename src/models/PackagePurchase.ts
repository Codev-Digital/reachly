import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPackagePurchase extends Document {
  userId: mongoose.Types.ObjectId;       // the buyer
  creatorId: mongoose.Types.ObjectId;
  sessionTypeId: mongoose.Types.ObjectId; // the package (a SessionType with isPackage)
  title: string;                          // snapshot, so it survives edits
  sessionsTotal: number;
  sessionsBooked: number;                 // booked so far (completed ones are derived from bookings)
  price: number;                          // total package price in PKR
  paymentStatus: 'pending' | 'paid';      // 'paid' once the last session is completed (earnings released)
  status: 'active' | 'completed';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PackagePurchaseSchema = new Schema<IPackagePurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionTypeId: { type: Schema.Types.ObjectId, ref: 'SessionType', required: true },
    title: { type: String, required: true },
    sessionsTotal: { type: Number, required: true, min: 2 },
    sessionsBooked: { type: Number, default: 0 },
    price: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    status: { type: String, enum: ['active', 'completed'], default: 'active', index: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

PackagePurchaseSchema.index({ userId: 1, sessionTypeId: 1, status: 1 });

const PackagePurchase: Model<IPackagePurchase> =
  mongoose.models.PackagePurchase ||
  mongoose.model<IPackagePurchase>('PackagePurchase', PackagePurchaseSchema);

export default PackagePurchase;
