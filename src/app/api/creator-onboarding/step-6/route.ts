import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CreatorPayment from '@/models/CreatorPayment';
import { uploadToSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const payment = await CreatorPayment.findOne({ userId: user._id });
    return NextResponse.json({ payment });
  } catch (error: any) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const formData = await req.formData();
    const paymentMethod = formData.get('paymentMethod') as string;
    const payoutFrequency = (formData.get('payoutFrequency') as string) || 'weekly';
    const ntnNumber = (formData.get('ntnNumber') as string) || '';

    if (!paymentMethod || !['jazzcash', 'easypaisa', 'bank'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Select a payment method.' }, { status: 422 });
    }

    let payment = await CreatorPayment.findOne({ userId: user._id });
    if (!payment) payment = new CreatorPayment({ userId: user._id });

    payment.paymentMethod = paymentMethod as any;
    payment.payoutFrequency = payoutFrequency as any;
    payment.ntnNumber = ntnNumber;

    if (paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') {
      const mobile = (formData.get('mobileNumber') as string)?.trim();
      const title  = (formData.get('accountTitle') as string)?.trim();
      if (!mobile || !title) {
        return NextResponse.json({ error: 'Mobile number and account title are required.' }, { status: 422 });
      }
      payment.mobileNumber = mobile;
      payment.accountTitle = title;
    }

    if (paymentMethod === 'bank') {
      const bankName     = (formData.get('bankName') as string)?.trim();
      const accountNum   = (formData.get('accountNumber') as string)?.trim();
      const iban         = (formData.get('iban') as string)?.trim();
      const titleBank    = (formData.get('accountTitle') as string)?.trim();
      if (!bankName || !accountNum || !titleBank) {
        return NextResponse.json({ error: 'Bank name, account number, and account title are required.' }, { status: 422 });
      }
      payment.bankName      = bankName;
      payment.accountNumber = accountNum;
      payment.iban          = iban;
      payment.accountTitle  = titleBank;
    }

    // Upload CNIC images to Supabase if provided
    const cnicFrontFile = formData.get('cnicFront') as File | null;
    const cnicBackFile  = formData.get('cnicBack')  as File | null;

    if (cnicFrontFile && cnicFrontFile.size > 0) {
      const bytes = await cnicFrontFile.arrayBuffer();
      payment.cnicFront = await uploadToSupabase(
        Buffer.from(bytes), cnicFrontFile.type,
        `cnic/${user._id}/front.${cnicFrontFile.type.split('/')[1]}`
      );
    }
    if (cnicBackFile && cnicBackFile.size > 0) {
      const bytes = await cnicBackFile.arrayBuffer();
      payment.cnicBack = await uploadToSupabase(
        Buffer.from(bytes), cnicBackFile.type,
        `cnic/${user._id}/back.${cnicBackFile.type.split('/')[1]}`
      );
    }

    payment.isPaymentComplete = true;
    await payment.save();

    if (user.onboardingStep < 6) { user.onboardingStep = 6; await user.save(); }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
