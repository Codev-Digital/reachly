import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICreatorPricing extends Document {
  userId: mongoose.Types.ObjectId;
  offerFirstSessionDiscount: boolean; // 20% off first booking
  payoutFrequency: 'weekly' | 'biweekly' | 'monthly';
  isPricingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CreatorPricingSchema = new Schema<ICreatorPricing>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    offerFirstSessionDiscount: { type: Boolean, default: false },
    payoutFrequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'weekly',
    },
    isPricingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CreatorPricing: Model<ICreatorPricing> =
  mongoose.models.CreatorPricing ||
  mongoose.model<ICreatorPricing>('CreatorPricing', CreatorPricingSchema);

export default CreatorPricing;
