import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import CreatorPayout from '@/models/CreatorPayout';
import CreatorProfile from '@/models/CreatorProfile';
import User from '@/models/User';

const COOLDOWN_DAYS = 15;

function asAmount(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value.replace(/[^0-9.]/g, ''));
  return NaN;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select('_id').lean() as { _id: mongoose.Types.ObjectId } | null;
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    const creatorProfile = await CreatorProfile.findOne({ userId: user._id }).select('_id').lean() as { _id: mongoose.Types.ObjectId } | null;
    if (!creatorProfile) return NextResponse.json({ error: 'Creator profile not found.' }, { status: 404 });

    const payoutRecord = await CreatorPayout.findOne({ creatorProfileId: creatorProfile._id }).lean();
    const latestPayout = payoutRecord?.payouts
      ?.filter((payout) => payout.status !== 'rejected')
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())[0];
    return NextResponse.json({
      success: true,
      payouts: payoutRecord?.payouts || [],
      bankName: payoutRecord?.bankName || latestPayout?.bankName || '',
      accountNumber: payoutRecord?.accountNumber || latestPayout?.accountNumber || '',
      nextWithdrawDate: payoutRecord?.nextWithdrawDate || latestPayout?.nextWithdrawDate || null,
    });
  } catch (error) {
    console.error('Creator payouts API error:', error);
    return NextResponse.json({ error: 'Unable to load payout requests.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const bankName = String(body.bankName || '').trim();
    const accountNumber = String(body.accountNumber || '').replace(/\s/g, '');
    const withdrawAmount = asAmount(body.withdrawAmount);

    if (!bankName) return NextResponse.json({ error: 'Bank name is required.' }, { status: 400 });
    if (!/^[0-9]{6,24}$/.test(accountNumber)) {
      return NextResponse.json({ error: 'Account number must contain 6 to 24 digits.' }, { status: 400 });
    }
    if (!Number.isFinite(withdrawAmount) || withdrawAmount < 1000 || withdrawAmount > 50000) {
      return NextResponse.json({ error: 'Withdrawal amount must be between 1,000 and 50,000 PKR.' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select('_id').lean() as { _id: mongoose.Types.ObjectId } | null;
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    const creatorProfile = await CreatorProfile.findOne({ userId: user._id }).select('_id').lean() as { _id: mongoose.Types.ObjectId } | null;
    if (!creatorProfile) return NextResponse.json({ error: 'Creator profile not found.' }, { status: 404 });

    const payoutRecord = await CreatorPayout.findOne({ creatorProfileId: creatorProfile._id });
    const latestPayout = payoutRecord?.payouts
      ?.filter((p) => p.status !== 'rejected')
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())[0];

    const currentNextWithdrawDate = latestPayout
      ? (payoutRecord?.nextWithdrawDate || latestPayout.nextWithdrawDate)
      : null;
    if (currentNextWithdrawDate && currentNextWithdrawDate > new Date()) {
      return NextResponse.json({
        error: `Your next payout is available after ${currentNextWithdrawDate.toISOString()}.`,
        nextWithdrawDate: currentNextWithdrawDate,
      }, { status: 409 });
    }

    const paidBookings = await Booking.find({
      creatorId: user._id,
      paymentStatus: 'paid',
      status: { $ne: 'cancelled' },
    }).select('finalPrice').lean();
    const earned = paidBookings.reduce((sum, booking: any) => sum + asAmount(booking.finalPrice), 0);
    const alreadyRequested = (payoutRecord?.payouts || [])
      .filter((p) => p.status !== 'rejected')
      .reduce((sum, payout) => sum + payout.withdrawAmount, 0);
    if (withdrawAmount > Math.max(0, earned - alreadyRequested)) {
      return NextResponse.json({ error: 'Withdrawal amount exceeds your available balance.' }, { status: 400 });
    }

    const requestedAt = new Date();
    const requestedNextWithdrawDate = new Date(requestedAt);
    requestedNextWithdrawDate.setDate(requestedNextWithdrawDate.getDate() + COOLDOWN_DAYS);
    const payout = {
      requestedAt,
      withdrawAmount,
      bankName,
      accountNumber,
      status: 'pending' as const,
      nextWithdrawDate: requestedNextWithdrawDate,
    };

    const saved = payoutRecord
      ? await CreatorPayout.findByIdAndUpdate(
          payoutRecord._id,
          {
            $set: { bankName, accountNumber, nextWithdrawDate: requestedNextWithdrawDate },
            $push: { payouts: payout },
          },
          { new: true, runValidators: true }
        )
      : await CreatorPayout.create({
          creatorProfileId: creatorProfile._id,
          bankName,
          accountNumber,
          nextWithdrawDate: requestedNextWithdrawDate,
          payouts: [payout],
        });

    const createdPayout = saved?.payouts[saved.payouts.length - 1];
    return NextResponse.json({
      success: true,
      payout: createdPayout,
      nextWithdrawDate: requestedNextWithdrawDate,
    }, { status: 201 });
  } catch (error) {
    console.error('Creator payout request API error:', error);
    return NextResponse.json({ error: 'Unable to create payout request.' }, { status: 500 });
  }
}
