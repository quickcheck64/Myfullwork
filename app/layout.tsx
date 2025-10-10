import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Crypto Trading Platform",
  description: "Professional cryptocurrency Smart S9 Trading dashboard",
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
        <Providers>{children}</Providers>

        {/* ✅ Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-MEGPH5HY68"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-MEGPH5HY68');
            `,
          }}
        />

        {/* ✅ Telegram Floating Button */}
        <a
          href="https://t.me/SmartS9Trading" // 🔹 replace with your actual Telegram username or group link
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-[9999] flex items-center justify-center"
          aria-label="Chat on Telegram"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 240 240"
            fill="currentColor"
            className="w-8 h-8"
          >
            <path d="M120 0C53.8 0 0 53.8 0 120s53.8 120 120 120 120-53.8 120-120S186.2 0 120 0zm54.5 81.3l-19.7 93c-1.5 6.8-5.6 8.5-11.3 5.3l-31.3-23.1-15.1 14.6c-1.7 1.7-3.1 3.1-6.3 3.1l2.3-32.9 59.9-54.2c2.6-2.3-0.6-3.6-4-1.3l-74.1 46.6-31.9-10c-6.9-2.2-7-6.9 1.4-10.1l124.4-48c5.8-2.1 10.9 1.4 9 10.1z" />
          </svg>
        </a>
      </body>
    </html>
  )
            }
