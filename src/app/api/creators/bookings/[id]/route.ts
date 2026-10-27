import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { checkSessionModificationWindow, checkNewSessionTime, parseDateToNoonUTC } from '@/lib/time';
import SessionType from '@/models/SessionType';

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

        const body = await request.json();
        const { status, selectedDate, selectedTime, isLocked, startMeeting, endMeeting } = body;

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

        // Ensure the booking belongs to this creator (as host creator or as client booker)
        const isHost = booking.creatorId?.toString() === user._id.toString();
        const isClient = booking.userId?.toString() === user._id.toString();
        if (!isHost && !isClient) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Reachly runs on Pakistan time only (the browser / creator timezone is ignored)
        const timeZone = 'Asia/Karachi';

        const isCancelling = status === 'cancelled';
        const isRescheduling = Boolean(selectedDate || selectedTime);

        // Package sessions can be rescheduled but never cancelled
        if (isCancelling && booking.packagePurchaseId) {
            return NextResponse.json({ error: 'Package sessions cannot be cancelled. Reschedule it instead.' }, { status: 403 });
        }

        // 1. Cancellation checks (must be at least 24 hours before session start time)
        if (isCancelling) {
            if (booking.status === 'cancelled') {
                return NextResponse.json({ error: 'Booking is already cancelled.' }, { status: 400 });
            }
            if (booking.status === 'completed') {
                return NextResponse.json({ error: 'Completed bookings cannot be cancelled.' }, { status: 400 });
            }

            const cancelCheck = checkSessionModificationWindow(
                booking.scheduledDate,
                booking.scheduledTime,
                timeZone,
                'cancel'
            );
            if (!cancelCheck.allowed) {
                return NextResponse.json({ error: cancelCheck.errorMessage }, { status: 400 });
            }
        }

        // 2. Rescheduling checks (must be at least 24 hours before session start time)
        if (isRescheduling) {
            if (booking.status === 'cancelled') {
                return NextResponse.json({ error: 'Cancelled bookings cannot be rescheduled.' }, { status: 400 });
            }
            if (booking.status === 'completed') {
                return NextResponse.json({ error: 'Completed bookings cannot be rescheduled.' }, { status: 400 });
            }

            const rescheduleCheck = checkSessionModificationWindow(
                booking.scheduledDate,
                booking.scheduledTime,
                timeZone,
                'reschedule'
            );
            if (!rescheduleCheck.allowed) {
                return NextResponse.json({ error: rescheduleCheck.errorMessage }, { status: 400 });
            }

            // Ensure the new scheduled slot is strictly in the future
            const targetDate = selectedDate || booking.scheduledDate;
            const targetTime = selectedTime || booking.scheduledTime;
            const newSlotCheck = checkNewSessionTime(targetDate, targetTime, timeZone);
            if (!newSlotCheck.allowed) {
                return NextResponse.json({ error: newSlotCheck.errorMessage }, { status: 400 });
            }
        }

        const updatePayload: any = {};
        if (status) {
            updatePayload.status = status;
            if (status === 'cancelled' && booking.paymentStatus === 'paid') {
                updatePayload.paymentStatus = 'refunded';
            }
        }
        if (selectedDate) {
            updatePayload.scheduledDate = parseDateToNoonUTC(selectedDate, timeZone);
            updatePayload.isRescheduled = true;
            // New slot — creator must start again
            updatePayload.meetingStartedAt = null;
            updatePayload.meetingEndsAt = null;
            updatePayload.meetingEndedAt = null;
        }
        if (selectedTime) {
            updatePayload.scheduledTime = selectedTime;
            updatePayload.isRescheduled = true;
            updatePayload.meetingStartedAt = null;
            updatePayload.meetingEndsAt = null;
            updatePayload.meetingEndedAt = null;
        }
        if (typeof isLocked === 'boolean') {
            updatePayload.isLocked = isLocked;
        }

        let meetingMeta: {
            meetingStartedAt?: Date;
            meetingEndsAt?: Date | null;
            durationMins?: number;
            bufferMins?: number;
            totalMeetingMins?: number;
        } = {};

        if (startMeeting === true) {
            if (booking.status === 'cancelled' || booking.status === 'completed') {
                return NextResponse.json(
                    { error: 'This session cannot be started.' },
                    { status: 400 }
                );
            }
            if (booking.meetingEndedAt) {
                return NextResponse.json(
                    { error: 'This meeting has already ended.' },
                    { status: 400 }
                );
            }
            if (!booking.meetingUrl) {
                return NextResponse.json(
                    { error: 'Meeting link is not available yet.' },
                    { status: 400 }
                );
            }

            const sessionType = await SessionType.findById(booking.sessionTypeId)
                .select('duration bufferTime')
                .lean();
            const durationMins = Math.max(1, Number((sessionType as any)?.duration) || 15);
            const bufferMins = Math.max(0, Number((sessionType as any)?.bufferTime) || 0);
            const totalMeetingMins = durationMins + bufferMins;

            if (!booking.meetingStartedAt) {
                const startedAt = new Date();
                const endsAt = new Date(startedAt.getTime() + totalMeetingMins * 60 * 1000);
                updatePayload.meetingStartedAt = startedAt;
                updatePayload.meetingEndsAt = endsAt;
                updatePayload.meetingEndedAt = null;
                meetingMeta = {
                    meetingStartedAt: startedAt,
                    meetingEndsAt: endsAt,
                    durationMins,
                    bufferMins,
                    totalMeetingMins,
                };
            } else {
                meetingMeta = {
                    meetingStartedAt: booking.meetingStartedAt,
                    meetingEndsAt: booking.meetingEndsAt || null,
                    durationMins,
                    bufferMins,
                    totalMeetingMins,
                };
                if (!booking.meetingEndsAt) {
                    const endsAt = new Date(
                        new Date(booking.meetingStartedAt).getTime() + totalMeetingMins * 60 * 1000
                    );
                    updatePayload.meetingEndsAt = endsAt;
                    meetingMeta.meetingEndsAt = endsAt;
                }
            }
        }

        if (endMeeting === true) {
            if (!booking.meetingEndedAt) {
                updatePayload.meetingEndedAt = new Date();
            }
            if (booking.status === 'confirmed' || booking.status === 'pending') {
                updatePayload.status = 'completed';
            }
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            booking._id,
            { $set: updatePayload },
            { new: true }
        ).exec();

        // Cloud recording + MeetingRecording row when the creator starts / ends the call
        if (startMeeting === true && !booking.meetingStartedAt) {
            try {
                const { ensureRecordingSession } = await import('@/lib/meetingRecording');
                await ensureRecordingSession(String(booking._id));
            } catch (recErr) {
                console.error('Error starting meeting recording:', recErr);
            }
        }
        if (endMeeting === true) {
            try {
                const { finalizeRecordingStop } = await import('@/lib/meetingRecording');
                await finalizeRecordingStop(String(booking._id));
            } catch (recErr) {
                console.error('Error finalizing meeting recording:', recErr);
            }
        }

        // Notify user if booking is rescheduled or cancelled or meeting started
        if (booking.userId) {
            try {
                const Notification = (await import('@/models/Notification')).default;

                if (startMeeting === true && !booking.meetingStartedAt) {
                    await new Notification({
                        userId: booking.userId,
                        title: 'Meeting Started',
                        message: 'Your creator has started the meeting. You can join now.',
                        type: 'booking',
                        read: false,
                        time: 'Just now',
                    }).save();
                }
                
                // Rescheduled Notification
                if (selectedDate || selectedTime) {
                    const targetDateObj = updatePayload.scheduledDate || booking.scheduledDate;
                    const formattedDate = new Date(targetDateObj).toLocaleDateString('en-US', {
                        timeZone,
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                    });
                    const newTime = selectedTime || booking.scheduledTime;
                    
                    await new Notification({
                        userId: booking.userId,
                        title: 'Booking Rescheduled',
                        message: `Your booking was rescheduled by the creator to ${formattedDate} at ${newTime}.`,
                        type: 'reschedule',
                        read: false,
                        time: 'Just now'
                    }).save();
                }

                // Cancelled Notification
                if (status === 'cancelled') {
                    await new Notification({
                        userId: booking.userId,
                        title: 'Booking Cancelled',
                        message: `Your booking was cancelled by the creator.`,
                        type: 'cancellation',
                        read: false,
                        time: 'Just now'
                    }).save();
                }
            } catch (notifErr) {
                console.error('Error creating user notification:', notifErr);
            }
        }

        return NextResponse.json({
            success: true,
            booking: updatedBooking || booking,
            meeting: meetingMeta.meetingStartedAt
                ? {
                    meetingStartedAt: meetingMeta.meetingStartedAt,
                    meetingEndsAt: meetingMeta.meetingEndsAt,
                    durationMins: meetingMeta.durationMins,
                    bufferMins: meetingMeta.bufferMins,
                    totalMeetingMins: meetingMeta.totalMeetingMins,
                    meetingEnded: Boolean(
                        (updatedBooking as any)?.meetingEndedAt || booking.meetingEndedAt
                    ),
                }
                : endMeeting
                    ? {
                        meetingEnded: true,
                        meetingEndedAt:
                            (updatedBooking as any)?.meetingEndedAt || updatePayload.meetingEndedAt,
                    }
                    : undefined,
        });
    } catch (error: any) {
        console.error('PUT /api/creators/bookings/[id] error:', error?.message ?? error, error);
        return NextResponse.json({ error: error?.message ?? 'Server error' }, { status: 500 });
    }
}