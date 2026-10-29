import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICreatorProfile extends Document {
  userId: mongoose.Types.ObjectId; // ref → User
  // Photos stored as Supabase public URLs
  profilePhoto?: string;
  coverPhoto?: string;
  // Basic info
  displayName: string;
  username: string;
  shortBio: string;
  longBio: string;
  city: string;
  country: string;
  // Multi-select
  languages: string[];
  niches: string[];
  // Optional social links
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  // Step completion flag — only true when all required fields are filled
  isProfileComplete: boolean;
  isDeactivated?: boolean; // true when creator has no active sessions
  deactivatedAt?: Date;
  views?: number;
  commissionPercent: number;
  createdAt: Date;
  updatedAt: Date;
}

const CreatorProfileSchema = new Schema<ICreatorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one profile per user
    },
    profilePhoto: { type: String },
    coverPhoto: { type: String },
    displayName: { type: String, default: '' },
    username: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
      // Sparse unique — empty strings won't conflict, but set usernames must be unique
      index: { unique: true, sparse: true },
      validate: {
        validator: (v: string) => v === '' || /^[a-z0-9_-]{3,30}$/.test(v),
        message: 'Username must be 3–30 chars and only contain letters, numbers, _ or -',
      },
    },
    shortBio: { type: String, default: '', maxlength: 140 },
    // Stored as sanitized HTML (rich text). The 1000 character limit applies to the visible text
    // and is enforced in the API routes, so this only guards against huge payloads.
    longBio: { type: String, default: '', maxlength: 10000 },
    city: { type: String, default: '' },
    country: { type: String, default: 'Pakistan' },
    languages: { type: [String], default: [] },
    niches: { type: [String], default: [] },
    socialLinks: {
      instagram: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      youtube: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
    views: { type: Number, default: 0 },
    commissionPercent: {
      type: Number,
      default: 20,
      min: 0.1,
      max: 99,
      validate: {
        validator: (value: number) => Number.isInteger(value * 10),
        message: 'Commission must have at most one decimal place',
      },
    },
    isProfileComplete: { type: Boolean, default: false },
    isDeactivated: { type: Boolean, default: false, index: true },
    deactivatedAt: { type: Date },
  },
  { timestamps: true }
);

const CreatorProfile: Model<ICreatorProfile> =
  mongoose.models.CreatorProfile ||
  mongoose.model<ICreatorProfile>('CreatorProfile', CreatorProfileSchema);

export default CreatorProfile;
