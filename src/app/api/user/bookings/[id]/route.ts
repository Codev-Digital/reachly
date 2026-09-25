import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Referral from "@/models/referral.model";

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

    const { status, selectedDate, selectedTime } = await request.json();

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

    // Ensure the booking belongs to this user
    if (
      booking.userId?.toString() !== user._id.toString() &&
      booking.guestDetails?.email?.toLowerCase().trim() !== email
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatePayload: any = {};
    console.log("PUT : Start here ");
    if (status) {
      console.log("PUT : Start status if ");
      console.log("Status:",status)
      console.log("booking.paymentStatus:",booking.paymentStatus)
      updatePayload.status = status;
      //pending
      //&& booking.paymentStatus === "paid"
      if (status === "cancelled") {
        console.log("PUT : Start second if ");
        //first of all check if user has referral so deduct commison of that user
        //fetch from referral model
        console.log("PUT : before referral doc find ");
        const referralDoc = await Referral.findOne({
          joinnee: user._id,
        //   buyActivities: { $elemMatch: { sessionId: booking.sessionTypeId } },
        }).exec();
        console.log("We get the referralDoc:", referralDoc);
        if (referralDoc) {
          console.log("PUT : Inside referral doc ");
          const referrerId = referralDoc.referrer;
          const referrerUser = await User.findById(referrerId).exec();
          console.log("We get the referrerUser:", referrerUser);
          //first all go to buy activities and extract totalAmount
          referralDoc.buyActivities.map(async (activity: any) => {
            //first find buy_activity
            if (activity.type === "buy_session") {
              const ammount = activity.totalAmount;
              //we got ammout so just now deduct that ammount from referrer User
              if (referrerUser) {
                referrerUser!.totalAmountEarnedFromReferrals =
                  (referrerUser!.totalAmountEarnedFromReferrals || 0) - ammount;
                await referrerUser.save();
              }
              //after deducting from referrer account update 1 more thing in BuyActivity
              referralDoc.totalBuyActivities += 1;
              referralDoc.buyActivities.push({
                type: "cancel_session",
                activityTime: new Date(),
                totalAmount: ammount,
                status: "rejected",
              });
              await referralDoc.save();
            }
            //TODO : send notification to referrer about the deduction
          });
        } else {
          console.log("Else block running");
        }
        console.log("Before update payment status");

        updatePayload.paymentStatus = "refunded";
      }
    }
    if (selectedDate) {
      updatePayload.scheduledDate = new Date(selectedDate);
      updatePayload.isRescheduled = true;
    }
    if (selectedTime) {
      updatePayload.scheduledTime = selectedTime;
      updatePayload.isRescheduled = true;
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
        const formattedDate = new Date(
          selectedDate || booking.scheduledDate,
        ).toLocaleDateString("en-US", {
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
