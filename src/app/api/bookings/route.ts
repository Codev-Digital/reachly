import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import { sendEmail, generateBookingConfirmationEmail } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper to generate booking reference
function generateBookingRef(): string {
    return 'RCH-' + Math.random().toString(36).toUpperCase().slice(2, 10);
}

// Helper to format date like "Mon, Jan 1"
function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Attempt to get the logged-in user
        const session = await getServerSession(authOptions);
        let loggedInUserId: string | undefined;

        const payload = await request.json();
        const {
            username,
            sessionId,
            date,
            time,
            userDetails,
            proceedAs,
            paymentMethod,
            promoApplied,
            finalPrice,
            originalPrice
        } = payload;

        if (!username || !sessionId || !date || !time) {
            return NextResponse.json({ error: 'Missing required booking details' }, { status: 400 });
        }

        if (!userDetails || !userDetails.fullName || !userDetails.email || !userDetails.whatsapp) {
            return NextResponse.json({ error: 'Missing required user details (Name, Email, WhatsApp)' }, { status: 400 });
        }

        // 1. Find the creator and session type
        const creatorProfile = await CreatorProfile.findOne({ username });
        if (!creatorProfile) return NextResponse.json({ error: 'Creator not found' }, { status: 404 });

        const sessionType = await SessionType.findById(sessionId);
        if (!sessionType) return NextResponse.json({ error: 'Session type not found' }, { status: 404 });

        // 2. Identify the user
        let userToAttachId = null;

        if (session?.user?.email) {
            const u = await User.findOne({ email: session.user.email });
            if (u) userToAttachId = u._id;
        }

        if (!userToAttachId) {
            // Find based on email
            const u = await User.findOne({ email: userDetails.email.toLowerCase() });
            if (u) {
                userToAttachId = u._id;
            } else if (proceedAs === 'signup' || proceedAs === 'guest') {
                // Automatically create somewhat of an unverified user
                // But for simplicity in this booking flow, let's just keep userToAttachId null
                // and rely on guestDetails.
            }
        }

        // 3. Prevent creator from booking themselves
        if (userToAttachId && userToAttachId.toString() === creatorProfile.userId.toString()) {
            return NextResponse.json({ error: 'Cannot book your own session' }, { status: 400 });
        }

        // Generate booking reference
        const bookingRef = generateBookingRef();

        // 4. Create the booking
        const booking = new Booking({
            bookingRef,
            creatorId: creatorProfile.userId,
            sessionTypeId: sessionId,
            userId: userToAttachId,
            guestDetails: {
                fullName: userDetails.fullName,
                email: userDetails.email.toLowerCase(),
                whatsapp: userDetails.whatsapp,
                notes: userDetails.notes || '',
                heardFrom: userDetails.heardFrom || '',
                whatToDiscuss: userDetails.whatToDiscuss || '',
            },
            scheduledDate: new Date(date),
            scheduledTime: time,
            status: 'confirmed', // Auto-approved
            paymentStatus: 'paid', // Mark as paid since payment is simulated
            paymentMethod: paymentMethod || 'jazzcash',
            price: originalPrice,
            promoApplied,
            discountAmount: originalPrice - finalPrice,
            finalPrice: finalPrice,
        });

        await booking.save();

        // Create a real Notification for the creator
        try {
            const Notification = (await import('@/models/Notification')).default;
            await new Notification({
                userId: creatorProfile.userId,
                title: 'New Session Booked',
                message: `${userDetails.fullName} booked a "${sessionType.title}" session on ${formatDate(new Date(date))} at ${time}.`,
                type: 'booking',
                read: false,
                time: 'Just now'
            }).save();
        } catch (notifErr) {
            console.error('Error creating creator notification:', notifErr);
        }

        // Send confirmation email
        const emailHtml = generateBookingConfirmationEmail({
            bookingRef,
            creatorName: creatorProfile.displayName,
            creatorUsername: creatorProfile.username,
            creatorProfilePhoto: creatorProfile.profilePhoto || '',
            sessionTitle: sessionType.title,
            sessionDuration: `${sessionType.duration} min`,
            date: formatDate(new Date(date)),
            time,
            userName: userDetails.fullName,
            userEmail: userDetails.email.toLowerCase(),
            whatsapp: userDetails.whatsapp,
            whatToDiscuss: userDetails.whatToDiscuss,
            meetLink: 'https://meet.google.com/iqj-bsq-bze',
        });

        await sendEmail(
            userDetails.email.toLowerCase(),
            `Your Booking with ${creatorProfile.displayName} is Confirmed!`,
            emailHtml
        );

        return NextResponse.json({ success: true, bookingId: booking._id, bookingRef });
    } catch (error: any) {
        console.error('Booking POST error:', error);
        return NextResponse.json(
            { error: 'Something went wrong while processing your booking' },
            { status: 500 }
        );
    }
}
