// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import connectDB from '@/lib/mongodb';
// import User from '@/models/User';
// import CreatorProfile from '@/models/CreatorProfile';
// import { sanitizeRichText } from '@/lib/sanitizeRichText';
// import CreatorPayment from '@/models/CreatorPayment';
// import Booking from '@/models/Booking';
// import EventPurchase from '@/models/EventPurchase';
// import CreatorPayout from '@/models/CreatorPayout';
// import mongoose from 'mongoose';
// import { autoSettleEarnings } from '@/lib/autoSettleEarnings';
// import { packageInfo } from '@/lib/packageLabels';

// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// type WalletBooking = {
//   _id: mongoose.Types.ObjectId;
//   creatorId: mongoose.Types.ObjectId;
//   paymentStatus?: string;
//   status?: string;
//   finalPrice?: number;
//   packagePurchaseId?: mongoose.Types.ObjectId | null;
//   sessionNumber?: number;
// };

// // Helper to verify admin session
// function isAdmin(email?: string | null) {
//   if (!email) return false;
//   const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
//   return adminEmails.includes(email.toLowerCase());
// }

// // GET all creators, or a single creator with ?id=<userId>
// export async function GET(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email || !isAdmin(session.user.email)) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     await connectDB();

//     const id = new URL(req.url).searchParams.get('id');
//     if (id && !mongoose.isValidObjectId(id)) {
//       return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
//     }

//     if (id) {
//       await autoSettleEarnings(id);
//     }

//     // Fetch creator profiles, payments, and bookings (only this creator's when ?id= is given)
//     const [profiles, payments, allBookings] = await Promise.all([
//       CreatorProfile.find(id ? { userId: id } : {}).lean(),
//       CreatorPayment.find(id ? { userId: id } : {}).lean(),
//       Booking.find(id ? { creatorId: id } : {}).lean(),
//     ]);

//     const creatorUserIds = profiles.map((p: any) => p.userId.toString());

//     // Fetch all users who are creators
//     const creatorUsers = await User.find({ _id: { $in: creatorUserIds } }).sort({ createdAt: -1 }).lean();

//     // Map database creator data to table shape
//     const formattedCreators = creatorUsers.map((user: any) => {
//       const profile = profiles.find((p: any) => p.userId.toString() === user._id.toString());
//       const payment = payments.find((pay: any) => pay.userId.toString() === user._id.toString());
      
//       const creatorBookings = allBookings.filter((b: any) => b.creatorId.toString() === user._id.toString());
//       const completedSessions = creatorBookings.filter((b: any) => b.status === 'completed').length;
      
//       const uniqueBookers = new Set<string>();
//       creatorBookings.forEach((b: any) => {
//         if (b.userId) uniqueBookers.add(b.userId.toString());
//         if (b.guestDetails?.email) uniqueBookers.add(b.guestDetails.email);
//       });
//       const happyUsers = uniqueBookers.size;
//       const totalCategories = profile?.niches?.length || 0;

//       const d = new Date(user.createdAt);
//       const joinedDate = d.toLocaleDateString('en-GB', {
//         day: 'numeric',
//         month: 'short',
//         year: 'numeric'
//       });
//             const time = d.toLocaleTimeString('en-US', {
//         hour: 'numeric',
//         minute: '2-digit',
//         hour12: true
//       });

//       let deletedDate = '';
//       let deletedTime = '';
//       if (user.deletedAt) {
//         const dDel = new Date(user.deletedAt);
//         deletedDate = dDel.toLocaleDateString('en-GB', {
//           day: 'numeric',
//           month: 'short',
//           year: 'numeric'
//         });
//         deletedTime = dDel.toLocaleTimeString('en-US', {
//           hour: 'numeric',
//           minute: '2-digit',
//           hour12: true
//         });
//       }

//       // Map status
//       // Only an admin-approved account is Active; not-yet-applied ('none') is Inactive
//       let status: 'Active' | 'Pending' | 'Inactive' | 'Suspended' | 'Rejected' | 'Deleted' = 'Inactive';
//       if (user.approvalStatus === 'approved') status = 'Active';
//       else if (user.approvalStatus === 'pending') status = 'Pending';
//       else if (user.approvalStatus === 'rejected') status = 'Rejected';
//       else if (user.approvalStatus === 'suspended') status = 'Suspended';
//       else if (user.approvalStatus === 'deleted') status = 'Deleted';

//       // Build contact details
//       const contactInfo = [
//         payment?.mobileNumber ? `+92 ${payment.mobileNumber.replace(/^(\+?92|0)/, '')}` : null,
//         user.email?.toUpperCase()
//       ].filter(Boolean).join('   |   ');

