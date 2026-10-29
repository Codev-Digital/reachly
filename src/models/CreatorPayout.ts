import mongoose, { Document, Model, Schema } from 'mongoose';

export type CreatorPayoutStatus = 'pending' | 'funded' | 'rejected';

export interface ICreatorPayoutEntry {
  requestedAt: Date;
  withdrawAmount: number;
  bankName: string;
  accountNumber: string;
  status: CreatorPayoutStatus;
  fundedAt?: Date;
  nextWithdrawDate: Date;
  adminRemarks?: string;
}

export interface ICreatorPayout extends Document {
  creatorProfileId: mongoose.Types.ObjectId;
  bankName: string;
  accountNumber: string;
  nextWithdrawDate: Date;
  payouts: ICreatorPayoutEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const PayoutEntrySchema = new Schema<ICreatorPayoutEntry>(
  {
    requestedAt: { type: Date, required: true, default: Date.now },
    withdrawAmount: { type: Number, required: true, min: 1000, max: 50000 },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'funded', 'rejected'],
      default: 'pending',
      required: true,
    },
    fundedAt: { type: Date },
    nextWithdrawDate: { type: Date, required: true },
    adminRemarks: { type: String, trim: true },
  },
  { _id: true }
);

const CreatorPayoutSchema = new Schema<ICreatorPayout>(
  {
    creatorProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'CreatorProfile',
      required: true,
      unique: true,
      index: true,
    },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    nextWithdrawDate: { type: Date, required: true },
    payouts: { type: [PayoutEntrySchema], default: [] },
  },
  { timestamps: true }
);

const CreatorPayout: Model<ICreatorPayout> =
  mongoose.models.CreatorPayout ||
  mongoose.model<ICreatorPayout>('CreatorPayout', CreatorPayoutSchema);

export default CreatorPayout;
