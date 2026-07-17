import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  isVerified: boolean;
  isRegistrationComplete: boolean;
  otp?: string;
  otpExpires?: Date;
  emailChangeOTP?: string;
  emailChangeOTPExpires?: Date;
  newEmail?: string;
  onboardingStep: number;
  hasSeenWelcome: boolean;
  approvalStatus: 'none' | 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  profilePhoto?: string;
  savedCreators: string[]; // array of creator usernames
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: { type: String, minlength: 6 },
    googleId: { type: String },
    isVerified: { type: Boolean, default: false },
    isRegistrationComplete: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    emailChangeOTP: { type: String },
    emailChangeOTPExpires: { type: Date },
    newEmail: { type: String },
    onboardingStep: { type: Number, default: 0 },
    hasSeenWelcome: { type: Boolean, default: false },
    approvalStatus: { 
      type: String, 
      enum: ['none', 'pending', 'approved', 'rejected'], 
      default: 'none' 
    },
    profilePhoto: { type: String },
    savedCreators: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function () {
  const user = this as IUser;
  if (!user.isModified('password') || !user.password) return;
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password || '');
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
