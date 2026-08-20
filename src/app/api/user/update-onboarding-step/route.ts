import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";
import Referral from "@/models/referral.model";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { step, ref } = body;

    if (typeof step !== "number") {
      return NextResponse.json(
        { error: "Step must be a number" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (ref) {
      console.log("Called referral code:", ref);
      const referrer = atob(ref);
      user.whoReferred = new mongoose.Types.ObjectId(referrer);
      user.isReferred = true;
      await user.save();
      console.log("Now call query for save in referral modal");
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
      console.log("No referral code provided");
      user.onboardingStep = step;
      user.hasSeenWelcome = true; // Mark that user has seen welcome page
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding step updated",
    });
  } catch (error) {
    console.error("Update onboarding step error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
