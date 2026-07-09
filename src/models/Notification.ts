import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // recipient
  title: string;
  message: string;
  type: 'booking' | 'reschedule' | 'cancellation' | 'reminder' | 'payout' | 'review' | 'system';
  read: boolean;
  time: string; // display helper like "2 Min"
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['booking', 'reschedule', 'cancellation', 'reminder', 'payout', 'review', 'system'],
      default: 'system',
    },
    read: { type: Boolean, default: false },
    time: { type: String, default: 'Just now' },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
