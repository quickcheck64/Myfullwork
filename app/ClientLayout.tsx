"use client"

import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeProvider } from "next-themes"
import { Toaster } from "react-hot-toast"
import { Suspense } from "react"
// <CHANGE> Added React Query imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import "./globals.css"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // <CHANGE> Create QueryClient instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body>
        {/* <CHANGE> Wrapped with QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <Suspense fallback={null}>
                {children}
                <Toaster />
              </Suspense>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
