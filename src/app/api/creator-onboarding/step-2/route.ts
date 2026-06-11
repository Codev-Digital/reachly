import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import { uploadToSupabase } from '@/lib/supabase';

// ─── Required fields for the profile to be considered complete ───────────────
function checkCompletion(data: {
  profilePhoto?: string;
  coverPhoto?: string;
  displayName: string;
  username: string;
  shortBio: string;
  longBio: string;
  city: string;
  languages: string[];
  niches: string[];
}): boolean {
  return !!(
    data.profilePhoto &&
    data.coverPhoto &&
    data.displayName.trim() &&
    data.username.trim() &&
    data.shortBio.trim() &&
    data.longBio.trim() &&
    data.city &&
    data.city !== 'Choose your city' &&
    data.languages.length > 0 &&
    data.niches.length > 0
  );
}

// ─── GET — load saved profile for the session user ───────────────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = await CreatorProfile.findOne({ userId: user._id });
    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('GET creator profile error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// ─── PUT — create/update profile, upload photos to Supabase ─────────────────
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();

    const displayName = (formData.get('displayName') as string) || '';
    const username = (formData.get('username') as string) || '';
    const shortBio = (formData.get('shortBio') as string) || '';
    const longBio = (formData.get('longBio') as string) || '';
    const city = (formData.get('city') as string) || '';
    const country = (formData.get('country') as string) || 'Pakistan';
    const languages: string[] = JSON.parse(
      (formData.get('languages') as string) || '[]'
    );
    const niches: string[] = JSON.parse(
      (formData.get('niches') as string) || '[]'
    );
    const instagram = (formData.get('instagram') as string) || '';
    const tiktok = (formData.get('tiktok') as string) || '';
    const youtube = (formData.get('youtube') as string) || '';
    const linkedin = (formData.get('linkedin') as string) || '';

    // ── Validate username uniqueness (allow own username) ──────────────────
    if (username.trim()) {
      const taken = await CreatorProfile.findOne({
        username: username.trim().toLowerCase().replace(/^@/, ''),
        userId: { $ne: user._id },
      });
      if (taken) {
        return NextResponse.json(
          { error: 'Username is already taken. Please choose another.' },
          { status: 400 }
        );
      }
    }

    // ── Retrieve existing profile (or create stub) ─────────────────────────
    let profile = await CreatorProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = new CreatorProfile({ userId: user._id });
    }

    // ── Upload photos to Supabase if new files provided ────────────────────
    const profilePhotoFile = formData.get('profilePhoto') as File | null;
    const coverPhotoFile = formData.get('coverPhoto') as File | null;

    if (profilePhotoFile && profilePhotoFile.size > 0) {
      if (profilePhotoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Profile photo must be smaller than 5 MB' },
          { status: 400 }
        );
      }
      const bytes = await profilePhotoFile.arrayBuffer();
      const url = await uploadToSupabase(
        Buffer.from(bytes),
        profilePhotoFile.type,
        `profiles/${user._id}/profile.${profilePhotoFile.type.split('/')[1]}`
      );
      profile.profilePhoto = url;
    }

    if (coverPhotoFile && coverPhotoFile.size > 0) {
      if (coverPhotoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Cover photo must be smaller than 5 MB' },
          { status: 400 }
        );
      }
      const bytes = await coverPhotoFile.arrayBuffer();
      const url = await uploadToSupabase(
        Buffer.from(bytes),
        coverPhotoFile.type,
        `profiles/${user._id}/cover.${coverPhotoFile.type.split('/')[1]}`
      );
      profile.coverPhoto = url;
    }

    // ── Persist all text data to MongoDB ───────────────────────────────────
    profile.displayName = displayName;
    profile.username = username.trim().toLowerCase().replace(/^@/, '');
    profile.shortBio = shortBio;
    profile.longBio = longBio;
    profile.city = city;
    profile.country = country;
    profile.languages = languages;
    profile.niches = niches;
    profile.socialLinks = { instagram, tiktok, youtube, linkedin };

    // Compute completion flag
    profile.isProfileComplete = checkCompletion({
      profilePhoto: profile.profilePhoto,
      coverPhoto: profile.coverPhoto,
      displayName: profile.displayName,
      username: profile.username,
      shortBio: profile.shortBio,
      longBio: profile.longBio,
      city: profile.city,
      languages: profile.languages,
      niches: profile.niches,
    });

    await profile.save();

    // ── Block navigation if profile isn't complete yet ─────────────────────
    if (!profile.isProfileComplete) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please fill in all required fields before continuing.',
          profile,
        },
        { status: 422 }
      );
    }

    // Bump onboardingStep if this is the first time completing step 2
    if (user.onboardingStep < 2) {
      user.onboardingStep = 2;
      await user.save();
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('PUT creator profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
