import mongoose, { Schema, Document, Model } from 'mongoose';

export type ConversationType = 'dm' | 'broadcast';

export interface IConversation extends Document {
  type: ConversationType;
  /** Set for event broadcast channels — unique per event. */
  eventId?: mongoose.Types.ObjectId | null;
  /** Display title for broadcast channels (event name). */
  title?: string;
  /** Banner/avatar for broadcast channels. */
  bannerUrl?: string;
  /** Broadcast members (creator + ticket buyers). */
  participantIds: mongoose.Types.ObjectId[];
  creatorId: mongoose.Types.ObjectId;
  /** Required for 1:1 DMs; omitted for broadcast channels. */
  userId?: mongoose.Types.ObjectId | null;
  isLocked: boolean;
  creatorClearedAt?: Date;
  userClearedAt?: Date;
  isArchivedByCreator?: boolean;
  isArchivedByUser?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ['dm', 'broadcast'],
      default: 'dm',
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
      index: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    bannerUrl: {
      type: String,
      default: '',
      maxlength: 2048,
    },
    participantIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
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
    isArchivedByCreator: {
      type: Boolean,
      default: false,
    },
    isArchivedByUser: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Unique 1:1 DM per creator–user pair (broadcasts excluded via eventId)
ConversationSchema.index(
  { creatorId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { eventId: null } }
);
// One broadcast channel per event
ConversationSchema.index(
  { eventId: 1 },
  { unique: true, sparse: true }
);
ConversationSchema.index({ creatorId: 1, updatedAt: -1 });
ConversationSchema.index({ userId: 1, updatedAt: -1 });
ConversationSchema.index({ participantIds: 1, updatedAt: -1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
