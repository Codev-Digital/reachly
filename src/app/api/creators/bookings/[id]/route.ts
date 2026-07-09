import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const email = session.user.email?.toLowerCase().trim();
        let user = null;

        if (email) {
            user = await User.findOne({ email });
        }

        if (!user && (session.user as any).id) {
            user = await User.findById((session.user as any).id).exec();
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { status, selectedDate, selectedTime } = await request.json();
        
        if (status && !['confirmed', 'cancelled', 'completed'].includes(status)) {
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

        const updatePayload: any = {};
        if (status) {
            updatePayload.status = status;
            if (status === 'cancelled' && booking.paymentStatus === 'paid') {
                updatePayload.paymentStatus = 'refunded';
            }
        }
        if (selectedDate) {
            updatePayload.selectedDate = new Date(selectedDate);
        }
        if (selectedTime) {
            updatePayload.selectedTime = selectedTime;
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