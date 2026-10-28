import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISlotReservation extends Document {
  creatorId: mongoose.Types.ObjectId;
  sessionTypeId: mongoose.Types.ObjectId;
  dateKey: string;
  time: string;
  token: string;
  duration: number;
  bufferTime: number;
  expiresAt: Date;
  status: 'reserved' | 'processing';
}

const SlotReservationSchema = new Schema<ISlotReservation>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionTypeId: { type: Schema.Types.ObjectId, ref: 'SessionType', required: true },
    dateKey: { type: String, required: true },
    time: { type: String, required: true },
    token: { type: String, required: true },
    duration: { type: Number, required: true },
    bufferTime: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ['reserved', 'processing'], default: 'reserved', required: true },
  },
  { timestamps: true }
);

SlotReservationSchema.index({ creatorId: 1, dateKey: 1, time: 1 }, { unique: true });
SlotReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SlotReservationSchema.index({ creatorId: 1, dateKey: 1, expiresAt: 1 });

const SlotReservation: Model<ISlotReservation> =
  mongoose.models.SlotReservation ||
  mongoose.model<ISlotReservation>('SlotReservation', SlotReservationSchema);

export default SlotReservation;
