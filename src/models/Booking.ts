import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
    bookingRef: string;
    creatorId: mongoose.Types.ObjectId;  // ref to User (creator)
    sessionTypeId: mongoose.Types.ObjectId; // ref to SessionType
    userId?: mongoose.Types.ObjectId; // ref to User (the booker, if logged in/signed up)

    guestDetails?: {
        fullName: string;
        email: string;
        whatsapp: string;
        notes?: string;
        heardFrom?: string;
        whatToDiscuss?: string;
    };

    answers?: Array<{
        questionId?: string;
        question: string;
        answer: string | string[];
        type?: 'multiple_choice' | 'short_answer';
    }>;

    scheduledDate: Date;
    scheduledTime: string; // e.g. "05:00 PM"

    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod?: 'jazzcash' | 'easypaisa' | 'stripe';
    adminRemarks?: string;

    price: number;
    promoApplied?: string;
    discountAmount?: number;
    finalPrice: number;

    packagePurchaseId?: mongoose.Types.ObjectId; // set when this session belongs to a package
    sessionNumber?: number;                      // 1..N within the package
    // Creator asked the admin to unlock the chat so a package session can be rescheduled
    rescheduleRequest?: { status: 'pending' | 'unlocked'; requestedAt: Date };

    isRescheduled?: boolean;
    isLocked?: boolean;

    meetingUrl?: string; // Daily.co room URL
    meetingRoomName?: string; // Daily.co room name
    /** Set when the creator presses Start Meeting — users can join only after this. */
    meetingStartedAt?: Date | null;
    /** Absolute end time = startedAt + (session duration + buffer). */
    meetingEndsAt?: Date | null;
    /** Set when creator leaves, timer hits 0, or meeting is force-ended. */
    meetingEndedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        bookingRef: {
            type: String,
            required: true,
            unique: true,
        },
        creatorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        sessionTypeId: {
            type: Schema.Types.ObjectId,
            ref: 'SessionType',
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
            // Optional: because the user might just be a guest if we don't force account creation immediately
        },
        guestDetails: {
            fullName: { type: String },
            email: { type: String },
            whatsapp: { type: String },
            notes: { type: String },
            heardFrom: { type: String },
            whatToDiscuss: { type: String },
        },
        answers: [
            {
                questionId: { type: String },
                question: { type: String },
                answer: { type: Schema.Types.Mixed },
                type: { type: String, enum: ['multiple_choice', 'short_answer'] },
            }
        ],
        scheduledDate: {
            type: Date,
            required: true,
        },
        scheduledTime: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['jazzcash', 'easypaisa', 'stripe'],
        },
        adminRemarks: {
            type: String,
            default: '',
        },
        price: {
            type: Number,
            required: true,
        },
        promoApplied: {
            type: String,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        finalPrice: {
            type: Number,
            required: true,
        },
        packagePurchaseId: { type: Schema.Types.ObjectId, ref: 'PackagePurchase', index: true },
        sessionNumber: { type: Number },
        rescheduleRequest: {
            status: { type: String, enum: ['pending', 'unlocked'] },
            requestedAt: { type: Date },
        },
        isRescheduled: {
            type: Boolean,
            default: false,
        },
        isLocked: {
            type: Boolean,
            default: true,
        },
        meetingUrl: {
            type: String,
        },
        meetingRoomName: {
            type: String,
        },
        meetingStartedAt: {
            type: Date,
            default: null,
        },
        meetingEndsAt: {
            type: Date,
            default: null,
        },
        meetingEndedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

BookingSchema.index({ creatorId: 1, scheduledDate: -1, createdAt: -1 });
BookingSchema.index({ creatorId: 1, status: 1, scheduledDate: 1 });
BookingSchema.index({ userId: 1, scheduledDate: -1, createdAt: -1 });
BookingSchema.index({ scheduledDate: 1 });

const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
