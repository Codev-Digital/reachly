import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import Referral from "@/models/referral.model";
import User from "@/models/User";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/jwt";

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

    const currentUser = await User.findOne({ email }).select("_id");
    const loggedInUserId = currentUser?._id;

    if (!loggedInUserId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Pagination
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = 10;
    const skip = (page - 1) * limit;

    const referrals = await Referral.aggregate([
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

      // 4. Pagination
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },

      // 5. Get joinnee details
      {
        $lookup: {
          from: "users",
          localField: "joinnee",
          foreignField: "_id",
          as: "joinnee",
        },
      },

      // 6. Convert joinnee array to object
      {
        $unwind: {
          path: "$joinnee",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 7. Return required fields
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

    // Total activities for pagination
    const totalResult = await Referral.aggregate([
      {
        $match: {
          referrer: new mongoose.Types.ObjectId(loggedInUserId),
        },
      },
      {
        $project: {
          count: { $size: "$buyActivities" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
        },
      },
    ]);

    const total = totalResult[0]?.total || 0;

    return Response.json({
      success: true,
      referrals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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