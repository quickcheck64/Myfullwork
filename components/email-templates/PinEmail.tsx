// components/email-templates/PinEmail.tsx
interface PinEmailProps {
  name: string
  email: string
  pin: string
}

export default function PinEmail({ name, email, pin }: PinEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ color: "#059669" }}>New PIN Created</h2>
      <p>A new 4-digit PIN has been set by the user:</p>
      <div
        style={{
          background: "#f3f4f6",
          padding: "20px",
          borderRadius: "8px",
          margin: "20px 0",
        }}
      >
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>PIN:</strong> {pin}</p>
      </div>
      <p style={{ color: "#6b7280" }}>
        This is an automated notification. Do not reply to this email.
      </p>
    </div>
  )
}
