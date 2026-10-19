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
    const { step, ref, force } = body;

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
    if (ref && mongoose.isValidObjectId(atob(ref))) {
      const referrer = atob(ref);
      user.whoReferred = new mongoose.Types.ObjectId(referrer);
      user.isReferred = true;
      const existingReferral = await Referral.findOne({ joinnee: user._id });
      if (!existingReferral) {
        await Referral.create({
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
      }
    }

    // Role can be changed until the first step is finished (status none, step <= 1)
    const canReset = force && user.approvalStatus === 'none' && (user.onboardingStep || 0) <= 1;
    user.onboardingStep = canReset ? step : Math.max(user.onboardingStep || 0, step);
    user.hasSeenWelcome = true;
    await user.save();

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
