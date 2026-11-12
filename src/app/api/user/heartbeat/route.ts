import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    let email: string | undefined;
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      email = session.user.email.toLowerCase().trim();
    } else {
      const token = request.cookies.get('auth_token')?.value;
      const payload = token ? verifyToken(token) : null;
      email = payload?.email?.toLowerCase().trim();
    }

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    await User.updateOne(
      { email },
      { $set: { lastActiveAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/user/heartbeat:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
