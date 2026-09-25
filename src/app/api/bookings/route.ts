import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import CreatorProfile from "@/models/CreatorProfile";
import SessionType from "@/models/SessionType";
import { sendEmail, generateBookingConfirmationEmail } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createMeetingRoom } from "@/lib/daily";
import Referral from "@/models/referral.model";
import mongoose from "mongoose";

// Helper to generate booking reference
function generateBookingRef(): string {
  return "RCH-" + Math.random().toString(36).toUpperCase().slice(2, 10);
}

// Helper to format date like "Mon, Jan 1"
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Attempt to get the logged-in user
    const session = await getServerSession(authOptions);
    let loggedInUserId: string | undefined;

    const payload = await request.json();
    const {
      username,
      sessionId,
      date,
      time,
      userDetails,
      proceedAs,
      paymentMethod,
      promoApplied,
      finalPrice,
      originalPrice,
    } = payload;

    if (!username || !sessionId || !date || !time) {
      return NextResponse.json(
        { error: "Missing required booking details" },
        { status: 400 },
      );
    }

    if (
      !userDetails ||
      !userDetails.fullName ||
      !userDetails.email ||
      !userDetails.whatsapp
    ) {
      return NextResponse.json(
        { error: "Missing required user details (Name, Email, WhatsApp)" },
        { status: 400 },
      );
    }

    // 1. Find the creator and session type
    const creatorProfile = await CreatorProfile.findOne({ username });
    if (!creatorProfile)
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    const sessionType = await SessionType.findById(sessionId);
    if (!sessionType)
      return NextResponse.json(
        { error: "Session type not found" },
        { status: 404 },
      );

    // 2. Identify the user
    let userToAttachId = null;
    let u;
    if (session?.user?.email) {
      u = await User.findOne({ email: session.user.email });
      if (u) userToAttachId = u._id;
    }
    // check if the user  is refered person
    if (u?.isReferred) {
      //now check who referred this user
      const referrerID = u.whoReferred;
      //now check total number pruchase
      const referralDoc = await Referral.findOne({
        referrer: referrerID,
        joinnee: u._id,
      });
      //fetch referrer user
      const referrerUser = await User.findById(referrerID);
      //now check in buyActivities if this is first purchase or not
      console.log("Referral User:", referrerUser);
      console.log("Referral Document:", referralDoc);
      let referralReward = "";
      if (referralDoc.totalBuyActivities === 1) {
        //so if there 1 mean they not buy anything yet so we can add the amount to referrer
        //calculate referral reward
        referralReward = (0.05 * finalPrice).toFixed(2); // 5% of the final price
        //update the referrer user totalAmountEarnedFromReferrals
        referrerUser!.totalAmountEarnedFromReferrals =
          (Number(referrerUser!.totalAmountEarnedFromReferrals) || 0) + Number(referralReward);
        console.log("Save after updating referral reward:", referrerUser);
        await referrerUser!.save();
        //after save update referral doc buyActivities
        referralDoc.totalBuyActivities += 1;
        referralDoc.buyActivities.push({
          type: "buy_session",
          activityTime: new Date(),
          totalAmount: Number(referralReward),
          status: "completed",
          sessionId: new mongoose.Types.ObjectId(sessionId),
        });
        await referralDoc.save();
        //TODO : send notification to referrer about the reward
      } else {
       console.log("You have already received a referral reward for this user. No additional reward will be given.");
      }
    }
    if (!userToAttachId) {
      // Find based on email
      const u = await User.findOne({ email: userDetails.email.toLowerCase() });
      if (u) {
        userToAttachId = u._id;
      } else if (proceedAs === "signup" || proceedAs === "guest") {
        // Automatically create somewhat of an unverified user
        // But for simplicity in this booking flow, let's just keep userToAttachId null
        // and rely on guestDetails.
      }
    }

    // 3. Prevent creator from booking themselves
    if (
      userToAttachId &&
      userToAttachId.toString() === creatorProfile.userId.toString()
    ) {
      return NextResponse.json(
        { error: "Cannot book your own session" },
        { status: 400 },
      );
    }

    // Generate booking reference
    const bookingRef = generateBookingRef();

    // 4. Create the booking
    // Parse date parts manually and store at noon UTC to avoid timezone boundary issues
    const [dateYear, dateMonth, dateDay] = date.split("-").map(Number);
    const scheduledDateUTC = new Date(
      Date.UTC(dateYear, dateMonth - 1, dateDay, 12, 0, 0),
    );

    // Generate Daily.co meeting room
    let meetingUrl = "";
    let meetingRoomName = "";
    try {
      const meetingDetails = await createMeetingRoom(
        bookingRef,
        scheduledDateUTC,
        sessionType.duration,
      );
      meetingUrl = meetingDetails.url;
      meetingRoomName = meetingDetails.name;
    } catch (err) {
      console.error("Error generating meeting room:", err);
    }

    const booking = new Booking({
      bookingRef,
      creatorId: creatorProfile.userId,
      sessionTypeId: sessionId,
      userId: userToAttachId,
      guestDetails: {
        fullName: userDetails.fullName,
        email: userDetails.email.toLowerCase(),
        whatsapp: userDetails.whatsapp,
        notes: userDetails.notes || "",
        heardFrom: userDetails.heardFrom || "",
        whatToDiscuss: userDetails.whatToDiscuss || "",
      },
      scheduledDate: scheduledDateUTC,
      scheduledTime: time,
      status: "confirmed", // Auto-approved
      paymentStatus: "pending", // Will auto-settle to paid when session time passes
      paymentMethod: paymentMethod || "jazzcash",
      price: originalPrice,
      promoApplied,
      discountAmount: originalPrice - finalPrice,
      finalPrice: finalPrice,
      meetingUrl,
      meetingRoomName,
    });

    await booking.save();

    // Automatically create a conversation if the user is logged in
    if (userToAttachId) {
      try {
        const Conversation = (await import("@/models/Conversation")).default;
        const existingConv = await Conversation.findOne({
          creatorId: creatorProfile.userId,
          userId: userToAttachId,
        });
        if (!existingConv) {
          await Conversation.create({
            creatorId: creatorProfile.userId,
            userId: userToAttachId,
            isLocked: true,
          });
        }
      } catch (convErr) {
        console.error("Error creating conversation on booking:", convErr);
      }
    }

    // Create a real Notification for the creator
    try {
      const Notification = (await import("@/models/Notification")).default;
      await new Notification({
        userId: creatorProfile.userId,
        title: "New Session Booked",
        message: `${userDetails.fullName} booked a "${sessionType.title}" session on ${formatDate(new Date(date))} at ${time}.`,
        type: "booking",
        read: false,
        time: "Just now",
      }).save();
    } catch (notifErr) {
      console.error("Error creating creator notification:", notifErr);
    }

    // Send confirmation email
    const emailHtml = generateBookingConfirmationEmail({
      bookingRef,
      creatorName: creatorProfile.displayName,
      creatorUsername: creatorProfile.username,
      creatorProfilePhoto: creatorProfile.profilePhoto || "",
      sessionTitle: sessionType.title,
      sessionDuration: `${sessionType.duration} min`,
      date: formatDate(new Date(date)),
      time,
      userName: userDetails.fullName,
      userEmail: userDetails.email.toLowerCase(),
      whatsapp: userDetails.whatsapp,
      whatToDiscuss: userDetails.whatToDiscuss,
      meetLink: meetingUrl,
    });

    await sendEmail(
      userDetails.email.toLowerCase(),
      `Your Booking with ${creatorProfile.displayName} is Confirmed!`,
      emailHtml,
    );

    return NextResponse.json({
      success: true,
      bookingId: booking._id,
      bookingRef,
    });
  } catch (error: any) {
    console.error("Booking POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong while processing your booking" },
      { status: 500 },
    );
  }
}
