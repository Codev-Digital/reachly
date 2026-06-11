import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentMethod = 'jazzcash' | 'easypaisa' | 'bank';
export type PayoutFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface ICreatorPayment extends Document {
  userId: mongoose.Types.ObjectId;
  paymentMethod: PaymentMethod;
  // JazzCash / EasyPaisa
  mobileNumber?: string;
  accountTitle?: string;
  // Bank transfer
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  // Tax
  ntnNumber?: string;
  // Payout
  payoutFrequency: PayoutFrequency;
  // CNIC verification (Supabase URLs)
  cnicFront?: string;
  cnicBack?: string;
  isPaymentComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CreatorPaymentSchema = new Schema<ICreatorPayment>(
  {
    userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    paymentMethod:   { type: String, enum: ['jazzcash', 'easypaisa', 'bank'] },
    mobileNumber:    { type: String },
    accountTitle:    { type: String },
    bankName:        { type: String },
    accountNumber:   { type: String },
    iban:            { type: String },
    ntnNumber:       { type: String },
    payoutFrequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'], default: 'weekly' },
    cnicFront:       { type: String },
    cnicBack:        { type: String },
    isPaymentComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CreatorPayment: Model<ICreatorPayment> =
  mongoose.models.CreatorPayment ||
  mongoose.model<ICreatorPayment>('CreatorPayment', CreatorPaymentSchema);

export default CreatorPayment;
