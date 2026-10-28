import nodemailer from 'nodemailer';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateBookingConfirmationEmail = (data: {
  bookingRef: string;
  creatorName: string;
  creatorUsername: string;
  creatorProfilePhoto: string;
  sessionTitle: string;
  sessionDuration: string;
  date: string;
  time: string;
  userName: string;
  userEmail: string;
  whatsapp: string;
  whatToDiscuss?: string;
  meetLink: string;
}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Booking is Confirmed!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F7FA; color: #0C0C0C;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 28px; color: #0012FF; font-weight: 900; letter-spacing: -1px;">REACHLY</div>
        </div>

        <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="width: 64px; height: 64px; border-radius: 50%; background-color: #EEF2FF; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0012FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px;">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #111827;">Your booking is confirmed!</h1>
          <p style="color: #6B7280; margin: 0; font-size: 15px;">Hi ${data.userName}, you are all set.</p>
        </div>

        <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div>
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; font-weight: 600; margin-bottom: 4px;">Booking Reference</div>
            <div style="font-family: 'Courier New', monospace; font-size: 18px; color: #0012FF; font-weight: 800; letter-spacing: 1px;">${data.bookingRef}</div>
          </div>
        </div>

        <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${data.creatorProfilePhoto}" alt="${data.creatorName}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #E5E7EB;">
            <div>
              <h4 style="margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #111827;">${data.creatorName}</h4>
              <p style="margin: 0; color: #6B7280; font-size: 14px; font-weight: 500;">@${data.creatorUsername}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #F3F4F6;">
            <div>
              <h5 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin: 0 0 8px; font-weight: 600;">Date</h5>
              <p style="margin: 0; font-weight: 700; font-size: 15px; color: #111827;">${data.date}</p>
            </div>
            <div>
              <h5 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin: 0 0 8px; font-weight: 600;">Time</h5>
              <p style="margin: 0; font-weight: 700; font-size: 15px; color: #111827;">${data.time} PKT</p>
            </div>
            <div>
              <h5 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin: 0 0 8px; font-weight: 600;">Session</h5>
              <p style="margin: 0; font-weight: 700; font-size: 15px; color: #111827;">${data.sessionTitle}</p>
            </div>
            <div>
              <h5 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin: 0 0 8px; font-weight: 600;">Duration</h5>
              <p style="margin: 0; font-weight: 700; font-size: 15px; color: #111827;">${data.sessionDuration}</p>
            </div>
          </div>
        </div>

        <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px; margin-bottom: 24px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background-color: #EEF2FF; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0012FF" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7z"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>
          <h4 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #111827;">Your Meeting Link</h4>
          <a href="${data.meetLink}" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 8px; background-color: #0012FF; color: #FFFFFF; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 15px; margin-bottom: 16px; box-shadow: 0 4px 14px 0 rgba(0, 18, 255, 0.39);">
            Join Meeting
          </a>
          <div style="background-color: #F3F4F6; border-radius: 8px; padding: 12px 16px; font-family: 'Courier New', monospace; font-size: 13px; color: #4B5563; word-break: break-all;">${data.meetLink}</div>
        </div>

        <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h4 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 16px;">Before Your Session</h4>
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="display: flex; align-items: center; gap: 12px; color: #4B5563; font-size: 15px; margin-bottom: 12px; font-weight: 500;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0012FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; flex-shrink: 0;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Test your camera and microphone
            </li>
            <li style="display: flex; align-items: center; gap: 12px; color: #4B5563; font-size: 15px; margin-bottom: 12px; font-weight: 500;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0012FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; flex-shrink: 0;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Find a quiet, well-lit space
            </li>
            <li style="display: flex; align-items: center; gap: 12px; color: #4B5563; font-size: 15px; margin-bottom: 12px; font-weight: 500;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0012FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; flex-shrink: 0;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Prepare your questions in advance
            </li>
            <li style="display: flex; align-items: center; gap: 12px; color: #4B5563; font-size: 15px; font-weight: 500;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0012FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; flex-shrink: 0;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Join the call 2 minutes early
            </li>
          </ul>
        </div>

        <div style="margin-top: 40px; padding-top: 24px; text-align: center; color: #9CA3AF; font-size: 13px;">
          <p style="margin: 0; font-weight: 600;">Sent by REACHLY</p>
          <p style="margin-top: 8px;">If you have questions, reply to this email or reach out to support</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export function getOtpEmailTemplate(
  fullName: string,
  otp: string,
  title: string = 'Account Verification'
): string {
  const otpString = String(otp || '').padStart(6, '0');
  const currentYear = new Date().getFullYear();
  const displayName = (fullName || 'User').trim() || 'User';

  let instruction =
    'Thank you for creating an account. Please use the following 6-digit verification code to complete your registration:';
  const lowerTitle = (title || '').toLowerCase();
  if (
    lowerTitle.includes('password') ||
    lowerTitle.includes('reset') ||
    lowerTitle.includes('verification code')
  ) {
    instruction =
      'Please use the following 6-digit verification code to reset your password and secure your account:';
  } else if (lowerTitle.includes('change')) {
    instruction =
      'Please use the following 6-digit verification code to confirm your email change:';
  } else if (lowerTitle.includes('verify') && !lowerTitle.includes('welcome')) {
    instruction =
      'Please use the following 6-digit verification code to verify your account:';
  }

  const subtitle = title || 'Account Verification';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link
    href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap"
    rel="stylesheet"
  >
  <title>Reachly - ${subtitle}</title>
</head>
<body
  style="
    margin: 0;
    padding: 0;
    width: 100%;
    background-color: #f2f4f4;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <!-- Outer Wrapper Table -->
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      width: 100%;
      background-color: #f2f4f4;
      margin: 0;
      padding: 0;
    "
  >
    <tr>
      <td
        align="center"
        style="
          padding: 30px 15px;
          background-color: #f2f4f4;
        "
      >
        <!-- Main Card Container -->
        <table
          width="650"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width: 100%;
            max-width: 650px;
            background-color: #ffffff;
            border-radius: 8px;
          "
        >
          <tr>
            <td style="padding: 30px;">
              <!-- Header -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td
                    align="left"
                    style="padding-bottom: 20px;"
                  >
                    <!-- Brand Logo -->
                    <img
                      src="https://nkmneyqkztlogibyecsz.supabase.co/storage/v1/object/public/reachly/assets/reachly-logo.png"
                      alt="Reachly"
                      width="135"
                      style="
                        width: 135px;
                        max-width: 135px;
                        height: auto;
                        display: block;
                        border: 0;
                        margin: 0 0 12px 0;
                        padding: 0;
                      "
                    >
                    <!-- Subtitle -->
                    <p
                      style="
                        margin: 0;
                        color: #64748b;
                        font-family: 'Ubuntu', Arial, Helvetica, sans-serif;
                        font-size: 16px;
                        font-weight: 400;
                        line-height: 18px;
                      "
                    >
                      ${subtitle}
                    </p>
                  </td>
                </tr>
              </table>
              <!-- Content Body -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td
                    align="left"
                    style="padding: 25px 0;"
                  >
                    <!-- Greeting -->
                    <p
                      style="
                        margin: 0 0 20px 0;
                        color: #475569;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 18px;
                        line-height: 24px;
                      "
                    >
                      Hello <strong>${displayName}</strong>,
                    </p>
                    <!-- Instructions -->
                    <p
                      style="
                        margin: 0 0 20px 0;
                        color: #475569;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 18px;
                        line-height: 24px;
                      "
                    >
                      ${instruction}
                    </p>
                    <!-- 6-digit OTP Box -->
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      align="center"
                      style="margin: 20px auto 25px auto;"
                    >
                      <tr>
                        <td
                          align="center"
                          valign="middle"
                          style="
                            background-color: #EEF2FF;
                            border: 1px solid #DDE5FF;
                            border-radius: 8px;
                            padding: 16px 28px;
                            color: #0012FF;
                            font-family: 'Ubuntu', Arial, Helvetica, sans-serif;
                            font-size: 32px;
                            font-weight: 700;
                            letter-spacing: 10px;
                            line-height: 40px;
                          "
                        >
                          ${otpString}
                        </td>
                      </tr>
                    </table>
                    <!-- Expiry Note -->
                    <p
                      style="
                        margin: 20px 0 15px 0;
                        color: #475569;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 18px;
                        line-height: 24px;
                      "
                    >
                      This code will expire in
                      <strong>10 minutes</strong>.
                      If you did not request this, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
              <!-- Footer -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td
                    align="center"
                    style="padding-top: 14px;"
                  >
                    <p
                      style="
                        margin: 0;
                        color: #94a3b8;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 15px;
                      "
                    >
                      &copy; ${currentYear} Reachly. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const generateOTPEmail = (
  name: string,
  otp: string,
  title: string = 'Verify your email'
): string => {
  return getOtpEmailTemplate(name, otp, title);
};

export const generateEventModerationEmail = (
  name: string,
  action: 'hidden' | 'deleted',
  eventTitle: string,
  eventImage: string
): string => {
  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[char] || char);
  const hidden = action === 'hidden';
  const safeName = escapeHtml(name || 'Creator');
  const safeTitle = escapeHtml(eventTitle);
  const safeImage = /^https?:\/\//i.test(eventImage) ? escapeHtml(eventImage) : '';
  const message = hidden
    ? 'Our team has hidden this event from public view. You can contact Reachly support if you believe this was a mistake.'
    : 'Our team has removed this event from public view. The event record has been retained for platform records.';

  return `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Event update</title></head>
<body style="margin:0;padding:0;background:#f2f4f4;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f4;padding:30px 15px">
    <tr><td align="center">
      <table role="presentation" width="650" cellpadding="0" cellspacing="0" style="width:100%;max-width:650px;background:#fff;border-radius:12px">
        <tr><td style="padding:30px">
          <img src="https://nkmneyqkztlogibyecsz.supabase.co/storage/v1/object/public/reachly/assets/reachly-logo.png" alt="Reachly" width="135" style="display:block;width:135px;height:auto;margin-bottom:16px;border:0">
          <p style="margin:0;color:#64748b;font-size:15px">Creator account update</p>
          <div style="padding:26px 0">
            <p style="margin:0 0 16px;color:#475569;font-size:16px;line-height:24px">Hello <strong>${safeName}</strong>,</p>
            <h1 style="margin:0 0 12px;color:#111827;font-size:23px;line-height:30px">${hidden ? 'Your event has been hidden' : 'Your event has been removed'}</h1>
            <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:24px">${message}</p>
            ${safeImage ? `<img src="${safeImage}" alt="${safeTitle}" width="590" style="display:block;width:100%;max-width:590px;height:auto;max-height:260px;object-fit:cover;border-radius:8px;margin:0 0 16px">` : ''}
            <div style="padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#f8f9fc">
              <p style="margin:0 0 5px;color:#94a3b8;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Event</p>
              <p style="margin:0;color:#111827;font-size:17px;font-weight:bold">${safeTitle}</p>
            </div>
            <p style="margin:20px 0 0;color:#64748b;font-size:13px;line-height:21px">If you have questions, please contact the Reachly support team.</p>
          </div>
          <p style="margin:0;text-align:center;color:#94a3b8;font-size:13px">&copy; ${new Date().getFullYear()} Reachly. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

const htmlToText = (html: string): string =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

let cachedTransporter: nodemailer.Transporter | null = null;
let lastTransporterConfigKey = '';

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  // Strip any surrounding quotes that .env parsers sometimes leave in
  const clean = (value?: string) => (value || '').trim().replace(/^["']|["']$/g, '');

  const host = clean(process.env.EMAIL_HOST);
  const port = parseInt(clean(process.env.EMAIL_PORT) || '587', 10);
  // EMAIL_SECURE=true means implicit TLS (port 465). false uses STARTTLS (port 587).
  const secure = process.env.EMAIL_SECURE
    ? clean(process.env.EMAIL_SECURE).toLowerCase() === 'true'
    : port === 465;
  const user = clean(process.env.EMAIL_USER);
  const pass = clean(process.env.EMAIL_PASS);
  const fromAddress = clean(process.env.EMAIL_FROM) || user;

  if (!host || !user || !pass) {
    console.log('------- EMAIL (EMAIL_* not configured) -------');
    console.log(`TO:      ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY:    ${htmlToText(html)}`);
    console.log('-------------------------------------------');
    return;
  }

  try {
    const configKey = `${host}:${port}:${secure}:${user}:${pass}`;
    if (!cachedTransporter || lastTransporterConfigKey !== configKey) {
      cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        tls: {
          rejectUnauthorized: false,
        },
      });
      lastTransporterConfigKey = configKey;
    }

    await cachedTransporter.sendMail({
      from: `"Reachly" <${fromAddress}>`,
      replyTo: clean(process.env.EMAIL_REPLY_TO) || fromAddress,
      to,
      subject,
      html,
      text: htmlToText(html),
    });
  } catch (error) {
    console.error('Email dispatch failed:', error);
  }
};

export const checkPasswordStrength = (
  password: string
): { strength: 'weak' | 'medium' | 'strong'; message: string } => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[a-z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^A-Za-z0-9]/)) score++;

  if (score <= 2) {
    return {
      strength: 'weak',
      message:
        'Weak — use at least 8 characters with uppercase, lowercase, numbers, and special characters.',
    };
  } else if (score <= 3) {
    return {
      strength: 'medium',
      message: 'Medium — add more special characters for better security.',
    };
  } else {
    return { strength: 'strong', message: 'Strong password!' };
  }
};
