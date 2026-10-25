import mongoose, { Schema, Document, Model } from 'mongoose';

export type MeetingRecordingStatus =
  | 'pending'
  | 'recording'
  | 'processing'
  | 'ready'
  | 'failed';

export interface IMeetingRecording extends Document {
  bookingId: mongoose.Types.ObjectId;
  bookingRef: string;
  creatorId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId | null;

  creatorName: string;
  creatorUsername?: string;
  creatorPhoto?: string;
  userName: string;
  userEmail?: string;
  userPhoto?: string;

  sessionTitle: string;
  sessionDurationMins: number;
  scheduledDate?: Date;
  scheduledTime?: string;

  purchasedAt?: Date;
  paymentMethod?: string;
  paymentStatus?: string;
  finalPrice?: number;

  meetingStartedAt?: Date | null;
  meetingEndedAt?: Date | null;

  dailyRoomName?: string;
  dailyRecordingId?: string;
  dailyTranscriptId?: string;

  videoUrl?: string;
  transcriptUrl?: string;
  transcriptText?: string;

  status: MeetingRecordingStatus;
  durationSeconds?: number;
  error?: string;

  createdAt: Date;
  updatedAt: Date;
}

const MeetingRecordingSchema = new Schema<IMeetingRecording>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    bookingRef: { type: String, required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, default: null },

    creatorName: { type: String, default: '' },
    creatorUsername: { type: String, default: '' },
    creatorPhoto: { type: String, default: '' },
    userName: { type: String, default: 'Guest' },
    userEmail: { type: String, default: '' },
    userPhoto: { type: String, default: '' },

    sessionTitle: { type: String, default: 'Session' },
    sessionDurationMins: { type: Number, default: 15 },
    scheduledDate: { type: Date },
    scheduledTime: { type: String },

    purchasedAt: { type: Date },
    paymentMethod: { type: String },
    paymentStatus: { type: String },
    finalPrice: { type: Number },

    meetingStartedAt: { type: Date, default: null },
    meetingEndedAt: { type: Date, default: null },

    dailyRoomName: { type: String },
    dailyRecordingId: { type: String, index: true },
    dailyTranscriptId: { type: String },

    videoUrl: { type: String },
    transcriptUrl: { type: String },
    transcriptText: { type: String },

    status: {
      type: String,
      enum: ['pending', 'recording', 'processing', 'ready', 'failed'],
      default: 'pending',
      index: true,
    },
    durationSeconds: { type: Number },
    error: { type: String },
  },
  { timestamps: true }
);

MeetingRecordingSchema.index({ creatorId: 1, createdAt: -1 });
MeetingRecordingSchema.index({ userId: 1, createdAt: -1 });

const MeetingRecording: Model<IMeetingRecording> =
  mongoose.models.MeetingRecording ||
  mongoose.model<IMeetingRecording>('MeetingRecording', MeetingRecordingSchema);

export default MeetingRecording;
