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

        // Total session types this creator offers
        const totalCategories = sessions.length;

        // Sessions completed = bookings with this creator where scheduled date+time has passed
        const allBookings = await Booking.find({ creatorId: user._id, status: { $ne: 'cancelled' } })
            .select('scheduledDate scheduledTime')
            .lean();
        
        const now = new Date();
        const sessionsCompleted = allBookings.filter((b: any) => {
            if (!b.scheduledDate) return false;
            try {
                const baseDate = new Date(b.scheduledDate);
                const timeStr = (b.scheduledTime || '').split(' to ')[0].trim();
                const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (match) {
                    let hours = parseInt(match[1]);
                    const minutes = parseInt(match[2]);
                    const ampm = match[3].toUpperCase();
                    if (ampm === 'PM' && hours < 12) hours += 12;
                    if (ampm === 'AM' && hours === 12) hours = 0;
                    baseDate.setHours(hours, minutes, 0, 0);
                } else {
                    baseDate.setHours(23, 59, 59, 999);
                }
                return now > baseDate;
            } catch { return false; }
        }).length;

        const distinctEmails = await Booking.distinct('guestDetails.email', { creatorId: user._id });
        const happyCustomers = distinctEmails.length;

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
