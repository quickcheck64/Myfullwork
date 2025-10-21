import nodemailer from "nodemailer"

// Only authorized backend requests can send emails
const AUTH_TOKEN = process.env.API_AUTH_TOKEN // set this in your environment

export async function POST(request: Request) {
  try {
    // 🔐 Authorization check
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
      host: "smtp.zoho.com",  // Zoho Mail SMTP
      port: 465,              // SSL port
      secure: true,           // true for SSL
      auth: {
        user: smtpUser,       // your Zoho email
        pass: smtpPass,       // Zoho App Password
      },
    })

    // ✉️ Compose and send email
    const response = await transporter.sendMail({
      from: { name: "Smart S9Trading", address: smtpUser }, // ✅ proper name + address format
      to,
      subject,
      html,
      text: text || "", // optional fallback plain text
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
