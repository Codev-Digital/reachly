import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
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

    scheduledDate: Date;
    scheduledTime: string; // e.g. "05:00 PM"

    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod?: 'jazzcash' | 'easypaisa' | 'stripe';

    price: number;
    promoApplied?: string;
    discountAmount?: number;
    finalPrice: number;

    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
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
    },
    { timestamps: true }
);

const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
