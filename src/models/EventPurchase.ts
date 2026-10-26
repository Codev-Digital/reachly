import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventPurchase extends Document {
  ticketRef: string;
  eventId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  /** Redundant lookup key so tickets still show if ObjectId casting differs. */
  buyerEmail: string;
  eventTitle: string;
  eventBannerUrl?: string;
  category?: string;
  /** YYYY-MM-DD of the chosen event day */
  eventDate: string;
  eventStartTime?: string;
  eventEndTime?: string;
  tierTitle: string;
  tierPrice: number;
  tierPersons: number;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const EventPurchaseSchema = new Schema<IEventPurchase>(
  {
    ticketRef: { type: String, required: true, unique: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    eventTitle: { type: String, required: true, trim: true },
    eventBannerUrl: { type: String, default: '' },
    category: { type: String, default: '' },
    eventDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    eventStartTime: { type: String, default: '' },
    eventEndTime: { type: String, default: '' },
    tierTitle: { type: String, required: true, trim: true },
    tierPrice: { type: Number, required: true, min: 0 },
    tierPersons: { type: Number, required: true, min: 1, default: 1 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

EventPurchaseSchema.index({ userId: 1, createdAt: -1 });
EventPurchaseSchema.index({ buyerEmail: 1, createdAt: -1 });

// Avoid stale compiled models during hot reload in dev
if (mongoose.models.EventPurchase) {
  delete mongoose.models.EventPurchase;
}

const EventPurchase: Model<IEventPurchase> = mongoose.model<IEventPurchase>(
  'EventPurchase',
  EventPurchaseSchema
);

export default EventPurchase;
