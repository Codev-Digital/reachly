import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId; // kept for backward compat
  senderId: mongoose.Types.ObjectId;
  senderRole: 'creator' | 'user';
  content: string;
  read: boolean;
  attachment?: {
    url: string;
    fileType: string;
    fileName: string;
    fileSize: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['creator', 'user'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    attachment: {
      url: String,
      fileType: String,
      fileName: String,
      fileSize: Number
    },
  },
  { timestamps: true }
);

MessageSchema.index({ bookingId: 1, createdAt: -1 });
MessageSchema.index({ bookingId: 1, senderRole: 1, read: 1 });
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ conversationId: 1, senderRole: 1, read: 1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
