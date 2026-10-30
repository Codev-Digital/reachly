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
 * Called automatically by GET /api/conversations to guarantee existing bookings display their chats.
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
      .select(
        '_id creatorId userId guestDetails status paymentStatus finalPrice price'
      )
      .lean()) as any[];

    if (!bookings.length) return;

    for (const b of bookings) {
      await ensureBookingConversation(b);
    }
  } catch (error) {
    console.error('[sessionChat] backfillConversationsForUser error:', error);
  }
}
