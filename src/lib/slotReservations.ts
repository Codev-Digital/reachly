import { randomUUID } from 'crypto';
import CreatorDayLock from '@/models/CreatorDayLock';

const DAY_LOCK_MS = 2 * 60 * 1000;

export async function acquireCreatorDayLock(
  creatorId: string,
  dateKey: string
): Promise<(() => Promise<void>) | null> {
  const lockId = `${creatorId}:${dateKey}`;
  const lockToken = randomUUID();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const now = new Date();
    try {
      const lock = await CreatorDayLock.findOneAndUpdate(
        { _id: lockId, lockExpiresAt: { $lte: now } },
        { $set: { lockToken, lockExpiresAt: new Date(now.getTime() + DAY_LOCK_MS) } },
        { new: true, upsert: true }
      );
      if (lock?.lockToken === lockToken) {
        return async () => {
          await CreatorDayLock.updateOne(
            { _id: lockId, lockToken },
            { $set: { lockExpiresAt: new Date(0) } }
          );
        };
      }
    } catch (error) {
      const mongoError = error as { code?: number };
      if (mongoError.code !== 11000) throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return null;
}
