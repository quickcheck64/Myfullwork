import nodemailer from "nodemailer";

// Only authorized backend requests can send emails
const AUTH_TOKEN = process.env.API_AUTH_TOKEN; // set this in env

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { to, subject, html, text } = await request.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: to, subject, html",
        }),
        { status: 400 }
      );
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.log("[v1] Missing SMTP credentials");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        { status: 500 }
      );
    }

    // Create transporter for Zoho SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,       // SSL
      secure: true,    // must be true for port 465
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: `"Smart S9Trading" <${smtpUser}>`, // consistent sender
      to,
      subject,
      html,
      text: text || "", // fallback plain text
      headers: {
        "X-Mailer": "Smart S9Trading Mailer", // optional
      },
    });

    console.log("[v1] Email sent successfully:", info.messageId);

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[v1] Email API error:", error);
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
