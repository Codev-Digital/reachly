import mongoose from 'mongoose';
import Conversation, { IConversation } from '@/models/Conversation';
import Booking from '@/models/Booking';
import User from '@/models/User';

/**
 * Ensures a 1:1 DM conversation exists between a creator and user for a session booking.
 * Idempotent: returns the existing conversation if one already exists.
 * If the booking lacks userId, attempts to resolve it using guestDetails.email.
 */
export async function ensureBookingConversation(
  bookingOrId: any
): Promise<IConversation | null> {
  try {
    let booking = bookingOrId;
    if (
      typeof bookingOrId === 'string' ||
      bookingOrId instanceof mongoose.Types.ObjectId
    ) {
      booking = await Booking.findById(bookingOrId);
    }
    if (!booking) return null;

    let creatorId = booking.creatorId;
    let userId = booking.userId;

    // If userId is missing, attempt to link with an existing user account by email
    if (!userId && booking.guestDetails?.email) {
      const email = String(booking.guestDetails.email).toLowerCase().trim();
      if (email) {
        const matchedUser = (await User.findOne({ email })
          .select('_id')
          .lean()) as any;
        if (matchedUser?._id) {
          userId = matchedUser._id;
          await Booking.updateOne(
            { _id: booking._id },
            { $set: { userId } }
          ).catch(() => {});
        }
      }
    }

    if (!creatorId || !userId) return null;

    // A creator cannot chat with themselves
    if (creatorId.toString() === userId.toString()) return null;

    const creatorObjId = new mongoose.Types.ObjectId(String(creatorId));
    const userObjId = new mongoose.Types.ObjectId(String(userId));

    // Look for existing 1:1 DM conversation
    let conversation = await Conversation.findOne({
      type: 'dm',
      creatorId: creatorObjId,
      userId: userObjId,
      eventId: null,
    });

    if (!conversation) {
      try {
        conversation = await Conversation.create({
          type: 'dm',
          creatorId: creatorObjId,
          userId: userObjId,
          isLocked: true,
        });
      } catch (err: any) {
        // Handle race conditions where another call created the unique pair in parallel
        if (err?.code === 11000) {
          conversation = await Conversation.findOne({
            creatorId: creatorObjId,
            userId: userObjId,
            eventId: null,
          });
        } else {
          throw err;
        }
      }
    }

    return conversation;
  } catch (error) {
    console.error('[sessionChat] ensureBookingConversation error:', error);
    return null;
  }
}

/**
 * Backfills / auto-heals missing conversations for any confirmed bookings belonging to this user or creator.
 * Uses set-diff queries and bulk inserts instead of per-booking loops so chat loading stays fast.
 */
export async function backfillConversationsForUser(
  userId: string | mongoose.Types.ObjectId,
  userEmail?: string
): Promise<void> {
  try {
    const uid = new mongoose.Types.ObjectId(String(userId));
    const email = userEmail ? userEmail.toLowerCase().trim() : '';

    const conditions: any[] = [{ creatorId: uid }, { userId: uid }];
    if (email) {
      conditions.push({ 'guestDetails.email': email });
    }

    const bookings = (await Booking.find({
      $and: [
        { $or: conditions },
        { status: { $in: ['confirmed', 'completed'] } },
        {
          $or: [
            { paymentStatus: { $in: ['paid', 'completed'] } },
            { finalPrice: 0 },
            { price: 0 },
          ],
        },
      ],
    })
      .select('_id creatorId userId guestDetails.email')
      .lean()) as any[];

    if (!bookings.length) return;

    // Batch-resolve any bookings still missing userId via guestDetails.email
    const missingEmails = Array.from(
      new Set(
        bookings
          .filter((b) => !b.userId && b.guestDetails?.email)
          .map((b) => String(b.guestDetails.email).toLowerCase().trim())
          .filter(Boolean)
      )
    );

    const emailToUserId = new Map<string, mongoose.Types.ObjectId>();
    if (missingEmails.length > 0) {
      const matchedUsers = (await User.find({ email: { $in: missingEmails } })
        .select('_id email')
        .lean()) as any[];
      for (const u of matchedUsers) {
        if (u?.email && u?._id) {
          emailToUserId.set(String(u.email).toLowerCase().trim(), u._id);
        }
      }

      const bulkBookingUpdates: any[] = [];
      for (const b of bookings) {
        if (!b.userId && b.guestDetails?.email) {
          const matchedId = emailToUserId.get(
            String(b.guestDetails.email).toLowerCase().trim()
          );
          if (matchedId) {
            b.userId = matchedId;
            bulkBookingUpdates.push({
              updateOne: {
                filter: { _id: b._id },
                update: { $set: { userId: matchedId } },
              },
            });
          }
        }
      }
      if (bulkBookingUpdates.length > 0) {
        void Booking.bulkWrite(bulkBookingUpdates).catch(() => {});
      }
    }

    // Collect distinct valid creator-user pairs (skip self-chats)
    const pairMap = new Map<
      string,
      { creatorId: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId }
    >();
    for (const b of bookings) {
      if (!b.creatorId || !b.userId) continue;
      const cid = String(b.creatorId);
      const bid = String(b.userId);
      if (cid === bid) continue;
      const key = `${cid}:${bid}`;
      if (!pairMap.has(key)) {
        pairMap.set(key, {
          creatorId: new mongoose.Types.ObjectId(cid),
          userId: new mongoose.Types.ObjectId(bid),
        });
      }
    }

    if (pairMap.size === 0) return;

    const existingConvs = (await Conversation.find({
      type: 'dm',
      eventId: null,
      $or: [{ creatorId: uid }, { userId: uid }],
    })
      .select('creatorId userId')
      .lean()) as any[];

    const existingKeys = new Set(
      existingConvs.map((c) => `${String(c.creatorId)}:${String(c.userId)}`)
    );

    const missingDocs: any[] = [];
    for (const [key, pair] of pairMap) {
      if (!existingKeys.has(key)) {
        missingDocs.push({
          type: 'dm',
          creatorId: pair.creatorId,
          userId: pair.userId,
          eventId: null,
          isLocked: true,
        });
      }
    }

    if (missingDocs.length === 0) return;

    // Ignore duplicate key errors in case concurrent requests raced
    await Conversation.insertMany(missingDocs, { ordered: false }).catch((err: any) => {
      if (err?.code !== 11000 && !Array.isArray(err?.writeErrors)) {
        throw err;
      }
    });
  } catch (error) {
    console.error('[sessionChat] backfillConversationsForUser error:', error);
  }
}
