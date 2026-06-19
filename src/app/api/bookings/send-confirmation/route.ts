import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateBookingConfirmationEmail } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      bookingRef,
      creatorName,
      creatorUsername,
      creatorProfilePhoto,
      sessionTitle,
      sessionDuration,
      date,
      time,
      userName,
      userEmail,
      whatsapp,
      whatToDiscuss,
      meetLink,
    } = body;

    if (!bookingRef || !creatorName || !userName || !userEmail || !sessionTitle || !date || !time || !meetLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailHtml = generateBookingConfirmationEmail({
      bookingRef,
      creatorName,
      creatorUsername,
      creatorProfilePhoto,
      sessionTitle,
      sessionDuration,
      date,
      time,
      userName,
      userEmail,
      whatsapp,
      whatToDiscuss,
      meetLink,
    });

    await sendEmail(
      userEmail,
      `Your Booking with ${creatorName} is Confirmed!`,
      emailHtml
    );

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
    });
  } catch (error: any) {
    console.error('Send booking confirmation email error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
