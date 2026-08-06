import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  creatorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  isLocked: boolean;
  creatorClearedAt?: Date;
  userClearedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
    creatorClearedAt: {
      type: Date,
      default: null,
    },
    userClearedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Unique conversation per creator-user pair
ConversationSchema.index({ creatorId: 1, userId: 1 }, { unique: true });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