//       return {
//         id: `CRT-${user._id.toString().slice(-5).toUpperCase()}`,
//         dbId: user._id.toString(),
//         name: user.name || 'Creator',
//         username: profile?.username ? `@${profile.username}` : `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
//         email: user.email,
//         joinedDate,
//         time,
//         deletedDate,
//         deletedTime,
//         status,
//         avatar: profile?.profilePhoto || user.profilePhoto || '/avatar.png',
//         coverPhoto: profile?.coverPhoto || '',
//         city: profile?.city || '',
//         country: profile?.country || '',
//         languages: profile?.languages?.join(', ') || 'English',
//         bio: profile?.shortBio || '',
//         longBio: sanitizeRichText(profile?.longBio),
//         niches: profile?.niches || [],
//         bannerName: profile?.displayName || user.name || 'Creator Name',
//         bannerNiche: profile?.niches?.[0] || 'Content Creator',
//         bannerContact: contactInfo,
//         sessionsCompleted: completedSessions,
//         happyUsers: happyUsers,
//         totalCategories: totalCategories,
//         commissionPercent: profile?.commissionPercent ?? 20
//       };
//     });

//     if (id) {
//       const creator = formattedCreators[0];
//       if (!creator) {
//         return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
//       }

//       const creatorProfile = profiles[0];
//       const creatorBookings = allBookings.filter(
//         (booking: WalletBooking) => booking.creatorId.toString() === id,
//       ) as WalletBooking[];
//       const [outgoingBookings, payoutRecord, pendingEventPurchases] = await Promise.all([
//         Booking.find({ userId: id, creatorId: { $ne: id } })
//           .select('_id finalPrice packagePurchaseId sessionNumber status paymentStatus')
//           .lean(),
//         CreatorPayout.findOne({ creatorProfileId: creatorProfile._id })
//           .select('payouts')
//           .lean(),
//         EventPurchase.find({
//           creatorId: id,
//           paymentStatus: 'pending',
//           status: { $ne: 'cancelled' },
//         })
//           .select('tierPrice quantity')
//           .lean(),
//       ]);

//       const lifetimeEarning = creatorBookings.reduce(
//         (total, booking) =>
//           booking.paymentStatus === 'paid' ? total + Number(booking.finalPrice || 0) : total,
//         0,
//       );
//       const pendingSessionPayments = creatorBookings.reduce(
//         (total, booking) =>
//           booking.paymentStatus === 'pending' &&
//           booking.status !== 'cancelled' &&
//           booking.status !== 'refunded'
//             ? total + Number(booking.finalPrice || 0)
//             : total,
//         0,
//       );
//       const pendingEventPayments = pendingEventPurchases.reduce(
//         (total, purchase) =>
//           total + Number(purchase.tierPrice || 0) * Number(purchase.quantity || 1),
//         0,
//       );

//       const payableOutgoingBookings = outgoingBookings.filter(
//         (booking) => !(booking.packagePurchaseId && booking.sessionNumber !== 1),
//       );
//       const { paid: packagePayments } = await packageInfo(payableOutgoingBookings);
//       const outgoingPaid = payableOutgoingBookings.reduce((total, booking) => {
//         if (
//           booking.status === 'cancelled' ||
//           booking.paymentStatus === 'refunded'
//         ) {
//           return total;
//         }
//         return total + (packagePayments.get(String(booking._id)) ?? Number(booking.finalPrice || 0));
//       }, 0);
//       const fundedPayouts = (payoutRecord?.payouts || [])
//         .filter((payout) => payout.status === 'funded')
//         .reduce((total, payout) => total + Number(payout.withdrawAmount || 0), 0);
//       const totalPaidOut = outgoingPaid + fundedPayouts;

//       return NextResponse.json({
//         success: true,
//         creator: {
//           ...creator,
//           wallet: {
//             availableBalance: Math.max(0, lifetimeEarning - totalPaidOut),
//             lifetimeEarning,
//             pendingSessionPayments,
//             pendingEventPayments,
//             pendingEarning: pendingSessionPayments + pendingEventPayments,
//             totalPaidOut,
//           },
//         },
//       });
//     }

//     return NextResponse.json({ success: true, creators: formattedCreators });
//   } catch (error: any) {
//     console.error('Admin creators GET error:', error);
//     return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
//   }
// }

// // PUT to approve, reject, or suspend a creator
// export async function PUT(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email || !isAdmin(session.user.email)) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     await connectDB();
//     const { userId, action, commissionPercent } = await req.json();

