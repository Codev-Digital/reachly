import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CreatorProfile from '@/models/CreatorProfile';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';

/**
 * GET /api/creators/check-username?username=somehandle
 * Returns { available: boolean, message: string }
 * Skips the current user's own username so editing doesn't block them.
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username')?.toLowerCase().trim();

        if (!username) {
            return NextResponse.json({ available: false, message: 'Username is required' }, { status: 400 });
        }

        // Validate format: 3–30 chars, only letters, numbers, underscores, hyphens
        if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
            return NextResponse.json({
                available: false,
                message: 'Username must be 3–30 characters and contain only letters, numbers, _ or -',
            });
        }

        let email: string | undefined;

        // Get current user so they can "keep" their own username when editing
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
            email = session.user.email;
        } else {
            const token = request.cookies.get('auth_token')?.value;
            const payload = token ? verifyToken(token) : null;
            email = payload?.email;
        }

        let currentUserId: string | null = null;
        if (email) {
            const userDoc = await User.findOne({ email });
            if (userDoc) {
                currentUserId = userDoc._id.toString();
            }
        }

        const existing = await CreatorProfile.findOne({ username });

        if (!existing) {
            return NextResponse.json({ available: true, message: 'Username is available' });
        }

        // Allow if it belongs to the current user (editing their own profile)
        if (currentUserId && existing.userId.toString() === currentUserId) {
            return NextResponse.json({ available: true, message: 'This is your current username' });
        }

        return NextResponse.json({ available: false, message: 'Username is already taken' });
    } catch (error: any) {
        console.error('check-username error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
