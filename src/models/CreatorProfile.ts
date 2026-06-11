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
    username: { type: String, default: '' },
    shortBio: { type: String, default: '', maxlength: 140 },
    longBio: { type: String, default: '', maxlength: 1000 },
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
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CreatorProfile: Model<ICreatorProfile> =
  mongoose.models.CreatorProfile ||
  mongoose.model<ICreatorProfile>('CreatorProfile', CreatorProfileSchema);

export default CreatorProfile;
