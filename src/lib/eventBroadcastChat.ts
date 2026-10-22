import mongoose from 'mongoose';
import Conversation from '@/models/Conversation';

type EventLike = {
  _id: mongoose.Types.ObjectId | string;
  creatorId: mongoose.Types.ObjectId | string;
  title?: string;
  bannerUrl?: string;
};

let indexesReady: Promise<void> | null = null;

/** Drop legacy unique DM index and apply partial/sparse indexes for broadcast support. */
async function ensureConversationIndexes() {
  if (!indexesReady) {
    indexesReady = (async () => {
      try {
        const collection = Conversation.collection;
        const existing = await collection.indexes();
        const legacy = existing.find(
          (idx: any) =>
            idx.name === 'creatorId_1_userId_1' && !idx.partialFilterExpression
        );
        if (legacy?.name) {
          await collection.dropIndex(legacy.name).catch(() => undefined);
        }
        await Conversation.syncIndexes();
      } catch (err) {
        console.error('[eventBroadcastChat] index sync:', err);
      }
    })();
  }
  await indexesReady;
}

/** Create (or refresh title/banner of) the event broadcast chat channel. */
export async function ensureEventBroadcastChannel(event: EventLike) {
  await ensureConversationIndexes();

  const eventId = new mongoose.Types.ObjectId(String(event._id));
  const creatorId = new mongoose.Types.ObjectId(String(event.creatorId));
  const title = (event.title || 'Event').trim() || 'Event';
  const bannerUrl = (event.bannerUrl || '').trim();

  const existing = await Conversation.findOne({ type: 'broadcast', eventId });
  if (existing) {
    let dirty = false;
    if (existing.title !== title) {
      existing.title = title;
      dirty = true;
    }
    if ((existing.bannerUrl || '') !== bannerUrl) {
      existing.bannerUrl = bannerUrl;
      dirty = true;
    }
    // Ensure creator stays in the member list
    const creatorStr = creatorId.toString();
    const hasCreator = (existing.participantIds || []).some(
      (id) => id.toString() === creatorStr
    );
    if (!hasCreator) {
      existing.participantIds = [...(existing.participantIds || []), creatorId];
      dirty = true;
    }
    if (dirty) await existing.save();
    return existing;
  }

  return Conversation.create({
    type: 'broadcast',
    eventId,
    creatorId,
    title,
    bannerUrl,
    participantIds: [creatorId],
    isLocked: false,
  });
}

/** Add a ticket buyer to the event's broadcast channel (idempotent). */
export async function addBuyerToEventBroadcast(
  eventId: string | mongoose.Types.ObjectId,
  userId: string | mongoose.Types.ObjectId
) {
  const eid = new mongoose.Types.ObjectId(String(eventId));
  const uid = new mongoose.Types.ObjectId(String(userId));

  let channel = await Conversation.findOne({ type: 'broadcast', eventId: eid });
  if (!channel) {
    // Channel should already exist from event create/publish; create a minimal one if missing
    const Event = (await import('@/models/Event')).default;
    const event = await Event.findById(eid).select('creatorId title bannerUrl').lean() as any;
    if (!event) return null;
    channel = await ensureEventBroadcastChannel(event);
  }

  await Conversation.updateOne(
    { _id: channel._id },
    {
      $addToSet: { participantIds: uid },
      $set: { updatedAt: new Date() },
    }
  );

  return channel;
}

/** Remove a refunded / cancelled buyer from the event broadcast channel. */
export async function removeBuyerFromEventBroadcast(
  eventId: string | mongoose.Types.ObjectId,
  userId: string | mongoose.Types.ObjectId
) {
  const eid = new mongoose.Types.ObjectId(String(eventId));
  const uid = new mongoose.Types.ObjectId(String(userId));

  await Conversation.updateOne(
    { type: 'broadcast', eventId: eid },
    {
      $pull: { participantIds: uid },
      $set: { updatedAt: new Date() },
    }
  );
}
