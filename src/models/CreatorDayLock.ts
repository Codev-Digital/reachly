import mongoose, { Model, Schema } from 'mongoose';

interface ICreatorDayLock {
  _id: string;
  lockToken: string;
  lockExpiresAt: Date;
}

const CreatorDayLockSchema = new Schema<ICreatorDayLock>({
  _id: { type: String },
  lockToken: { type: String, required: true },
  lockExpiresAt: { type: Date, required: true },
});

CreatorDayLockSchema.index({ lockExpiresAt: 1 }, { expireAfterSeconds: 0 });

const CreatorDayLock: Model<ICreatorDayLock> =
  mongoose.models.CreatorDayLock ||
  mongoose.model<ICreatorDayLock>('CreatorDayLock', CreatorDayLockSchema);

export default CreatorDayLock;
