import type Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import Event from '@/models/Event';
import EventPurchase from '@/models/EventPurchase';
import PackagePurchase from '@/models/PackagePurchase';
import { generateBookingConfirmationEmail, sendEmail } from '@/lib/utils';
import { richTextToPlain } from '@/lib/richText';

export async function finalizeStripeCheckout(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return { paid: false };
  if (session.currency?.toLowerCase() !== 'pkr') {
    throw new Error('Stripe checkout did not complete in PKR.');
  }

  await connectDB();
  const { kind } = session.metadata || {};

  if (kind === 'booking') {
    const bookingRef = session.metadata?.bookingRef;
    if (!bookingRef) throw new Error('Stripe booking session is missing its booking reference.');

    const pendingBooking = await Booking.findOne({ bookingRef, paymentMethod: 'stripe' });
    if (!pendingBooking) throw new Error('Stripe booking was not found.');
    const packagePurchase = pendingBooking.packagePurchaseId
      ? await PackagePurchase.findById(pendingBooking.packagePurchaseId).lean()
      : null;
    const expectedAmount = pendingBooking.packagePurchaseId && pendingBooking.sessionNumber === 1
      ? Number(packagePurchase?.price)
      : Number(pendingBooking.finalPrice);
    if (!Number.isFinite(expectedAmount) || session.amount_total !== Math.round(expectedAmount * 100)) {
      throw new Error('Stripe booking amount does not match the booking price in PKR.');
    }

    let booking = pendingBooking;
    let newlyPaid = false;
    if (pendingBooking.paymentStatus !== 'paid') {
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: pendingBooking._id, status: { $ne: 'cancelled' }, paymentStatus: { $ne: 'paid' } },
        { $set: { paymentStatus: 'paid', status: 'confirmed' } },
        { new: true }
      );
      if (updatedBooking) {
        booking = updatedBooking;
        newlyPaid = true;
      } else {
        const currentBooking = await Booking.findOne({ _id: pendingBooking._id });
        if (currentBooking) booking = currentBooking;
      }
    }
    if (!booking || booking.paymentStatus !== 'paid') return { paid: false };

    if (newlyPaid) {
      const [creator, sessionType] = await Promise.all([
        CreatorProfile.findOne({ userId: booking.creatorId }).lean(),
        SessionType.findById(booking.sessionTypeId).lean(),
      ]);

      if (creator && sessionType && booking.guestDetails) {
        const date = new Date(booking.scheduledDate).toLocaleDateString('en-US', {
          timeZone: 'UTC',
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        const emailHtml = generateBookingConfirmationEmail({
          bookingRef: booking.bookingRef,
          creatorName: creator.displayName,
          creatorUsername: creator.username,
          creatorProfilePhoto: creator.profilePhoto || '',
          sessionTitle: sessionType.title,
          sessionDuration: `${sessionType.duration} min`,
          date,
          time: booking.scheduledTime,
          userName: booking.guestDetails.fullName,
          userEmail: booking.guestDetails.email,
          whatsapp: booking.guestDetails.whatsapp,
          whatToDiscuss: richTextToPlain(booking.guestDetails.whatToDiscuss || ''),
          meetLink: booking.meetingUrl || '',
        });
        try {
          await sendEmail(
            booking.guestDetails.email,
            `Your Booking with ${creator.displayName} is Confirmed!`,
            emailHtml
          );
        } catch (error) {
          console.error('[Stripe checkout] booking confirmation email:', error);
        }
      }

      try {
        const Notification = (await import('@/models/Notification')).default;
        await Notification.create({
          userId: booking.creatorId,
          title: 'New Session Booked',
          message: `${booking.guestDetails?.fullName || 'A customer'} paid for a session on ${booking.scheduledDate.toLocaleDateString('en-US', { timeZone: 'UTC' })} at ${booking.scheduledTime}.`,
          type: 'booking',
          read: false,
          time: 'Just now',
        });
      } catch (error) {
        console.error('[Stripe checkout] booking notification:', error);
      }
    }

    return { paid: true, kind, bookingRef };
  }

  if (kind === 'event') {
    const purchaseId = session.metadata?.purchaseId;
    if (!purchaseId) throw new Error('Stripe event session is missing its purchase reference.');
    const pendingPurchase = await EventPurchase.findById(purchaseId);
    if (!pendingPurchase) throw new Error('Stripe event purchase was not found.');
    const expectedAmount = Number(pendingPurchase.tierPrice) * Number(pendingPurchase.quantity);
    if (session.amount_total !== Math.round(expectedAmount * 100)) {
      throw new Error('Stripe event amount does not match the ticket price in PKR.');
    }

    let purchase = pendingPurchase;
    let newlyPaid = false;
    if (pendingPurchase.paymentStatus !== 'paid') {
      const updatedPurchase = await EventPurchase.findOneAndUpdate(
        { _id: purchaseId, paymentStatus: 'pending', status: 'pending' },
        { $set: { paymentStatus: 'paid', status: 'confirmed' } },
        { new: true }
      );
      if (updatedPurchase) {
        purchase = updatedPurchase;
        newlyPaid = true;
      } else {
        const currentPurchase = await EventPurchase.findById(purchaseId);
        if (currentPurchase) purchase = currentPurchase;
      }
    }
    if (
      !purchase ||
      purchase.paymentStatus !== 'paid' ||
      (purchase.status !== 'confirmed' && purchase.status !== 'completed')
    ) {
      return { paid: false };
    }
    if (newlyPaid) {
      try {
        const { addBuyerToEventBroadcast } = await import('@/lib/eventBroadcastChat');
        await addBuyerToEventBroadcast(purchase.eventId, String(purchase.userId));
      } catch (error) {
        console.error('[Stripe checkout] event broadcast membership:', error);
      }
    }
    return { paid: true, kind, purchaseId };
  }

  throw new Error('Stripe checkout session has an unsupported purchase type.');
}

export async function expireStripeCheckout(session: Stripe.Checkout.Session) {
  await connectDB();
  const { kind } = session.metadata || {};

  if (kind === 'booking') {
    const bookingRef = session.metadata?.bookingRef;
    if (bookingRef) {
      const booking = await Booking.findOneAndUpdate(
        { bookingRef, paymentMethod: 'stripe', paymentStatus: 'pending' },
        { $set: { status: 'cancelled', paymentStatus: 'failed' } },
        { new: true }
      );
      if (booking?.packagePurchaseId) {
        if (booking.sessionNumber === 1) {
          await (await import('@/models/PackagePurchase')).default.deleteOne({ _id: booking.packagePurchaseId });
        } else {
          await (await import('@/models/PackagePurchase')).default.updateOne(
            { _id: booking.packagePurchaseId },
            { $inc: { sessionsBooked: -1 } }
          );
        }
      }
    }
    return;
  }

  if (kind === 'event') {
    const purchaseId = session.metadata?.purchaseId;
    if (!purchaseId) return;
    const purchase = await EventPurchase.findOneAndUpdate(
      { _id: purchaseId, paymentStatus: 'pending', status: 'pending' },
      { $set: { status: 'cancelled', paymentStatus: 'failed' } },
      { new: true }
    );
    if (!purchase) return;

    const event = await Event.findById(purchase.eventId);
    const day = event?.dates.find((item) => item.date === purchase.eventDate);
    const tier = day?.tiers.find((item) => item.title === purchase.tierTitle);
    if (tier) {
      tier.quantity += purchase.quantity;
      event!.markModified('dates');
      await event!.save();
    }
  }
}
