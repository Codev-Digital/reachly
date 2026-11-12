import Booking from '@/models/Booking';
import CreatorProfile from '@/models/CreatorProfile';
import Referral from '@/models/referral.model';
import SessionType from '@/models/SessionType';
import User from '@/models/User';
import { getStripeClient } from '@/lib/stripe';
import {
  generateSessionCancelledEmail,
  generateSessionRescheduledEmail,
  sendEmail,
} from '@/lib/utils';

export interface CancellationRefundResult {
  paymentStatus: 'refunded' | 'failed';
  refunded: boolean;
  refundAmount: number;
  refundedAt: Date | null;
  stripeRefundId?: string;
}

/**
 * Resolves the buyer User id for a booking (direct userId or guest email lookup).
 */
async function resolveBuyerUser(booking: any) {
  if (booking.userId) {
    return User.findById(booking.userId).select('_id name email profilePhoto').lean() as any;
  }
  const guestEmail = booking.guestDetails?.email?.toLowerCase?.().trim();
  if (!guestEmail) return null;
  return User.findOne({ email: guestEmail }).select('_id name email profilePhoto').lean() as any;
}

/**
 * Claws back referral reward on booking cancellation regardless of how payment was settled.
 */
async function clawbackReferralReward(booking: any, buyerUserId: any) {
  if (!buyerUserId) return;
  const referralDoc = await Referral.findOne({ joinnee: buyerUserId }).exec();
  if (!referralDoc) return;

  const bookingIdStr = booking._id?.toString();
  const sessionIdStr = booking.sessionTypeId?.toString();
  const alreadyCancelled = referralDoc.buyActivities.some(
    (act: any) =>
      act.type === 'cancel_session' &&
      ((act.bookingId && act.bookingId.toString() === bookingIdStr) ||
        (sessionIdStr && act.sessionId?.toString() === sessionIdStr))
  );
  if (alreadyCancelled) return;

  const matchingBuy = referralDoc.buyActivities.find(
    (act: any) =>
      act.type === 'buy_session' &&
      ((act.bookingId && act.bookingId.toString() === bookingIdStr) ||
        (sessionIdStr && act.sessionId?.toString() === sessionIdStr))
  );

  if (!matchingBuy) return;

  const rewardAmount = Number(matchingBuy.totalAmount) || 0;
  referralDoc.totalBuyActivities = (referralDoc.totalBuyActivities || 0) + 1;
  referralDoc.buyActivities.push({
    type: 'cancel_session',
    activityTime: new Date(),
    totalAmount: rewardAmount,
    status: 'rejected',
    sessionId: booking.sessionTypeId,
    bookingId: booking._id,
    paymentMethod: booking.paymentMethod,
  });
  await referralDoc.save();

  if (referralDoc.referrer && rewardAmount > 0) {
    const referrerUser = await User.findById(referralDoc.referrer).exec();
    if (referrerUser) {
      referrerUser.totalAmountEarnedFromReferrals = Math.max(
        0,
        (Number(referrerUser.totalAmountEarnedFromReferrals) || 0) - rewardAmount
      );
      await referrerUser.save();
    }
  }
}

/**
 * Issues a Stripe refund when applicable, computes refundAmount, and claws back referral reward.
 */
