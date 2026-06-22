import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { status } = await request.json();
        
        if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        let booking = null;
        if (mongoose.isValidObjectId(id)) {
            booking = await Booking.findById(id).exec();
        }

        if (!booking) {
            booking = await Booking.findOne({ bookingRef: id }).exec();
        }

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Ensure the booking belongs to this creator
        if (booking.creatorId?.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const updatePayload: any = { status };
        if (status === 'cancelled' && booking.paymentStatus === 'paid') {
            updatePayload.paymentStatus = 'refunded';
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            booking._id,
            { $set: updatePayload },
            { new: true }
        ).exec();

        return NextResponse.json({ success: true, booking: updatedBooking || booking });
    } catch (error: any) {
        console.error('PUT /api/creators/bookings/[id] error:', error?.message ?? error, error);
        return NextResponse.json({ error: error?.message ?? 'Server error' }, { status: 500 });
    }
}