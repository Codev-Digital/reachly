import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITimeSlot {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface IDaySchedule {
  enabled: boolean;
  slots: ITimeSlot[];
}

export interface ICreatorAvailability extends Document {
  userId: mongoose.Types.ObjectId;
  schedule: {
    monday:    IDaySchedule;
    tuesday:   IDaySchedule;
    wednesday: IDaySchedule;
    thursday:  IDaySchedule;
    friday:    IDaySchedule;
    saturday:  IDaySchedule;
    sunday:    IDaySchedule;
  };
  bufferMinutes: number;     // gap between bookings
  timezone: string;
  bookingWindowDays: number; // how far ahead followers can book
  minNoticeHours: number;    // minimum hours notice
  blockedDates: string[];    // ISO date strings "YYYY-MM-DD"
  isAvailabilityComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema<ITimeSlot>(
  { start: { type: String, default: '09:00' }, end: { type: String, default: '17:00' } },
  { _id: false }
);

const DayScheduleSchema = new Schema<IDaySchedule>(
  { enabled: { type: Boolean, default: false }, slots: { type: [TimeSlotSchema], default: [{ start: '09:00', end: '17:00' }] } },
  { _id: false }
);

const CreatorAvailabilitySchema = new Schema<ICreatorAvailability>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    schedule: {
      monday:    { type: DayScheduleSchema, default: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] } },
      tuesday:   { type: DayScheduleSchema, default: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] } },
      wednesday: { type: DayScheduleSchema, default: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] } },
      thursday:  { type: DayScheduleSchema, default: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] } },
      friday:    { type: DayScheduleSchema, default: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] } },
      saturday:  { type: DayScheduleSchema, default: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] } },
      sunday:    { type: DayScheduleSchema, default: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] } },
    },
    bufferMinutes:     { type: Number, default: 15 },
    timezone:          { type: String, default: 'Asia/Karachi' },
    bookingWindowDays: { type: Number, default: 30 },
    minNoticeHours:    { type: Number, default: 4 },
    blockedDates:      { type: [String], default: [] },
    isAvailabilityComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CreatorAvailability: Model<ICreatorAvailability> =
  mongoose.models.CreatorAvailability ||
  mongoose.model<ICreatorAvailability>('CreatorAvailability', CreatorAvailabilitySchema);

export default CreatorAvailability;
