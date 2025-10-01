"use client"

import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Providers } from "@/components/providers"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"   // ✅ Import Toaster
import "./globals.css"
import { Suspense } from "react"

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
        <Suspense fallback={null}>
          <Providers>
            <AuthProvider>
              {children}
              {/* ✅ Toaster goes here so toast notifications work globally */}
              <Toaster />
            </AuthProvider>
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
