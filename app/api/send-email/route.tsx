import nodemailer from "nodemailer"

// 🔐 Only authorized backend requests can send emails
const AUTH_TOKEN = process.env.API_AUTH_TOKEN // set this securely in environment variables

export async function POST(request: Request) {
  try {
    // 🔒 Authorization check
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // 📨 Parse and validate request body
    const { to, subject, html, text } = await request.json()
    if (!to || !subject || !html) {
      return Response.json(
        { success: false, error: "Missing required fields: to, subject, html" },
        { status: 400 }
      )
    }

    // 🔑 SMTP credentials
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    if (!smtpUser || !smtpPass) {
      console.log("[v1] Missing SMTP credentials")
      return Response.json(
        { success: false, error: "Email service not configured" },
        { status: 500 }
      )
    }

    // ⚙️ Setup Zoho Mail SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // ✉️ Compose and send email
    const response = await transporter.sendMail({
      from: `"Smart S9Trading"`, // ✅ Only display name, no exposed email
      to,
      subject,
      html,
      text: text || "",
    })

    console.log("[v1] Email sent successfully:", response.messageId)

    return Response.json({ success: true, messageId: response.messageId })
  } catch (error: any) {
    console.error("[v1] Email API error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to send email",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}
