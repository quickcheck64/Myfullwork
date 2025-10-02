import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ClientProviders } from "@/components/client-providers" // ✅ wrap client-only providers
import "./globals.css"

export const metadata: Metadata = {
  title: "Crypto Mining Platform",
  description: "Professional cryptocurrency mining dashboard",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
