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

        {/* ✅ Google Analytics (unchanged) */}
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

        {/* ✅ Official Telegram Floating Button (Animated) */}
        <a
          href="https://t.me/SmartS9Trading" // 🔹 replace with your Telegram link
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 bg-[#0088cc] hover:bg-[#007ab8] text-white p-3 rounded-full shadow-lg transition-all duration-300 z-[9999] flex items-center justify-center animate-telegramPulse"
          aria-label="Chat on Telegram"
        >
          {/* ✅ Official Telegram Paper Plane Logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 240 240"
            className="w-8 h-8 fill-current"
          >
            <circle cx="120" cy="120" r="120" fill="#0088cc" />
            <path
              fill="#ffffff"
              d="M179 73.3l-24 113.3c-1.8 8.1-6.7 10.1-13.6 6.3l-37.7-27.9-18.1 17.4c-2 2-3.7 3.7-7.3 3.7l2.6-39.1 70.3-63.7c3-2.7-0.7-4.2-4.6-1.5l-86.9 54.6-37.4-11.8c-8.1-2.6-8.2-8.1 1.6-11.9l145.3-56c6.8-2.4 12.8 1.6 10.6 11.1z"
            />
          </svg>
        </a>

        {/* ✅ Animation Styles */}
        <style jsx global>{`
          @keyframes telegramPulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(0, 136, 204, 0.6);
            }
            70% {
              transform: scale(1.08);
              box-shadow: 0 0 15px 10px rgba(0, 136, 204, 0);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(0, 136, 204, 0);
            }
          }
          .animate-telegramPulse {
            animation: telegramPulse 2.5s infinite ease-in-out;
          }
        `}</style>
      </body>
    </html>
  )
}
