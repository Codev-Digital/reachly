import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import bcrypt from 'bcryptjs';
import { sanitizeRichText } from '@/lib/sanitizeRichText';
import { DETAILED_BIO_MAX_LENGTH, richTextLength } from '@/lib/richText';

// GET the current user's profile and account settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email })
      .select('name email profilePhoto')
      .lean() as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const creatorProfile = await CreatorProfile.findOne({ userId: user._id })
      .select('displayName shortBio longBio city country languages niches socialLinks coverPhoto profilePhoto')
      .lean() as any;

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto || null,
      },
      profile: creatorProfile ? {
        displayName: creatorProfile.displayName || user.name,
        shortBio: creatorProfile.shortBio,
        longBio: creatorProfile.longBio,
        city: creatorProfile.city,
        country: creatorProfile.country,
        languages: creatorProfile.languages || [],
        niches: creatorProfile.niches || [],
        socialLinks: creatorProfile.socialLinks || {},
        coverPhoto: creatorProfile.coverPhoto,
        profilePhoto: creatorProfile.profilePhoto || user.profilePhoto,
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

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    // Default: Profile Update
    const { displayName, shortBio, longBio, city, country, languages, niches, socialLinks, profilePhoto, coverPhoto } = body;

    // Update User Name
    if (displayName) {
      user.name = displayName;
    }

    // Check if the user is already a creator (i.e. has a CreatorProfile)
    let creatorProfile = await CreatorProfile.findOne({ userId: user._id });

    // ONLY UPDATE CreatorProfile IF IT EXISTS! Do NOT create one here.
    if (creatorProfile) {
      if (displayName !== undefined) creatorProfile.displayName = displayName;
      if (shortBio !== undefined) creatorProfile.shortBio = shortBio;
      if (longBio !== undefined) {
        const cleanLongBio = sanitizeRichText(longBio);
        if (richTextLength(cleanLongBio) > DETAILED_BIO_MAX_LENGTH) {
          return NextResponse.json(
            { error: `Detailed bio must be ${DETAILED_BIO_MAX_LENGTH} characters or fewer.` },
            { status: 400 }
          );
        }
        creatorProfile.longBio = cleanLongBio;
      }
      if (city !== undefined) creatorProfile.city = city;
      if (country !== undefined) creatorProfile.country = country;
      if (languages !== undefined) creatorProfile.languages = languages;
      if (niches !== undefined) creatorProfile.niches = niches;
      if (socialLinks !== undefined) creatorProfile.socialLinks = socialLinks;

      if (coverPhoto && coverPhoto.startsWith('data:image')) {
        try {
          const { uploadToSupabase } = await import('@/lib/supabase');
          const matches = coverPhoto.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const type = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const ext = type.split('/')[1] || 'png';
            const url = await uploadToSupabase(
              buffer,
              type,
              `covers/${user._id}/cover_${Date.now()}.${ext}`
            );
            creatorProfile.coverPhoto = url;
          }
        } catch (uploadErr) {
          console.error('Error uploading cover photo to supabase:', uploadErr);
        }
      } else if (coverPhoto !== undefined) {
        creatorProfile.coverPhoto = coverPhoto;
      }
    }

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
          user.profilePhoto = url;
          if (creatorProfile) creatorProfile.profilePhoto = url;
        }
      } catch (uploadErr) {
        console.error('Error uploading profile photo:', uploadErr);
      }
    } else if (profilePhoto !== undefined && profilePhoto !== null && !profilePhoto.startsWith('data:image')) {
      user.profilePhoto = profilePhoto;
      if (creatorProfile) creatorProfile.profilePhoto = profilePhoto;
    }

    await user.save();
    if (creatorProfile) {
      await creatorProfile.save();
    }

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
