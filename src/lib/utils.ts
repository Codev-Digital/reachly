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
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #0C0C0C; color: #F9F6F2;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; color: #C8A97E; font-weight: bold;">Reachly</div>
        </div>

        <div style="background-color: rgba(200, 169, 126, 0.1); border: 1px solid rgba(200, 169, 126, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background-color: rgba(200, 169, 126, 0.1); border: 2px solid #C8A97E; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C8A97E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 30px; height: 30px;">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 style="font-family: Georgia, 'Times New Roman', serif; color: #C8A97E; margin: 0 0 10px; font-size: 24px;">Your booking is confirmed!</h1>
          <p style="color: rgba(249, 246, 242, 0.6); margin: 0;">Hi ${data.userName}, details below</p>
        </div>

        <div style="background-color: #141414; border: 1px solid rgba(200, 169, 126, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(249,246,242,0.5); margin-bottom: 4px;">Booking Reference</div>
            <div style="font-family: 'Courier New', monospace; font-size: 18px; color: #C8A97E; font-weight: bold; letter-spacing: 2px;">${data.bookingRef}</div>
          </div>
        </div>

        <div style="background-color: #141414; border: 1px solid rgba(200, 169, 126, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${data.creatorProfilePhoto}" alt="${data.creatorName}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(200, 169, 126, 0.4);">
            <div>
              <h4 style="font-family: Georgia, 'Times New Roman', serif; margin: 0 0 4px; font-size: 16px; color: #F9F6F2;">${data.creatorName}</h4>
              <p style="margin: 0; color: #C8A97E; font-size: 12px;">@${data.creatorUsername}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.07);">
            <div>
              <h5 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(249, 246, 242, 0.5); margin: 0 0 6px;">Date</h5>
              <p style="margin: 0; font-weight: 600; font-size: 14px; color: #F9F6F2;">${data.date}</p>
            </div>
            <div>
              <h5 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(249, 246, 242, 0.5); margin: 0 0 6px;">Time</h5>
              <p style="margin: 0; font-weight: 600; font-size: 14px; color: #F9F6F2;">${data.time} PKT</p>
            </div>
            <div>
              <h5 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(249, 246, 242, 0.5); margin: 0 0 6px;">Session</h5>
              <p style="margin: 0; font-weight: 600; font-size: 14px; color: #F9F6F2;">${data.sessionTitle}</p>
            </div>
            <div>
              <h5 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(249, 246, 242, 0.5); margin: 0 0 6px;">Duration</h5>
              <p style="margin: 0; font-weight: 600; font-size: 14px; color: #F9F6F2;">${data.sessionDuration}</p>
            </div>
          </div>
        </div>

        <div style="background-color: #141414; border: 1px solid rgba(200, 169, 126, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 16px; text-align: center;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background-color: rgba(200,169,126,0.1); border: 1px solid rgba(200,169,126,0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7z"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>
          <h4 style="font-family: Georgia, 'Times New Roman', serif; margin: 0 0 12px; color: #F9F6F2;">Your Google Meet Link</h4>
          <a href="${data.meetLink}" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 8px; background-color: #C8A97E; color: #0C0C0C; padding: 10px 24px; border-radius: 9999px; text-decoration: none; font-family: Georgia, 'Times New Roman', serif; font-weight: 600; margin: 12px 0;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0C0C0C" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7z"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            Join Google Meet
          </a>
          <div style="background-color: #0C0C0C; border: 1px solid rgba(200, 169, 126, 0.2); border-radius: 8px; padding: 10px 14px; font-family: 'Courier New', monospace; font-size: 12px; color: rgba(249, 246, 242, 0.5); word-break: break-all;">${data.meetLink}</div>
        </div>

        <div style="background-color: #141414; border: 1px solid rgba(200, 169, 126, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 16px;">
          <h4 style="color: #C8A97E; font-family: Georgia, 'Times New Roman', serif; margin: 0 0 12px;">Before Your Session</h4>
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="display: flex; align-items: center; gap: 8px; color: rgba(249, 246, 242, 0.7); font-size: 13px; margin-bottom: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C8A97E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Test your camera and microphone
            </li>
            <li style="display: flex; align-items: center; gap: 8px; color: rgba(249, 246, 242, 0.7); font-size: 13px; margin-bottom: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C8A97E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Find a quiet, well-lit space
            </li>
            <li style="display: flex; align-items: center; gap: 8px; color: rgba(249, 246, 242, 0.7); font-size: 13px; margin-bottom: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C8A97E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Prepare your questions in advance
            </li>
            <li style="display: flex; align-items: center; gap: 8px; color: rgba(249, 246, 242, 0.7); font-size: 13px; margin-bottom: 8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C8A97E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Join the call 2 minutes early
            </li>
          </ul>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center; color: rgba(249, 246, 242, 0.4); font-size: 12px;">
          <p style="margin: 0;">Sent by Reachly</p>
          <p style="margin-top: 8px;">If you have questions, reply to this email or reach out to support</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  // Strip any surrounding quotes that .env parsers sometimes leave in
  const user = (process.env.SMTP_USER || '').replace(/^["']|["']$/g, '');
  // Gmail app passwords are 16 chars — strip spaces if accidentally included
  const pass = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '').replace(/\s/g, '').replace(/^["']|["']$/g, '');

  if (!host || !user || !pass) {
    console.log('------- EMAIL (SMTP not configured) -------');
    console.log(`TO:      ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY:    ${html.replace(/<[^>]+>/g, '')}`);
    console.log('-------------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }, // allow self-signed certs in dev
  });

  await transporter.sendMail({
    from: `"Reachly" <${user}>`,
    to,
    subject,
    html,
  });
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
