import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import Booking from '@/models/Booking';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        await connectDB();

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const lowerUsername = username.toLowerCase();
        const cleanUsername = lowerUsername.replace(/-/g, '');
        const profile = await CreatorProfile.findOneAndUpdate(
            {
                $or: [
                    { username: lowerUsername },
                    { username: cleanUsername }
                ]
            },
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!profile) {
            return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        const user = await User.findById(profile.userId).select('name isVerified email');
        if (!user) {
            return NextResponse.json({ error: 'User data not found' }, { status: 404 });
        }

        const sessions = await SessionType.find({ userId: user._id }).sort({ order: 1 });

        // Calculate real stats from database
        const sessionsCompleted = await Booking.countDocuments({ creatorId: user._id, status: 'completed' });
        const distinctEmails = await Booking.distinct('guestDetails.email', { creatorId: user._id });
        const happyCustomers = distinctEmails.length;
        const totalCategories = profile.niches ? profile.niches.length : 0;

        return NextResponse.json({
            success: true,
            creator: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: profile.username,
                displayName: profile.displayName,
                shortBio: profile.shortBio,
                longBio: profile.longBio,
                profilePhoto: profile.profilePhoto || '/avatar.png',
                coverPhoto: profile.coverPhoto,
                city: profile.city,
                country: profile.country,
                languages: profile.languages,
                niches: profile.niches,
                socialLinks: profile.socialLinks,
                isVerified: user.isVerified,
                stats: {
                    sessionsCompleted: sessionsCompleted,
                    happyCustomers: happyCustomers,
                    totalCategories: totalCategories
                }
            },
            sessions: sessions.map((s) => ({
                id: s._id,
                title: s.title,
                description: s.description,
                duration: `${s.duration} mins`,
                price: s.price,
                features: s.features,
            })),
        });
    } catch (error: any) {
        console.error('Fetch creator profile error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
