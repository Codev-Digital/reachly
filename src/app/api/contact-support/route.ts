import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { sendEmail } from "@/lib/utils";
import ContactMessage from "@/models/ContactMessage";

const SUPPORT_EMAIL = "support@reachly.pk";
// const SUPPORT_EMAIL = "bilalwdev26@gmail.com";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email" },
        { status: 400 },
      );
    }

    if (
      fullName.length > 120 ||
      subject.length > 180 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields are too long" },
        { status: 400 },
      );
    }

    await connectDB();
    await ContactMessage.create({ fullName, email, subject, message });

    await sendEmail(
      SUPPORT_EMAIL,
      `Contact Support: ${subject}`,
      `
        <div style="margin:0;background:#f4f7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#172033;">
          <div style="max-width:640px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#011f7a 0%,#011139 55%,#4e1f40 100%);padding:28px 32px;border-radius:16px 16px 0 0;">
              <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#b9c9ff;font-weight:700;">Reachly Support</div>
              <h1 style="margin:10px 0 0;color:#ffffff;font-size:26px;line-height:1.25;font-weight:700;">New Contact Support Message</h1>
              <p style="margin:8px 0 0;color:#d9e1ff;font-size:14px;">A visitor submitted a message through the contact form.</p>
            </div>

            <div style="background:#ffffff;padding:30px 32px;border:1px solid #e3e8f0;border-top:0;border-radius:0 0 16px 16px;">
              <div style="border-left:4px solid #4e1f40;background:#faf7fb;padding:16px 18px;margin-bottom:24px;">
                <div style="font-size:12px;color:#697386;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px;">Subject</div>
                <div style="font-size:20px;color:#172033;font-weight:700;line-height:1.35;">${escapeHtml(subject)}</div>
              </div>

              <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:26px;">
                <tr>
                  <td style="width:50%;padding:0 12px 0 0;vertical-align:top;">
                    <div style="font-size:11px;color:#697386;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px;">From</div>
                    <div style="font-size:15px;color:#172033;font-weight:600;">${escapeHtml(fullName)}</div>
                  </td>
                  <td style="width:50%;padding:0 0 0 12px;vertical-align:top;">
                    <div style="font-size:11px;color:#697386;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px;">Email</div>
                    <a href="mailto:${escapeHtml(email)}" style="font-size:15px;color:#2454c6;text-decoration:none;word-break:break-word;">${escapeHtml(email)}</a>
                  </td>
                </tr>
              </table>

              <div style="border-top:1px solid #e8ecf2;padding-top:22px;">
                <div style="font-size:11px;color:#697386;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px;">Message</div>
                <div style="background:#f7f9fc;border:1px solid #e5eaf2;border-radius:10px;padding:18px;color:#354052;font-size:15px;line-height:1.7;white-space:normal;">${escapeHtml(message).replace(/\n/g, "<br />")}</div>
              </div>

              <p style="margin:26px 0 0;color:#8993a5;font-size:12px;line-height:1.5;">Reply directly to the visitor at <a href="mailto:${escapeHtml(email)}" style="color:#2454c6;text-decoration:none;">${escapeHtml(email)}</a>.</p>
            </div>

            <p style="margin:18px 0 0;text-align:center;color:#8993a5;font-size:12px;">Reachly contact support</p>
          </div>
        </div>
      `,
    );

    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Contact support POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
