import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Time the creator is busy with something booked OUTSIDE Reachly.
 * It is removed from the slots users can pick, so it can never clash with a booking.
 */
export interface ICalendarBlock extends Document {
  creatorId: mongoose.Types.ObjectId;
  scheduledDate: Date;     // noon UTC of the day (same convention as Booking.scheduledDate)
  startTime: string;       // "05:00 PM" (same format as Booking.scheduledTime)
  durationMinutes: number;
  title?: string;
  createdAt: Date;
}

const CalendarBlockSchema = new Schema<ICalendarBlock>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheduledDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true, min: 5, max: 1440 },
    title: { type: String, trim: true, maxlength: 100 },
  },
  { timestamps: true }
);

CalendarBlockSchema.index({ creatorId: 1, scheduledDate: 1 });

const CalendarBlock: Model<ICalendarBlock> =
  mongoose.models.CalendarBlock || mongoose.model<ICalendarBlock>('CalendarBlock', CalendarBlockSchema);

export default CalendarBlock;
