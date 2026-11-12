import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import UserApprovalRequest from '@/models/UserApprovalRequest';
import { sanitizeRichText } from '@/lib/sanitizeRichText';
import { DETAILED_BIO_MAX_LENGTH, richTextLength } from '@/lib/richText';
import { validatePassword } from '@/lib/password';

// GET the current user's profile and account settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email })
      .select('name email profilePhoto shortBio city country languages')
      .lean() as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [creatorProfile, approvalRequest] = await Promise.all([
      CreatorProfile.findOne({ userId: user._id })
        .select('username displayName shortBio longBio city country languages niches socialLinks coverPhoto profilePhoto')
        .lean() as Promise<any>,
      UserApprovalRequest.findOne({ userId: user._id })
        .select('city country')
        .lean() as Promise<any>,
    ]);

    const resolvedShortBio =
      user.shortBio !== undefined ? user.shortBio : (creatorProfile?.shortBio ?? '');
    const resolvedCity =
      user.city !== undefined ? user.city : (creatorProfile?.city || approvalRequest?.city || '');
    const resolvedCountry =
      user.country !== undefined && user.country !== ''
        ? user.country
        : (creatorProfile?.country || approvalRequest?.country || 'Pakistan');
    const resolvedLanguages = Array.isArray(user.languages)
      ? user.languages
      : (creatorProfile?.languages?.length ? creatorProfile.languages : ['English']);

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto || null,
        shortBio: resolvedShortBio,
        city: resolvedCity,
        country: resolvedCountry,
        languages: resolvedLanguages,
      },
      profile: creatorProfile ? {
        username: creatorProfile.username,
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
        return NextResponse.json({ error: 'Incorrect old password', field: 'oldPassword' }, { status: 400 });
      }

      const passwordCheck = validatePassword(newPassword);
      if (!passwordCheck.isValid) {
        return NextResponse.json(
          { error: passwordCheck.message, field: 'newPassword' },
          { status: 400 }
        );
      }

      // UserSchema.pre('save') hashes modified passwords once; never pre-hash here.
      user.password = newPassword;
      await user.save();

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    // Default: Profile Update
    const { displayName, shortBio, bio, longBio, city, country, languages, niches, socialLinks, profilePhoto, coverPhoto } = body;

    if (displayName !== undefined) {
      const trimmedName = String(displayName).trim();
      if (!trimmedName) {
        return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
      }
      user.name = trimmedName;
    }

    const incomingShortBio = shortBio !== undefined ? shortBio : bio;
    const normalizedShortBio =
      incomingShortBio !== undefined ? String(incomingShortBio).trim().slice(0, 140) : undefined;
    const normalizedCity = city !== undefined ? String(city).trim().slice(0, 60) : undefined;
    const normalizedCountry = country !== undefined ? String(country).trim().slice(0, 60) : undefined;
    const normalizedLanguages =
      languages !== undefined
        ? Array.isArray(languages)
          ? Array.from(new Set(languages.map((l) => String(l).trim()).filter(Boolean)))
          : []
        : undefined;

    if (normalizedShortBio !== undefined) user.shortBio = normalizedShortBio;
    if (normalizedCity !== undefined) user.city = normalizedCity;
    if (normalizedCountry !== undefined) user.country = normalizedCountry;
    if (normalizedLanguages !== undefined) user.languages = normalizedLanguages;

    // Check if the user is already a creator (i.e. has a CreatorProfile)
    let creatorProfile = await CreatorProfile.findOne({ userId: user._id });

    // ONLY UPDATE CreatorProfile IF IT EXISTS! Do NOT create one here.
    if (creatorProfile) {
      if (displayName !== undefined) creatorProfile.displayName = user.name;
      if (normalizedShortBio !== undefined) creatorProfile.shortBio = normalizedShortBio;
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
      if (normalizedCity !== undefined) creatorProfile.city = normalizedCity;
      if (normalizedCountry !== undefined) creatorProfile.country = normalizedCountry;
      if (normalizedLanguages !== undefined) creatorProfile.languages = normalizedLanguages;
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
      user: {
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto || null,
        shortBio: user.shortBio ?? '',
        city: user.city ?? '',
        country: user.country ?? 'Pakistan',
        languages: Array.isArray(user.languages) ? user.languages : ['English'],
      },
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

    // Soft delete: keep the data, block the account, hide any creator profile
    await CreatorProfile.updateOne({ userId: user._id }, { isDeactivated: true });
    user.approvalStatus = 'deleted';
    user.deletedAt = new Date();
    await user.save();

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Settings DELETE error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
