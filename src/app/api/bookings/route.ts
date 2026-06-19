import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

        // 1. Find the creator
        const creatorProfile = await CreatorProfile.findOne({ username });
        if (!creatorProfile) return NextResponse.json({ error: 'Creator not found' }, { status: 404 });

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

        // 4. Create the booking
        const booking = new Booking({
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
            status: 'pending',
            paymentStatus: 'pending', // we'll assume pending until they pay, or we mark it directly if payment gateway was bypassed
            paymentMethod: paymentMethod || 'jazzcash',
            price: originalPrice,
            promoApplied,
            discountAmount: originalPrice - finalPrice,
            finalPrice: finalPrice,
        });

        await booking.save();

        return NextResponse.json({ success: true, bookingId: booking._id });
    } catch (error: any) {
        console.error('Booking POST error:', error);
        return NextResponse.json(
            { error: 'Something went wrong while processing your booking' },
            { status: 500 }
        );
    }
}
