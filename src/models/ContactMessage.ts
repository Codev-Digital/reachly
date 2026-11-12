import mongoose, { Document, Model, Schema } from "mongoose";

export interface IContactMessage extends Document {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    subject: { type: String, required: true, trim: true, maxlength: 180 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  },
  { timestamps: true },
);

const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

export default ContactMessage;
