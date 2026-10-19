import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import Booking from '@/models/Booking';
import { sanitizeRichText } from '@/lib/sanitizeRichText';

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
        const profile = await CreatorProfile.findOne({
            $or: [
                { username: lowerUsername },
                { username: cleanUsername }
            ]
        }).lean() as any;

        if (!profile) {
            return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        // Increment views in background without blocking the read response
        CreatorProfile.updateOne({ _id: profile._id }, { $inc: { views: 1 } }).exec().catch(() => {});

        // Fetch User, Sessions, and Bookings concurrently in parallel
        const [user, sessions, allBookings] = (await Promise.all([
            User.findById(profile.userId).select('name isVerified email').lean(),
            SessionType.find({ userId: profile.userId }).sort({ order: 1 }).lean(),
            Booking.find({ creatorId: profile.userId, status: { $ne: 'cancelled' } })
                .select('scheduledDate scheduledTime guestDetails.email')
                .lean()
        ])) as [any, any[], any[]];

        if (!user) {
            return NextResponse.json({ error: 'User data not found' }, { status: 404 });
        }

        // Total session types this creator offers
        const totalCategories = sessions.length;

        // Sessions completed = bookings with this creator where scheduled date+time has passed
        const now = new Date();
        const uniqueEmails = new Set<string>();
        let sessionsCompleted = 0;

        allBookings.forEach((b: any) => {
            if (b.guestDetails?.email) {
                uniqueEmails.add(b.guestDetails.email.toLowerCase());
            }
            if (b.scheduledDate) {
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
                    if (now > baseDate) sessionsCompleted++;
                } catch {}
            }
        });

        const happyCustomers = uniqueEmails.size;

        return NextResponse.json({
            success: true,
            creator: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: profile.username,
                displayName: profile.displayName,
                shortBio: profile.shortBio,
                longBio: sanitizeRichText(profile.longBio),
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