//     if (!userId || !['approve', 'reject', 'suspend', 'activate', 'restore', 'updateCommission'].includes(action)) {
//       return NextResponse.json({ error: 'Invalid data parameters' }, { status: 400 });
//     }

//     if (action === 'updateCommission') {
//       if (!mongoose.isValidObjectId(userId)) {
//         return NextResponse.json({ error: 'Invalid creator ID.' }, { status: 400 });
//       }

//       const value = typeof commissionPercent === 'number' ? commissionPercent : Number(commissionPercent);
//       if (!Number.isFinite(value) || value < 0.1 || value > 99 || !Number.isInteger(value * 10)) {
//         return NextResponse.json(
//           { error: 'Commission must be between 0.1% and 99% with at most one decimal place.' },
//           { status: 400 }
//         );
//       }

//       const profile = await CreatorProfile.findOneAndUpdate(
//         { userId },
//         { $set: { commissionPercent: value } },
//         { new: true, runValidators: true }
//       ).lean();
//       if (!profile) return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
//       return NextResponse.json({ success: true, commissionPercent: profile.commissionPercent ?? value });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     if (action === 'approve' && user.approvalStatus !== 'pending') {
//       return NextResponse.json({ error: 'This creator has not submitted their application yet.' }, { status: 400 });
//     }

//     if (action === 'approve') {
//       user.approvalStatus = 'approved';
//     } else if (action === 'reject') {
//       user.approvalStatus = 'rejected';
//     } else if (action === 'suspend') {
//       user.approvalStatus = 'suspended';
//     } else if (action === 'activate') {
//       user.approvalStatus = 'approved';
//     }

//     await user.save();

//     return NextResponse.json({ success: true, message: `Creator status changed to ${action}d successfully` });
//   } catch (error: any) {
//     console.error('Admin creators PUT error:', error);
//     return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
//   }
// }

// // DELETE a creator
// export async function DELETE(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email || !isAdmin(session.user.email)) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     await connectDB();
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get('userId');

//     if (!userId) {
//       return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
//     }

//     // Soft delete: keep the data, block the account, hide the creator profile
//     const user = await User.findByIdAndUpdate(userId, { approvalStatus: 'deleted', deletedAt: new Date() });
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }
//     await CreatorProfile.updateOne({ userId }, { isDeactivated: true });

//     return NextResponse.json({ success: true, message: 'Creator deleted successfully' });
//   } catch (error: any) {
//     console.error('Admin creators DELETE error:', error);
//     return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import { sanitizeRichText } from '@/lib/sanitizeRichText';
import CreatorPayment from '@/models/CreatorPayment';
import Booking from '@/models/Booking';
import EventPurchase from '@/models/EventPurchase';
import CreatorPayout from '@/models/CreatorPayout';
import mongoose from 'mongoose';
import { autoSettleEarnings } from '@/lib/autoSettleEarnings';
import { packageInfo } from '@/lib/packageLabels';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type WalletBooking = {
  _id: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  paymentStatus?: string;
  status?: string;
  finalPrice?: number;
  updated_total_amount?: number;
  updated_platform_amount?: number;
  packagePurchaseId?: mongoose.Types.ObjectId | null;
  sessionNumber?: number;
};

// Helper to verify admin session
function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

