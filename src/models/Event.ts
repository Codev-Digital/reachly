import mongoose, { Schema, Document, Model } from 'mongoose';

export type EventStatus = 'draft' | 'published' | 'cancelled';
export type EventMode = 'Online' | 'Physical';
export type DayPeriod = 'AM' | 'PM';

export interface IEventTier {
  title: string;
  price: number; // PKR, 0 = free
  persons: number; // people allowed per ticket of this tier
  quantity: number; // tickets available for this date
}

export interface IEventSlot {
  description: string;
}

/** One calendar day of the event with its times, ticket tiers and schedule slots. */
export interface IEventDate {
  /** Local calendar day as YYYY-MM-DD (never shift with UTC). */
  date: string;
  startHour: string;
  startMinute: string;
  startPeriod: DayPeriod;
  endHour: string;
  endMinute: string;
  endPeriod: DayPeriod;
  tiers: IEventTier[];
  slots: IEventSlot[];
}

export interface IEventVolunteer {
  _id?: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  role: string;
  addedAt: Date;
}

export interface IEvent extends Document {
  creatorId: mongoose.Types.ObjectId; // ref → User (the creator)
  status: EventStatus;
  title: string;
  description: string; // sanitized HTML
  bannerUrl: string;
  category: string;
  eventMode?: EventMode | '';
  location?: string;
  dates: IEventDate[];
  volunteers?: IEventVolunteer[];
  refundPolicy: string;
  termsAndConditions: string;
  publishedAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EventTierSchema = new Schema<IEventTier>(
  {
    title: { type: String, required: true, trim: true, maxlength: 40 },
    price: { type: Number, required: true, min: 0, max: 99_999_999 },
    persons: { type: Number, required: true, min: 1, max: 99_999 },
    quantity: { type: Number, required: true, min: 0, max: 999_999 },
  },
  { _id: false }
);

const EventSlotSchema = new Schema<IEventSlot>(
  {
    description: { type: String, default: '', trim: true, maxlength: 300 },
  },
  { _id: false }
);

const EventDateSchema = new Schema<IEventDate>(
  {
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'],
    },
    startHour: { type: String, default: '', maxlength: 2 },
    startMinute: { type: String, default: '', maxlength: 2 },
    startPeriod: { type: String, enum: ['AM', 'PM'], default: 'AM' },
    endHour: { type: String, default: '', maxlength: 2 },
    endMinute: { type: String, default: '', maxlength: 2 },
    endPeriod: { type: String, enum: ['AM', 'PM'], default: 'PM' },
    tiers: { type: [EventTierSchema], default: [] },
    slots: { type: [EventSlotSchema], default: [] },
  },
  { _id: false }
);

const EventVolunteerSchema = new Schema<IEventVolunteer>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 80 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const EventSchema = new Schema<IEvent>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled'],
      default: 'draft',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      default: '',
      // HTML markup; visible text is capped at 5000 by the API
      maxlength: 50000,
    },
    bannerUrl: {
      type: String,
      default: '',
      maxlength: 2048,
    },
    // Allowed values are enforced in eventValidation (not enum here), so new
    // categories do not require a server restart to clear a cached Mongoose model.
    category: {
      type: String,
      default: '',
      trim: true,
      maxlength: 40,
    },
    eventMode: {
      type: String,
      enum: ['Online', 'Physical', ''],
      default: '',
    },
    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: 200,
    },
    volunteers: {
      type: [EventVolunteerSchema],
      default: [],
    },
    dates: {
      type: [EventDateSchema],
      default: [],
    },
    refundPolicy: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    termsAndConditions: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

EventSchema.index({ creatorId: 1, status: 1, createdAt: -1 });
EventSchema.index({ creatorId: 1, 'dates.date': 1 });
EventSchema.index({ status: 1, publishedAt: -1 });
EventSchema.index({ status: 1, 'dates.date': 1, publishedAt: -1 });

// In dev, drop a stale cached schema (e.g. old category enum) so saves don't fail
// after field changes until you manually restart the server.
if (process.env.NODE_ENV === 'development' && mongoose.models.Event) {
  delete mongoose.models.Event;
}

const Event: Model<IEvent> = mongoose.model<IEvent>('Event', EventSchema);

export default Event;
