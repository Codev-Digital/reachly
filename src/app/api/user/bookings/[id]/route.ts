import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Referral from "@/models/referral.model";
import { checkSessionModificationWindow, checkNewSessionTime, parseDateToNoonUTC } from "@/lib/time";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const email = session.user.email?.toLowerCase().trim();
    let user = null;

    if (email) {
      user = await User.findOne({ email });
    }

    if (!user && (session.user as any).id) {
      user = await User.findById((session.user as any).id).exec();
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status, selectedDate, selectedTime } = body;

    if (status && !["confirmed", "cancelled", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    let booking = null;
    if (mongoose.isValidObjectId(id)) {
      booking = await Booking.findById(id).exec();
    }

    if (!booking) {
      booking = await Booking.findOne({ bookingRef: id }).exec();
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Ensure the booking belongs to this user or creator
    const isHost = booking.creatorId?.toString() === user._id.toString();
    const isClient = booking.userId?.toString() === user._id.toString();
    const isGuest = Boolean(booking.guestDetails?.email && booking.guestDetails.email.toLowerCase().trim() === email);
    if (!isHost && !isClient && !isGuest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Reachly runs on Pakistan time only (the browser / creator timezone is ignored)
    const timeZone = 'Asia/Karachi';

    const isCancelling = status === "cancelled";
    const isRescheduling = Boolean(selectedDate || selectedTime);

    // Package sessions are final for the user: no cancelling, no rescheduling
    // (the creator can reschedule after agreeing a new time in chat).
    if ((booking as any).packagePurchaseId && (isCancelling || isRescheduling)) {
      return NextResponse.json(
        { error: "Package sessions can't be cancelled or rescheduled. Please contact your creator." },
        { status: 403 },
      );
    }

    // 1. Cancellation checks (must be at least 24 hours before session start time)
    if (isCancelling) {
      if (booking.status === "pending" || booking.paymentStatus === "pending") {
        return NextResponse.json({ error: "Booking is awaiting admin verification and cannot be cancelled yet." }, { status: 400 });
      }
      if (booking.status === "cancelled") {
        return NextResponse.json({ error: "Booking is already cancelled." }, { status: 400 });
      }
      if (booking.status === "completed") {
        return NextResponse.json({ error: "Completed bookings cannot be cancelled." }, { status: 400 });
      }

      const cancelCheck = checkSessionModificationWindow(
        booking.scheduledDate,
        booking.scheduledTime,
        timeZone,
        "cancel"
      );
      if (!cancelCheck.allowed) {
        return NextResponse.json({ error: cancelCheck.errorMessage }, { status: 400 });
      }
    }

    // 2. Rescheduling checks (must be at least 24 hours before session start time)
    if (isRescheduling) {
      if (booking.status === "pending" || booking.paymentStatus === "pending") {
        return NextResponse.json({ error: "Booking is awaiting admin verification and cannot be rescheduled yet." }, { status: 400 });
      }
      if (booking.status === "cancelled") {
        return NextResponse.json({ error: "Cancelled bookings cannot be rescheduled." }, { status: 400 });
      }
      if (booking.status === "completed") {
        return NextResponse.json({ error: "Completed bookings cannot be rescheduled." }, { status: 400 });
      }

      const rescheduleCheck = checkSessionModificationWindow(
        booking.scheduledDate,
        booking.scheduledTime,
        timeZone,
        "reschedule"
      );
      if (!rescheduleCheck.allowed) {
        return NextResponse.json({ error: rescheduleCheck.errorMessage }, { status: 400 });
      }

      // Ensure the new scheduled slot is strictly in the future
      const targetDate = selectedDate || booking.scheduledDate;
      const targetTime = selectedTime || booking.scheduledTime;
      const newSlotCheck = checkNewSessionTime(targetDate, targetTime, timeZone);
      if (!newSlotCheck.allowed) {
        return NextResponse.json({ error: newSlotCheck.errorMessage }, { status: 400 });
      }
    }

    const updatePayload: any = {};
    console.log("PUT : Start here ");
    if (status) {
      console.log("PUT : Start status if ");
      console.log("Status:",status)
      console.log("booking.paymentStatus:",booking.paymentStatus)
      updatePayload.status = status;
      if (status === "cancelled") {
        if (booking.paymentStatus === "paid") {
          //first of all check if user has referral so deduct commison of that user
          //fetch from referral model
          const referralDoc = await Referral.findOne({
            joinnee: user._id,
          }).exec();
          if (referralDoc) {
            const referrerId = referralDoc.referrer;
            const referrerUser = await User.findById(referrerId).exec();
            referralDoc.buyActivities.map(async (activity: any) => {
              if (activity.type === "buy_session") {
                const ammount = activity.totalAmount;
                if (referrerUser) {
                  referrerUser.totalAmountEarnedFromReferrals =
                    (referrerUser.totalAmountEarnedFromReferrals || 0) - ammount;
                  await referrerUser.save();
                }
                referralDoc.totalBuyActivities += 1;
                referralDoc.buyActivities.push({
                  type: "cancel_session",
                  activityTime: new Date(),
                  totalAmount: ammount,
                  status: "rejected",
                });
                await referralDoc.save();
              }
            });
          }
          updatePayload.paymentStatus = "refunded";
        } else {
          updatePayload.paymentStatus = "failed";
        }
      }
    }
    if (selectedDate) {
      updatePayload.scheduledDate = parseDateToNoonUTC(selectedDate, timeZone);
      updatePayload.isRescheduled = true;
      updatePayload.meetingStartedAt = null;
      updatePayload.meetingEndsAt = null;
      updatePayload.meetingEndedAt = null;
    }
    if (selectedTime) {
      updatePayload.scheduledTime = selectedTime;
      updatePayload.isRescheduled = true;
      updatePayload.meetingStartedAt = null;
      updatePayload.meetingEndsAt = null;
      updatePayload.meetingEndedAt = null;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking._id,
      { $set: updatePayload },
      { new: true },
    ).exec();

    // Notify the creator that the user updated/cancelled/rescheduled
    try {
      const Notification = (await import("@/models/Notification")).default;
      const clientName =
        user.name || booking.guestDetails?.fullName || "A user";

      if (selectedDate || selectedTime) {
        const targetDateObj = updatePayload.scheduledDate || booking.scheduledDate;
        const formattedDate = new Date(targetDateObj).toLocaleDateString("en-US", {
          timeZone,
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        const newTime = selectedTime || booking.scheduledTime;

        await new Notification({
          userId: booking.creatorId,
          title: "Session Rescheduled by Client",
          message: `${clientName} has rescheduled their session to ${formattedDate} at ${newTime}.`,
          type: "reschedule",
          read: false,
          time: "Just now",
        }).save();
      }

      if (status === "cancelled") {
        await new Notification({
          userId: booking.creatorId,
          title: "Session Cancelled by Client",
          message: `${clientName} has cancelled their session.`,
          type: "cancellation",
          read: false,
          time: "Just now",
        }).save();
      }
    } catch (notifErr) {
      console.error("Error creating notification for creator:", notifErr);
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking || booking,
    });
  } catch (error: any) {
    console.error("PUT /api/user/bookings/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
