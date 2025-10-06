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

        {/* ✅ WhatsApp Floating Button */}
        <a
          href="https://wa.me/2348100000000" // replace with your real number
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-[9999] flex items-center justify-center"
          aria-label="Chat on WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="currentColor"
            className="w-8 h-8"
          >
            <path d="M16.003 3C9.374 3 4 8.374 4 15.003c0 2.65.842 5.099 2.276 7.137L4 29l7.077-2.26A11.947 11.947 0 0 0 16.003 27C22.632 27 28 21.626 28 14.997 28 8.374 22.632 3 16.003 3zm5.88 17.238c-.247.693-1.423 1.32-1.962 1.36-.503.038-1.146.054-1.844-.117-.424-.103-.97-.316-1.676-.62-2.946-1.273-4.858-4.144-5.01-4.337-.147-.193-1.198-1.592-1.198-3.038 0-1.446.757-2.157 1.027-2.455.27-.297.592-.372.79-.372.198 0 .395.002.568.01.186.009.442-.071.693.53.25.6.847 2.08.922 2.23.073.147.121.316.025.51-.097.193-.146.315-.293.482-.146.168-.31.374-.44.504-.146.147-.298.31-.128.607.17.297.758 1.253 1.63 2.03 1.12.996 2.065 1.308 2.362 1.457.297.147.466.122.637-.073.17-.195.73-.85.924-1.143.193-.292.392-.244.662-.146.27.098 1.732.818 2.03.967.297.147.495.22.568.343.073.122.073.711-.174 1.403z" />
          </svg>
        </a>
      </body>
    </html>
  )
}