export async function processBookingCancellationRefund(
  booking: any,
  explicitBuyerId?: any
): Promise<CancellationRefundResult> {
  if (booking.paymentStatus !== 'paid') {
    return {
      paymentStatus: 'failed',
      refunded: false,
      refundAmount: 0,
      refundedAt: null,
    };
  }

  const refundAmount = Math.max(
    0,
    Number(booking.updated_total_amount ?? booking.finalPrice ?? 0)
  );
  const refundedAt = new Date();
  let stripeRefundId: string | undefined = booking.stripeRefundId || undefined;

  if (
    booking.paymentMethod === 'stripe' &&
    refundAmount > 0 &&
    !stripeRefundId &&
    process.env.STRIPE_SECRET_KEY
  ) {
    const stripe = getStripeClient();
    let paymentIntentId: string | undefined = booking.stripePaymentIntentId;

    if (!paymentIntentId && booking.stripeCheckoutSessionId) {
      const checkout = await stripe.checkout.sessions.retrieve(
        booking.stripeCheckoutSessionId
      );
      paymentIntentId =
        typeof checkout.payment_intent === 'string'
          ? checkout.payment_intent
          : checkout.payment_intent?.id;
    }

    if (!paymentIntentId && booking.bookingRef) {
      const sessions = await stripe.checkout.sessions.list({ limit: 50 });
      const matched = sessions.data.find(
        (s) => s.metadata?.bookingRef === booking.bookingRef && s.payment_status === 'paid'
      );
      if (matched) {
        paymentIntentId =
          typeof matched.payment_intent === 'string'
            ? matched.payment_intent
            : matched.payment_intent?.id;
      }
    }

    if (paymentIntentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: 'requested_by_customer',
          metadata: {
            bookingId: booking._id?.toString?.() || '',
            bookingRef: booking.bookingRef || '',
          },
        });
        stripeRefundId = refund.id;
        await Booking.updateOne(
          { _id: booking._id },
          { $set: { stripePaymentIntentId: paymentIntentId, stripeRefundId } }
        );
      } catch (err: any) {
        if (err?.code !== 'charge_already_refunded') {
          throw err;
        }
      }
    } else {
      console.warn(
        `[Refund] Stripe payment_intent not linked for booking ${booking.bookingRef || booking._id}; recording refund in database.`
      );
    }
  }

  const buyerUser = explicitBuyerId
    ? { _id: explicitBuyerId }
    : await resolveBuyerUser(booking);
  await clawbackReferralReward(booking, buyerUser?._id);

  return {
    paymentStatus: 'refunded',
    refunded: true,
    refundAmount,
    refundedAt,
    stripeRefundId,
  };
}

async function loadEmailParticipants(booking: any) {
  const [buyerUser, creatorUser, creatorProfile, sessionType] = await Promise.all([
    resolveBuyerUser(booking),
    User.findById(booking.creatorId).select('name email profilePhoto').lean() as any,
    CreatorProfile.findOne({ userId: booking.creatorId })
      .select('displayName profilePhoto')
      .lean() as any,
    SessionType.findById(booking.sessionTypeId).select('title').lean() as any,
  ]);
  return { buyerUser, creatorUser, creatorProfile, sessionType };
}

/**
 * Sends reschedule confirmation emails to both client and creator with the updated slot.
 */
