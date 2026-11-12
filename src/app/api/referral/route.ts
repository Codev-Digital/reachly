import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import Referral from "@/models/referral.model";
import User from "@/models/User";
import Booking from "@/models/Booking";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/jwt";
import {
  filterAndSearchReferrals,
  normalizeReferralStatus,
  resolveActivityPaymentMethod,
  type ReferralActivityLike,
  type ReferralBookingLike,
} from "@/lib/referralHelpers";

interface RawReferralAgg {
  _id: mongoose.Types.ObjectId;
  referrer?: mongoose.Types.ObjectId;
  totalBuyActivities: number;
  joinnee?: {
    _id?: mongoose.Types.ObjectId;
    name?: string;
    email?: string;
  } | null;
  buyActivity: ReferralActivityLike;
}

interface BookingLean extends ReferralBookingLike {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    let email: string | undefined;
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      email = session.user.email;
    } else {
      const authHeader = request.headers.get("authorization");
      const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : undefined;
      const cookieToken = request.cookies.get("auth_token")?.value;
      const token = bearerToken || cookieToken;
      const payload = token ? verifyToken(token) : null;
      email = payload?.email;
    }

    if (!email) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const currentUser = await User.findOne({ email }).select(
      "_id totalAmountEarnedFromReferrals"
    );
    const loggedInUserId = currentUser?._id;

    if (!loggedInUserId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Query params: pagination & filters
    const { searchParams } = new URL(request.url);

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 10, 1), 50);
    const search = (searchParams.get("search") || "").trim();
    const method = (searchParams.get("method") || "All").trim();
    const status = (searchParams.get("status") || "All").trim();

    const rawReferrals = await Referral.aggregate([
      // 1. Get referrals of logged-in user
      {
        $match: {
          referrer: new mongoose.Types.ObjectId(loggedInUserId),
        },
      },

      // 2. Create separate document for every buy activity
      {
        $unwind: "$buyActivities",
      },

      // 3. Most recent activity first
      {
        $sort: {
          "buyActivities.activityTime": -1,
        },
      },

      // 4. Get joinnee details
      {
        $lookup: {
          from: "users",
          localField: "joinnee",
          foreignField: "_id",
          as: "joinnee",
        },
      },

      // 5. Convert joinnee array to object
      {
        $unwind: {
          path: "$joinnee",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 6. Return required fields
      {
        $project: {
          _id: 1,
          referrer: 1,
          totalBuyActivities: 1,

          joinnee: {
            _id: "$joinnee._id",
            name: "$joinnee.name",
            email: "$joinnee.email",
          },

          buyActivity: "$buyActivities",
        },
      },
    ]);

    const joinneeObjectIds = Array.from(
      new Set(
        (rawReferrals as RawReferralAgg[])
          .map((r) => r.joinnee?._id?.toString())
          .filter((id): id is string => Boolean(id))
      )
    ).map((id) => new mongoose.Types.ObjectId(id));

    const bookings = joinneeObjectIds.length
      ? ((await Booking.find({ userId: { $in: joinneeObjectIds } })
          .select("_id userId sessionTypeId paymentMethod paymentStatus status createdAt")
          .sort({ createdAt: -1 })
          .lean()) as unknown as BookingLean[])
      : [];

    const bookingsByJoinnee = new Map<string, BookingLean[]>();
    for (const b of bookings) {
      const uid = b.userId?.toString();
      if (!uid) continue;
      if (!bookingsByJoinnee.has(uid)) bookingsByJoinnee.set(uid, []);
      bookingsByJoinnee.get(uid)!.push(b);
    }

    const enrichedReferrals = (rawReferrals as RawReferralAgg[]).map((r) => {
      const joinneeId = r.joinnee?._id?.toString();
      const joinneeBookings = joinneeId ? bookingsByJoinnee.get(joinneeId) || [] : [];
      const paymentMethod = resolveActivityPaymentMethod(r.buyActivity, joinneeBookings);
      const normalizedStatus = normalizeReferralStatus(r.buyActivity?.status);

      return {
        ...r,
        _id: r._id.toString(),
        referrer: r.referrer?.toString(),
        joinnee: r.joinnee?._id
          ? {
              _id: r.joinnee._id.toString(),
              name: r.joinnee.name || "",
              email: r.joinnee.email || "",
            }
          : null,
        paymentMethod,
        normalizedStatus,
      };
    });

    const uniqueReferralIds = new Set(enrichedReferrals.map((r) => r._id));
    const successfulReferrals = enrichedReferrals.filter(
      (r) =>
        r.buyActivity?.type === "buy_session" && r.normalizedStatus === "rewarded"
    ).length;
    const rewardedSum = enrichedReferrals
      .filter((r) => r.normalizedStatus === "rewarded")
      .reduce((sum: number, r) => sum + (Number(r.buyActivity?.totalAmount) || 0), 0);
    const rejectedSum = enrichedReferrals
      .filter((r) => r.normalizedStatus === "rejected")
      .reduce((sum: number, r) => sum + (Number(r.buyActivity?.totalAmount) || 0), 0);
    const pendingRewards = enrichedReferrals
      .filter((r) => r.normalizedStatus === "pending")
      .reduce((sum: number, r) => sum + (Number(r.buyActivity?.totalAmount) || 0), 0);

    const totalRewardsEarned =
      typeof currentUser.totalAmountEarnedFromReferrals === "number"
        ? Math.max(0, currentUser.totalAmountEarnedFromReferrals)
        : Math.max(0, rewardedSum - rejectedSum);

    const filteredReferrals = filterAndSearchReferrals(enrichedReferrals, {
      search,
      method,
      status,
    });

    const total = filteredReferrals.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;
    const pagedReferrals = filteredReferrals.slice(skip, skip + limit);

    return Response.json({
      success: true,
      referrals: pagedReferrals,
      summary: {
        totalReferrals: uniqueReferralIds.size,
        successfulReferrals,
        totalRewardsEarned,
        pendingRewards,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Referral API error:", error);

    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}