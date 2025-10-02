import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import RegistrationEmail from "../../../components/email-templates/RegistrationEmail";

export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    // Validate required fields
    const { name, email, phone } = data;
    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({ success: false, error: "Name, email, and phone are required" }),
        { status: 400 }
      );
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const receiverEmail = process.env.RECEIVER_EMAIL;

    if (!smtpUser || !smtpPass || !receiverEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
    });

    const timestamp = new Date().toISOString();
    const subject = `New Signup - ${name} (${email}) [${timestamp}]`;
    const emailHtml = render(<RegistrationEmail name={name} email={email} phone={phone} />);

    await transporter.sendMail({
      from: `"Smart S9Trading" <${smtpUser}>`,
      to: receiverEmail,
      subject,
      html: emailHtml,
      text: `New signup from ${name} (${email}), phone: ${phone}`,
    });

    console.log("[v0] Signup email sent successfully");
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error("[v0] Signup Email API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to send signup email",
        details: error?.message || "Unknown error",
      }),
      { status: 500 }
    );
  }
}
