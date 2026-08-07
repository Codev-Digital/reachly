import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    // Set lastActiveAt to 0 so they immediately appear offline
    await User.updateOne(
      { email: session.user.email },
      { $set: { lastActiveAt: new Date(0) } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/user/offline:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
