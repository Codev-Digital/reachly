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

export async function GET(request: NextRequest) {
  try {
    const email = await getEmailFromRequest(request);
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ email }).select('favouriteCreators');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ favouriteCreators: user.favouriteCreators || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const email = await getEmailFromRequest(request);
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { username } = await request.json();
    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });
    await connectDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $addToSet: { favouriteCreators: username } },
      { new: true }
    ).select('favouriteCreators');
    return NextResponse.json({ favouriteCreators: user?.favouriteCreators || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const email = await getEmailFromRequest(request);
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { username } = await request.json();
    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });
    await connectDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $pull: { favouriteCreators: username } },
      { new: true }
    ).select('favouriteCreators');
    return NextResponse.json({ favouriteCreators: user?.favouriteCreators || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
