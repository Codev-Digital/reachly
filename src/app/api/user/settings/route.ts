import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import bcrypt from 'bcryptjs';

// GET the current user's profile and account settings
export async function GET(req: NextRequest) {
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

    const creatorProfile = await CreatorProfile.findOne({ userId: user._id });

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
      profile: creatorProfile ? {
        displayName: creatorProfile.displayName,
        shortBio: creatorProfile.shortBio,
        longBio: creatorProfile.longBio,
        city: creatorProfile.city,
        country: creatorProfile.country,
        languages: creatorProfile.languages || [],
        niches: creatorProfile.niches || [],
        socialLinks: creatorProfile.socialLinks || {},
        coverPhoto: creatorProfile.coverPhoto,
        profilePhoto: creatorProfile.profilePhoto,
      } : null
    });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PUT to update user/creator profile details
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { action } = body;

    // Password Update Action
    if (action === 'update-password') {
      const { oldPassword, newPassword } = body;
      if (!oldPassword || !newPassword) {
        return NextResponse.json({ error: 'Missing password fields' }, { status: 400 });
      }

      if (!user.password) {
        return NextResponse.json({ error: 'OAuth users cannot change password' }, { status: 400 });
      }

      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect old password' }, { status: 400 });
      }

      // Hash and save new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    // Default: Profile Update
    const { displayName, shortBio, longBio, city, country, languages, niches, socialLinks, profilePhoto } = body;

    // Update User Name
    if (displayName) {
      user.name = displayName;
      await user.save();
    }

    // Update or Create Creator Profile
    let creatorProfile = await CreatorProfile.findOne({ userId: user._id });
    if (!creatorProfile) {
      creatorProfile = new CreatorProfile({
        userId: user._id,
        username: user.email.split('@')[0], // default fallback username
      });
    }

    if (displayName !== undefined) creatorProfile.displayName = displayName;
    if (shortBio !== undefined) creatorProfile.shortBio = shortBio;
    if (longBio !== undefined) creatorProfile.longBio = longBio;
    if (city !== undefined) creatorProfile.city = city;
    if (country !== undefined) creatorProfile.country = country;
    if (languages !== undefined) creatorProfile.languages = languages;
    if (niches !== undefined) creatorProfile.niches = niches;
    if (socialLinks !== undefined) creatorProfile.socialLinks = socialLinks;

    if (profilePhoto && profilePhoto.startsWith('data:image')) {
      try {
        const { uploadToSupabase } = await import('@/lib/supabase');
        const matches = profilePhoto.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const type = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const ext = type.split('/')[1] || 'png';
          const url = await uploadToSupabase(
            buffer,
            type,
            `profiles/${user._id}/profile_${Date.now()}.${ext}`
          );
          creatorProfile.profilePhoto = url;
        }
      } catch (uploadErr) {
        console.error('Error uploading profile photo to supabase:', uploadErr);
      }
    } else if (profilePhoto !== undefined) {
      creatorProfile.profilePhoto = profilePhoto;
    }

    await creatorProfile.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: creatorProfile
    });
  } catch (error: any) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

// DELETE user account
export async function DELETE(req: NextRequest) {
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

    // Delete Creator Profile if exists
    await CreatorProfile.deleteOne({ userId: user._id });

    // Delete User
    await User.deleteOne({ _id: user._id });

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Settings DELETE error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