export async function sendBookingRescheduledEmails(
  booking: any,
  opts: { scheduledDate: Date; scheduledTime: string; actor: 'client' | 'creator' }
) {
  try {
    const { buyerUser, creatorUser, creatorProfile, sessionType } =
      await loadEmailParticipants(booking);
    const baseUrl = process.env.NEXTAUTH_URL || '';
    const dateLabel = new Date(opts.scheduledDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const sessionTitle = sessionType?.title || 'Your booked session';
    const creatorName = creatorProfile?.displayName || creatorUser?.name || 'Creator';
    const buyerName = buyerUser?.name || booking.guestDetails?.fullName || 'Client';
    const sharedDetails = {
      sessionTitle,
      sessionImage: creatorProfile?.profilePhoto || `${baseUrl}/assets/booking-confirm-sm.webp`,
      creatorName,
      creatorAvatar: creatorProfile?.profilePhoto || creatorUser?.profilePhoto || `${baseUrl}/avatar.png`,
      buyerName,
      buyerAvatar: buyerUser?.profilePhoto || `${baseUrl}/avatar.png`,
      date: dateLabel,
      time: opts.scheduledTime,
      totalPrice: Number(booking.updated_total_amount ?? booking.finalPrice ?? 0),
    };

    const userEmail = (buyerUser?.email || booking.guestDetails?.email || '').toLowerCase().trim();
    const actorForUser = opts.actor === 'client' ? 'you' : creatorName;
    const actorForCreator = opts.actor === 'client' ? buyerName : 'you';

    const tasks: Promise<unknown>[] = [];
    if (userEmail) {
      tasks.push(
        sendEmail(
          userEmail,
          `Session Rescheduled: ${sessionTitle} on ${dateLabel}`,
          generateSessionRescheduledEmail({
            ...sharedDetails,
            actorLabel: actorForUser,
            recipientRole: 'user',
          })
        )
      );
    }
    if (creatorUser?.email) {
      tasks.push(
        sendEmail(
          creatorUser.email,
          `Booking Rescheduled to ${dateLabel} at ${opts.scheduledTime}`,
          generateSessionRescheduledEmail({
            ...sharedDetails,
            actorLabel: actorForCreator,
            recipientRole: 'creator',
          })
        )
      );
    }
    await Promise.allSettled(tasks);
  } catch (err) {
    console.error('Error sending reschedule emails:', err);
  }
}

/**
 * Sends cancellation confirmation & refund status emails to client and creator.
 */
export async function sendBookingCancelledEmails(
  booking: any,
  opts: { refunded: boolean; refundAmount: number; actor: 'client' | 'creator' }
) {
  try {
    const { buyerUser, creatorUser, creatorProfile, sessionType } =
      await loadEmailParticipants(booking);
    const baseUrl = process.env.NEXTAUTH_URL || '';
    const dateLabel = new Date(booking.scheduledDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const sessionTitle = sessionType?.title || 'Your booked session';
    const creatorName = creatorProfile?.displayName || creatorUser?.name || 'Creator';
    const buyerName = buyerUser?.name || booking.guestDetails?.fullName || 'Client';
    const sharedDetails = {
      sessionTitle,
      sessionImage: creatorProfile?.profilePhoto || `${baseUrl}/assets/booking-confirm-sm.webp`,
      creatorName,
      creatorAvatar: creatorProfile?.profilePhoto || creatorUser?.profilePhoto || `${baseUrl}/avatar.png`,
      buyerName,
      buyerAvatar: buyerUser?.profilePhoto || `${baseUrl}/avatar.png`,
      date: dateLabel,
      time: booking.scheduledTime,
      totalPrice: Number(booking.updated_total_amount ?? booking.finalPrice ?? 0),
    };

    const userEmail = (buyerUser?.email || booking.guestDetails?.email || '').toLowerCase().trim();
    const refundNote = opts.refunded && opts.refundAmount > 0
      ? `A refund of PKR ${opts.refundAmount.toLocaleString()} has been processed for this booking.`
      : 'No refund action was required for this free/unpaid booking.';
    const actorLabel = opts.actor === 'client' ? `cancelled by ${buyerName}` : `cancelled by ${creatorName}`;

    const tasks: Promise<unknown>[] = [];
    if (userEmail) {
      tasks.push(
        sendEmail(
          userEmail,
          `Booking Cancelled: ${sessionTitle} (${dateLabel})`,
          generateSessionCancelledEmail({
            ...sharedDetails,
            actorLabel: opts.actor === 'client' ? 'cancelled by you' : `cancelled by ${creatorName}`,
            recipientRole: 'user',
            refundNote,
          })
        )
      );
    }
    if (creatorUser?.email) {
      tasks.push(
        sendEmail(
          creatorUser.email,
          `Booking Cancelled by ${opts.actor === 'client' ? buyerName : 'You'} (${dateLabel})`,
          generateSessionCancelledEmail({
            ...sharedDetails,
            actorLabel,
            recipientRole: 'creator',
            refundNote: opts.refunded && opts.refundAmount > 0
              ? `Client payment of PKR ${opts.refundAmount.toLocaleString()} has been refunded.`
              : 'The slot is now open again.',
          })
        )
      );
    }
    await Promise.allSettled(tasks);
  } catch (err) {
    console.error('Error sending cancellation emails:', err);
  }
}
