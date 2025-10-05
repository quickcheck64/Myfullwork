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

        {/* ✅ JivoChat Widget (hidden by default) */}
        <script
          src="//code.jivosite.com/widget/nYkjqWua55"
          async
        ></script>
        <style>{`
          /* Hide default Jivo floating button */
          #jivo-iframe-container,
          .jivo-btn,
          #jivo_chat_widget {
            display: none !important;
          }
        `}</style>

        {/* ✅ WhatsApp Floating Button */}
        <a
          href="https://wa.me/2348100000000"  /* <-- Replace with your WhatsApp number */
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
          style={{ fontSize: "22px" }}
        >
          💬
        </a>
      </body>
    </html>
  )
}
