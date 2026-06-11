import nodemailer from 'nodemailer';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Dev fallback: log OTP to console so devs can test without SMTP
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