// GET all creators, or a single creator with ?id=<userId>
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const id = new URL(req.url).searchParams.get('id');
    if (id && !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    if (id) {
      await autoSettleEarnings(id);
    }

    // Fetch creator profiles, payments, and bookings (only this creator's when ?id= is given)
    const [profiles, payments, allBookings] = await Promise.all([
      CreatorProfile.find(id ? { userId: id } : {}).lean(),
      CreatorPayment.find(id ? { userId: id } : {}).lean(),
      Booking.find(id ? { creatorId: id } : {}).lean(),
    ]);

    const creatorUserIds = profiles.map((p: any) => p.userId.toString());

    // Fetch all users who are creators
    const creatorUsers = await User.find({ _id: { $in: creatorUserIds } }).sort({ createdAt: -1 }).lean();

    // Map database creator data to table shape
    const formattedCreators = creatorUsers.map((user: any) => {
      const profile = profiles.find((p: any) => p.userId.toString() === user._id.toString());
      const payment = payments.find((pay: any) => pay.userId.toString() === user._id.toString());
      
      const creatorBookings = allBookings.filter((b: any) => b.creatorId.toString() === user._id.toString());
      const completedSessions = creatorBookings.filter((b: any) => b.status === 'completed').length;
      
      const uniqueBookers = new Set<string>();
      creatorBookings.forEach((b: any) => {
        if (b.userId) uniqueBookers.add(b.userId.toString());
        if (b.guestDetails?.email) uniqueBookers.add(b.guestDetails.email);
      });
      const happyUsers = uniqueBookers.size;
      const totalCategories = profile?.niches?.length || 0;

      const d = new Date(user.createdAt);
      const joinedDate = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
            const time = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      let deletedDate = '';
      let deletedTime = '';
      if (user.deletedAt) {
        const dDel = new Date(user.deletedAt);
        deletedDate = dDel.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        deletedTime = dDel.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }

      // Map status
      // Only an admin-approved account is Active; not-yet-applied ('none') is Inactive
      let status: 'Active' | 'Pending' | 'Inactive' | 'Suspended' | 'Rejected' | 'Deleted' = 'Inactive';
      if (user.approvalStatus === 'approved') status = 'Active';
      else if (user.approvalStatus === 'pending') status = 'Pending';
      else if (user.approvalStatus === 'rejected') status = 'Rejected';
      else if (user.approvalStatus === 'suspended') status = 'Suspended';
      else if (user.approvalStatus === 'deleted') status = 'Deleted';

      // Build contact details
      const contactInfo = [
        payment?.mobileNumber ? `+92 ${payment.mobileNumber.replace(/^(\+?92|0)/, '')}` : null,
        user.email?.toUpperCase()
      ].filter(Boolean).join('   |   ');

      return {
        id: `CRT-${user._id.toString().slice(-5).toUpperCase()}`,
        dbId: user._id.toString(),
        name: user.name || 'Creator',
        username: profile?.username ? `@${profile.username}` : `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
        email: user.email,
        joinedDate,
        time,
        deletedDate,
        deletedTime,
        status,
        avatar: profile?.profilePhoto || user.profilePhoto || '/avatar.png',
        coverPhoto: profile?.coverPhoto || '',
        city: profile?.city || '',
        country: profile?.country || '',
        languages: profile?.languages?.join(', ') || 'English',
        bio: profile?.shortBio || '',
        longBio: sanitizeRichText(profile?.longBio),
        niches: profile?.niches || [],
        bannerName: profile?.displayName || user.name || 'Creator Name',
        bannerNiche: profile?.niches?.[0] || 'Content Creator',
        bannerContact: contactInfo,
        sessionsCompleted: completedSessions,
        happyUsers: happyUsers,
        totalCategories: totalCategories,
        commissionPercent: profile?.commissionPercent ?? 20
      };
    });

    if (id) {
      const creator = formattedCreators[0];
      if (!creator) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
      }

      const creatorProfile = profiles[0];
      const creatorBookings = allBookings.filter(
        (booking: WalletBooking) => booking.creatorId.toString() === id,
      ) as WalletBooking[];
      const adjustedPackageIds = new Set(
        creatorBookings
          .filter((booking) =>
            booking.packagePurchaseId &&
            booking.sessionNumber === 1 &&
            booking.updated_total_amount !== undefined,
          )
          .map((booking) => booking.packagePurchaseId!.toString()),
      );
      const [outgoingBookings, payoutRecord, pendingEventPurchases] = await Promise.all([
        Booking.find({ userId: id, creatorId: { $ne: id } })
          .select('_id finalPrice packagePurchaseId sessionNumber status paymentStatus')
          .lean(),
        CreatorPayout.findOne({ creatorProfileId: creatorProfile._id })
          .select('payouts')
          .lean(),
        EventPurchase.find({
          creatorId: id,
          paymentStatus: 'pending',
          status: { $ne: 'cancelled' },
        })
          .select('tierPrice quantity')
          .lean(),
      ]);

      const lifetimeEarning = creatorBookings.reduce(
        (total, booking) => {
          if (booking.paymentStatus !== 'paid') return total;
          const isAdjustedPackage = booking.packagePurchaseId &&
            adjustedPackageIds.has(booking.packagePurchaseId.toString());
          if (isAdjustedPackage && booking.sessionNumber !== 1) return total;
          const amount = booking.updated_total_amount !== undefined
            ? Math.max(0, booking.updated_total_amount - (booking.updated_platform_amount ?? 0))
            : Number(booking.finalPrice || 0);
          return total + amount;
        },
        0,
      );
      const pendingSessionPayments = creatorBookings.reduce(
        (total, booking) =>
          booking.paymentStatus === 'pending' &&
          booking.status !== 'cancelled' &&
          booking.status !== 'refunded'
            ? total + Number(booking.updated_total_amount ?? booking.finalPrice ?? 0)
            : total,
        0,
      );
      const pendingEventPayments = pendingEventPurchases.reduce(
        (total, purchase) =>
          total + Number(
            purchase.updated_total_amount ??
              Number(purchase.tierPrice || 0) * Number(purchase.quantity || 1),
          ),
        0,
      );

      const payableOutgoingBookings = outgoingBookings.filter(
        (booking) => !(booking.packagePurchaseId && booking.sessionNumber !== 1),
      );
      const { paid: packagePayments } = await packageInfo(payableOutgoingBookings);
      const outgoingPaid = payableOutgoingBookings.reduce((total, booking) => {
        if (
          booking.status === 'cancelled' ||
          booking.paymentStatus === 'refunded'
        ) {
          return total;
        }
        return total + (packagePayments.get(String(booking._id)) ?? Number(booking.finalPrice || 0));
      }, 0);
      const fundedPayouts = (payoutRecord?.payouts || [])
        .filter((payout) => payout.status === 'funded')
        .reduce((total, payout) => total + Number(payout.withdrawAmount || 0), 0);
      const totalPaidOut = outgoingPaid + fundedPayouts;
      const actualAvailableBalance = Math.max(0, lifetimeEarning - totalPaidOut);
      await CreatorProfile.updateOne(
        { _id: creatorProfile._id },
        {
          $set: {
            actual_totall_earning: actualAvailableBalance,
            actual_life_time_earning: lifetimeEarning,
          },
        },
      );

      return NextResponse.json({
        success: true,
        creator: {
          ...creator,
          wallet: {
            availableBalance:
              creatorProfile.updated_totall_earning ?? actualAvailableBalance,
            lifetimeEarning: creatorProfile.updated_life_time_earning ?? lifetimeEarning,
            editedAvailableBalance: creatorProfile.updated_totall_earning ?? null,
            editedLifetimeEarning: creatorProfile.updated_life_time_earning ?? null,
            actualAvailableBalance,
            actualLifetimeEarning: lifetimeEarning,
            pendingSessionPayments,
            pendingEventPayments,
            pendingEarning: pendingSessionPayments + pendingEventPayments,
            totalPaidOut,
          },
        },
      });
    }

    return NextResponse.json({ success: true, creators: formattedCreators });
  } catch (error: any) {
    console.error('Admin creators GET error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PUT to approve, reject, or suspend a creator
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { userId, action, commissionPercent } = await req.json();

    if (!userId || !['approve', 'reject', 'suspend', 'activate', 'restore', 'updateCommission'].includes(action)) {
      return NextResponse.json({ error: 'Invalid data parameters' }, { status: 400 });
    }

    if (action === 'updateCommission') {
      if (!mongoose.isValidObjectId(userId)) {
        return NextResponse.json({ error: 'Invalid creator ID.' }, { status: 400 });
      }

      const value = typeof commissionPercent === 'number' ? commissionPercent : Number(commissionPercent);
      if (!Number.isFinite(value) || value < 0.1 || value > 99 || !Number.isInteger(value * 10)) {
        return NextResponse.json(
          { error: 'Commission must be between 0.1% and 99% with at most one decimal place.' },
          { status: 400 }
        );
      }

      const profile = await CreatorProfile.findOneAndUpdate(
        { userId },
        { $set: { commissionPercent: value } },
        { new: true, runValidators: true }
      ).lean();
      if (!profile) return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
      return NextResponse.json({ success: true, commissionPercent: profile.commissionPercent ?? value });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'approve' && user.approvalStatus !== 'pending') {
      return NextResponse.json({ error: 'This creator has not submitted their application yet.' }, { status: 400 });
    }

    if (action === 'approve') {
      user.approvalStatus = 'approved';
    } else if (action === 'reject') {
      user.approvalStatus = 'rejected';
    } else if (action === 'suspend') {
      user.approvalStatus = 'suspended';
    } else if (action === 'activate') {
      user.approvalStatus = 'approved';
    }

    await user.save();

    return NextResponse.json({ success: true, message: `Creator status changed to ${action}d successfully` });
  } catch (error: any) {
    console.error('Admin creators PUT error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

// DELETE a creator
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Soft delete: keep the data, block the account, hide the creator profile
    const user = await User.findByIdAndUpdate(userId, { approvalStatus: 'deleted', deletedAt: new Date() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await CreatorProfile.updateOne({ userId }, { isDeactivated: true });

    return NextResponse.json({ success: true, message: 'Creator deleted successfully' });
  } catch (error: any) {
    console.error('Admin creators DELETE error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}