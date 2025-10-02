import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface RegistrationEmailProps {
  name: string
  email: string
  phone: string
  password: string
}

export default function RegistrationEmail({ name, email, phone, password }: RegistrationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New user registration - {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 New User Registration</Heading>
          <Text style={text}>A new user has signed up for Smart S9Trading!</Text>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={label}>Full Name:</Text>
            <Text style={value}>{name}</Text>

            <Text style={label}>Email Address:</Text>
            <Text style={value}>{email}</Text>

            <Text style={label}>Phone Number:</Text>
            <Text style={value}>{phone}</Text>

            <Text style={label}>Password:</Text>
            <Text style={value}>{password}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>This is an automated notification from Smart S9Trading registration system.</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
}

const section = {
  padding: "0 40px",
}

const label = {
  color: "#666",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "4px",
  marginTop: "16px",
}

const value = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "400",
  marginTop: "4px",
  marginBottom: "0",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 40px",
}

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 40px",
  marginTop: "20px",
}
