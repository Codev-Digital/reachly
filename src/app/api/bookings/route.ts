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
import PackagePurchase from "@/models/PackagePurchase";
import CalendarBlock from "@/models/CalendarBlock";
import { autoSettleEarnings } from "@/lib/autoSettleEarnings";
import {
  DEFAULT_SLOT_MINUTES,
  blockedInterval,
  intervalsOverlap,
  parse12h,
} from "@/lib/slots";
import { sanitizeRichText } from "@/lib/sanitizeRichText";
import { richTextToPlain, WHAT_TO_DISCUSS_MAX_LENGTH, richTextLength } from "@/lib/richText";
import { getStripeClient } from "@/lib/stripe";

// Helper to generate booking reference
function generateBookingRef(): string {
  return "RCH-" + Math.random().toString(36).toUpperCase().slice(2, 10);
}

// Helper to format date like "Mon, Jan 1"
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC", // the booking date is a plain calendar day; don't let the server's timezone shift it
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
    let {
      username,
      sessionId,
      date,
      time,
      userDetails,
      proceedAs,
      paymentMethod,
      promoApplied,
      finalPrice: clientFinalPrice,
      originalPrice: clientOriginalPrice,
      answers,
    } = payload;
    let finalPrice = clientFinalPrice;
    let originalPrice = clientOriginalPrice;

    // "Book next session" on a package: everything except the date and time is taken
    // from the user's previous session, so nothing else is asked.
    if (payload.packagePurchaseId) {
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Please log in to book your next session." }, { status: 401 });
      }
      const buyer = await User.findOne({ email: session.user.email }).select("_id").lean() as any;
      const purchase =
        buyer && mongoose.isValidObjectId(payload.packagePurchaseId)
          ? ((await PackagePurchase.findOne({ _id: payload.packagePurchaseId, userId: buyer._id }).lean()) as any)
          : null;
      if (!purchase) {
        return NextResponse.json({ error: "Package not found." }, { status: 404 });
      }
      const previous = (await Booking.findOne({ packagePurchaseId: purchase._id })
        .sort({ sessionNumber: -1 })
        .lean()) as any;
      if (!previous?.guestDetails) {
        return NextResponse.json({ error: "Could not find your previous session details." }, { status: 400 });
      }
      sessionId = String(purchase.sessionTypeId);
      userDetails = { ...previous.guestDetails };
      answers = previous.answers;
      paymentMethod = previous.paymentMethod;
      proceedAs = "login";
    }

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

    // 1. Find the creator and session type concurrently
    const [creatorProfile, sessionType] = await Promise.all([
      CreatorProfile.findOne({ username }).lean(),
      SessionType.findById(sessionId).lean()
    ]);

    if (!creatorProfile)
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    if (!sessionType)
      return NextResponse.json(
        { error: "Session type not found" },
        { status: 404 },
      );

    if ((creatorProfile as any).isDeactivated) {
      return NextResponse.json(
        { error: "This creator is currently not accepting bookings." },
        { status: 400 },
      );
    }

    if ((sessionType as any).isActive === false) {
      return NextResponse.json(
        { error: "This session is no longer active." },
        { status: 400 },
      );
    }

    // Enforce minimum notice (days ahead clients must book)
    {
      const { pktAddDaysISO, pktTodayISO } = await import('@/lib/pkt');
      const notice = Math.max(0, Math.min(90, Number((sessionType as any).minAdvanceDays) || 0));
      const earliest = pktAddDaysISO(notice, pktTodayISO());
      if (typeof date === 'string' && date < earliest) {
        return NextResponse.json(
          {
            error: notice
              ? `This session requires at least ${notice} day${notice === 1 ? '' : 's'} notice. Earliest bookable day is ${earliest}.`
              : 'This date is no longer available.',
          },
          { status: 400 },
        );
      }
    }

    // Price comes from the session itself (never from the client): the discounted price when set
    const listPrice = Number((sessionType as any).price);
    const discounted = Number((sessionType as any).discountedPrice);
    const unitPrice = discounted > 0 && discounted < listPrice ? discounted : listPrice;
    originalPrice = listPrice;
    finalPrice = unitPrice;

    // 2. Identify the user
    let userToAttachId = null;
    let u;
    if (session?.user?.email) {
      u = await User.findOne({ email: session.user.email });
      if (u) userToAttachId = u._id;
    }
    // ── Package handling ──────────────────────────────────────────────────────
    // A package is bought once (the first booking creates the purchase); every later
    // session is booked against it, one at a time, only after the previous one is completed.
    const isPackage = !!(sessionType as any).isPackage;
    let packagePurchase: any = null;
    let packageNumber = 0;
    let packageTotal = 0;
    let packageSessions = 0;
    if (isPackage) {
      if (!userToAttachId) {
        return NextResponse.json(
          { error: "Please log in or sign up to buy a package." },
          { status: 401 },
        );
      }
      packageSessions = Number((sessionType as any).packageSessions) || 0;
      packageTotal = unitPrice; // the discounted package price when the creator set one
      if (packageSessions < 2 || !(packageTotal > 0)) {
        return NextResponse.json({ error: "This package is not set up correctly." }, { status: 400 });
      }

      await autoSettleEarnings(); // marks sessions whose time has passed as completed
      packagePurchase = await PackagePurchase.findOne({
        userId: userToAttachId,
        sessionTypeId: sessionId,
        status: "active",
      });

      if (packagePurchase) {
        if (packagePurchase.sessionsBooked >= packagePurchase.sessionsTotal) {
          return NextResponse.json({ error: "All sessions in this package are already booked." }, { status: 400 });
        }
        const notDone = await Booking.countDocuments({
          packagePurchaseId: packagePurchase._id,
          status: { $ne: "completed" },
        });
        if (notDone > 0) {
          return NextResponse.json(
            { error: "Complete your current session before booking the next one." },
            { status: 400 },
          );
        }
        packageNumber = packagePurchase.sessionsBooked + 1;
      } else {
        packageNumber = 1;
      }

      // Each session carries an equal share of the package price; the last one takes the remainder.
      const shareOf = (total: number) => {
        const share = Math.round(total / packageSessions);
        return packageNumber === packageSessions ? total - share * (packageSessions - 1) : share;
      };
      originalPrice = shareOf(listPrice);
      finalPrice = shareOf(packageTotal);
    }

    // check if the user  is refered person
    if (u?.isReferred && paymentMethod !== "stripe" && (!isPackage || packageNumber === 1)) {
      //now check who referred this user
      const referrerID = u.whoReferred;
      const [referralDoc, referrerUser] = await Promise.all([
        Referral.findOne({
          referrer: referrerID,
          joinnee: u._id,
        }),
        User.findById(referrerID)
      ]);
      //now check in buyActivities if this is first purchase or not
      console.log("Referral User:", referrerUser);
      console.log("Referral Document:", referralDoc);
      let referralReward = "";
      if (referralDoc && referralDoc.totalBuyActivities === 1) {
        //so if there 1 mean they not buy anything yet so we can add the amount to referrer
        //calculate referral reward
        referralReward = (0.05 * (isPackage ? packageTotal : finalPrice)).toFixed(2); // 5% of the final (or whole package) price
        //update the referrer user totalAmountEarnedFromReferrals
        referrerUser!.totalAmountEarnedFromReferrals =
          (Number(referrerUser!.totalAmountEarnedFromReferrals) || 0) + Number(referralReward);
        console.log("Save after updating referral reward:", referrerUser);
        await Promise.all([
          referrerUser!.save(),
          Referral.updateOne(
            { _id: referralDoc._id },
            {
              $inc: { totalBuyActivities: 1 },
              $push: {
                buyActivities: {
                  type: "buy_session",
                  activityTime: new Date(),
                  totalAmount: Number(referralReward),
                  status: "completed",
                  sessionId: new mongoose.Types.ObjectId(sessionId),
                }
              }
            }
          )
        ]);
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

    // Make sure the chosen time doesn't run into another booking (each blocks duration + buffer)
    const requestedStart = parse12h(time);
    if (requestedStart !== null) {
      const dayBookings = await Booking.find({
        creatorId: creatorProfile.userId,
        scheduledDate: scheduledDateUTC,
        status: { $in: ["pending", "confirmed"] },
      })
        .select("scheduledTime sessionTypeId")
        .lean();

      const otherSessionIds = [...new Set(dayBookings.map((b: any) => String(b.sessionTypeId)))];
      const otherSessions = otherSessionIds.length
        ? await SessionType.find({ _id: { $in: otherSessionIds } }).select("duration bufferTime").lean()
        : [];
      const otherById = new Map<string, any>(otherSessions.map((s: any) => [String(s._id), s]));

      const myBlock = blockedInterval(
        requestedStart,
        Number((sessionType as any).duration) || DEFAULT_SLOT_MINUTES,
        Number((sessionType as any).bufferTime) || 0,
      );
      const clashes = dayBookings.some((b: any) => {
        const start = parse12h(b.scheduledTime);
        if (start === null) return false;
        const other = otherById.get(String(b.sessionTypeId));
        return intervalsOverlap(
          myBlock,
          blockedInterval(
            start,
            Number(other?.duration) || DEFAULT_SLOT_MINUTES,
            Number(other?.bufferTime) || 0,
          ),
        );
      });
      const outside = await CalendarBlock.find({
        creatorId: creatorProfile.userId,
        scheduledDate: scheduledDateUTC,
      })
        .select("startTime durationMinutes")
        .lean();
      const clashesOutside = outside.some((ob: any) => {
        const start = parse12h(ob.startTime);
        return start !== null && intervalsOverlap(myBlock, { start, end: start + ob.durationMinutes });
      });
      if (clashes || clashesOutside) {
        return NextResponse.json(
          { error: "This time slot is no longer available. Please choose another time." },
          { status: 409 },
        );
      }
    }

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

    if (isPackage && !packagePurchase) {
      packagePurchase = await PackagePurchase.create({
        userId: userToAttachId as any,
        creatorId: creatorProfile.userId,
        sessionTypeId: sessionId,
        title: (sessionType as any).title,
        sessionsTotal: packageSessions,
        sessionsBooked: 0,
        price: packageTotal,
      });
    }

    const whatToDiscussClean = sanitizeRichText(userDetails.whatToDiscuss || "");
    if (richTextLength(whatToDiscussClean) > WHAT_TO_DISCUSS_MAX_LENGTH) {
      return NextResponse.json(
        {
          error: `Discussion notes must be ${WHAT_TO_DISCUSS_MAX_LENGTH} characters or fewer.`,
        },
        { status: 400 },
      );
    }

    const checkoutTotal = isPackage ? (packageNumber === 1 ? packageTotal : 0) : finalPrice;
    const requiresStripePayment = paymentMethod === "stripe" && checkoutTotal > 0;
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
        whatToDiscuss: whatToDiscussClean,
      },
      answers: Array.isArray(answers) ? answers : [],
      scheduledDate: scheduledDateUTC,
      scheduledTime: time,
      status: requiresStripePayment ? "pending" : "confirmed",
      paymentStatus: "pending", // Will auto-settle to paid when session time passes
      paymentMethod: paymentMethod || "jazzcash",
      price: originalPrice,
      promoApplied,
      discountAmount: originalPrice - finalPrice,
      finalPrice: finalPrice,
      meetingUrl,
      meetingRoomName,
      ...(isPackage ? { packagePurchaseId: packagePurchase._id, sessionNumber: packageNumber } : {}),
    });

    await booking.save();
    if (isPackage) {
      await PackagePurchase.updateOne({ _id: packagePurchase._id }, { $inc: { sessionsBooked: 1 } });
    }

    let checkoutUrl: string | undefined;
    if (requiresStripePayment) {
      try {
        const checkout = await getStripeClient().checkout.sessions.create({
          mode: "payment",
          adaptive_pricing: { enabled: false },
          allowed_payment_method_types: ["card"],
          customer_email: userDetails.email.toLowerCase(),
          client_reference_id: bookingRef,
          metadata: { kind: "booking", bookingRef },
          line_items: [{
            quantity: 1,
            price_data: {
              currency: "pkr",
              unit_amount: Math.round(checkoutTotal * 100),
              product_data: { name: isPackage ? `${sessionType.title} package` : sessionType.title },
            },
          }],
          success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${request.nextUrl.origin}/checkout/cancelled`,
          expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        });
        if (!checkout.url) throw new Error("Stripe did not return a checkout URL.");
        checkoutUrl = checkout.url;
      } catch (error) {
        await Booking.deleteOne({ _id: booking._id });
        if (isPackage) {
          if (packageNumber === 1) await PackagePurchase.deleteOne({ _id: packagePurchase._id });
          else await PackagePurchase.updateOne({ _id: packagePurchase._id }, { $inc: { sessionsBooked: -1 } });
        }
        throw error;
      }
    }

    // Perform conversation check, notification, and email asynchronously without blocking HTTP response
    if (!requiresStripePayment) (async () => {
      try {
        if (userToAttachId) {
          try {
            const Conversation = (await import("@/models/Conversation")).default;
            const existingConv = await Conversation.findOne({
              creatorId: creatorProfile.userId,
              userId: userToAttachId,
            }).lean();
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

        // Notification for creator
        try {
          const Notification = (await import("@/models/Notification")).default;
          await new Notification({
            userId: creatorProfile.userId,
            title: isPackage ? "New Package Session Booked" : "New Session Booked",
            message: `${userDetails.fullName} booked ${isPackage ? `session ${packageNumber} of ${packageSessions} of the "${sessionType.title}" package` : `a "${sessionType.title}" session`} on ${formatDate(new Date(date))} at ${time}.`,
            type: "booking",
            read: false,
            time: "Just now",
          }).save();
        } catch (notifErr) {
          console.error("Error creating creator notification:", notifErr);
        }

        // Send confirmation email
        try {
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
            whatToDiscuss: richTextToPlain(whatToDiscussClean) || whatToDiscussClean,
            meetLink: meetingUrl,
          });

          await sendEmail(
            userDetails.email.toLowerCase(),
            `Your Booking with ${creatorProfile.displayName} is Confirmed!`,
            emailHtml,
          );
        } catch (emailErr) {
          console.error("Error sending booking email:", emailErr);
        }
      } catch (bgErr) {
        console.error("Background task error:", bgErr);
      }
    })();

    return NextResponse.json({
      success: true,
      bookingId: booking._id,
      bookingRef,
      ...(checkoutUrl ? { checkoutUrl } : {}),
      ...(isPackage ? { packageSession: packageNumber, packageSessions } : {}),
    });
  } catch (error: any) {
    console.error("Booking POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong while processing your booking" },
      { status: 500 },
    );
  }
}
