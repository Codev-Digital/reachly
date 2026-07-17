import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

async function getEmailFromRequest(request: NextRequest): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) return session.user.email;
  const token = request.cookies.get('auth_token')?.value;
  const payload = token ? verifyToken(token) : null;
  return payload?.email ?? null;
}

// GET — fetch the list of saved creator usernames for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const email = await getEmailFromRequest(request);
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email }).select('savedCreators');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ savedCreators: user.savedCreators || [] });
  } catch (err) {
    console.error('GET /api/user/saved-creators error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST — add a creator username to saved list
export async function POST(request: NextRequest) {
  try {
    const email = await getEmailFromRequest(request);
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { username } = await request.json();
    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

    await connectDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $addToSet: { savedCreators: username } },
      { new: true }
    ).select('savedCreators');

    return NextResponse.json({ savedCreators: user?.savedCreators || [] });
  } catch (err) {
    console.error('POST /api/user/saved-creators error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE — remove a creator username from saved list
export async function DELETE(request: NextRequest) {
  try {
    const email = await getEmailFromRequest(request);
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { username } = await request.json();
    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

    await connectDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $pull: { savedCreators: username } },
      { new: true }
    ).select('savedCreators');

    return NextResponse.json({ savedCreators: user?.savedCreators || [] });
  } catch (err) {
    console.error('DELETE /api/user/saved-creators error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
