import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateOTP, sendEmail, generateOTPEmail } from "@/lib/utils";
import Referral from "@/models/referral.model";
import mongoose from 'mongoose';
import { isValidEmail } from "@/lib/validators";
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email, ref } = await request.json();

    // Each error carries a `field` so the UI can show it under the right input.
    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "Please enter your full name.", field: "name" },
        { status: 400 },
      );
    }

    if (!email || !String(email).trim()) {
      return NextResponse.json(
        { error: "Please enter your email address.", field: "email" },
        { status: 400 },
      );
    }

    if (!isValidEmail(String(email))) {
      return NextResponse.json(
        { error: "Please enter a valid email address.", field: "email" },
        { status: 400 },
      );
    }
    //decrypt the referral code if it exists
    let referrer = ""
    if (ref) {
       referrer = atob(ref);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser?.approvalStatus === "deleted") {
      return NextResponse.json(
        {
          error: "This account was deleted. Please contact support.",
          field: "email",
        },
        { status: 400 },
      );
    }

    if (existingUser) {
      // If registration is fully complete, reject
      if (existingUser.isRegistrationComplete) {
        return NextResponse.json(
          {
            error:
              "An account with this email already exists. Please log in instead.",
            field: "email",
          },
          { status: 400 },
        );
      }
      // If the user started but never finished, resend OTP so they can continue
      const otp = generateOTP();
      existingUser.otp = otp;
      existingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await existingUser.save();

      await sendEmail(
        normalizedEmail,
        "Verify your Reachly account",
        generateOTPEmail(existingUser.name, otp, "Verify your email"),
      );

      return NextResponse.json({
        success: true,
        message: "OTP resent to your email",
        userId: existingUser._id,
      });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    let user: any;
    if (referrer) {
      user = await User.create({
        name,
        email: normalizedEmail,
        otp,
        otpExpires,
        isVerified: false,
        isRegistrationComplete: false,
        onboardingStep: 0,
        whoReferred:  new mongoose.Types.ObjectId(referrer),
        isReferred: true,
      });
      console.log("Create user with referral");
      // create referral record in referral collection
      const referralRecord = await Referral.create({
        referrer: new mongoose.Types.ObjectId(referrer),
        joinnee: user._id,
        totalBuyActivities: 1,
        buyActivities: [
          {
            type: "newly_joinned",
            activityTime: new Date(),
            totalAmount: 0,
          },
        ],
      });
      console.log("Referral record created:", referralRecord);
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        otp,
        otpExpires,
        isVerified: false,
        isRegistrationComplete: false,
        onboardingStep: 0,
        isReferred: false,
      });
      console.log("Create user without referral");
    }

    await sendEmail(
      normalizedEmail,
      "Verify your Reachly account",
      generateOTPEmail(name, otp, "Welcome to Reachly!"),
    );

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
      userId: user._id,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
