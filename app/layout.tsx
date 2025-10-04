import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Crypto Trading Platform",
  description: "Professional cryptocurrency Smart S9Trading dashboard",
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

        {/* ✅ Chat Widgets Container */}
        <div id="chat-container">
          {/* JivoChat Widget */}
          <div id="jivochat-widget" class="chat-widget">
            <script src="//code.jivosite.com/widget/nYkjqWua55" async></script>
          </div>

          {/* WhatsApp Widget */}
          <div id="whatsapp-widget" class="chat-widget">
            <a
              href="https://wa.me/234XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="Chat on WhatsApp"
                width="60"
                height="60"
              />
            </a>
          </div>
        </div>

        {/* ✅ Fade Toggle Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const widgets = ["jivochat-widget", "whatsapp-widget"];
              let current = 0;

              function toggleWidgets() {
                const currentEl = document.getElementById(widgets[current]);
                const next = Math.random() > 0.5 ? 1 - current : current;
                const nextEl = document.getElementById(widgets[next]);

                if (currentEl && nextEl && nextEl !== currentEl) {
                  currentEl.classList.remove("active");
                  nextEl.classList.add("active");
                  current = next;
                }
              }

              document.addEventListener("DOMContentLoaded", () => {
                const first = document.getElementById(widgets[current]);
                if (first) first.classList.add("active");
                setInterval(toggleWidgets, 15000); // Switch every 15s
              });
            `,
          }}
        />

        {/* ✅ Chat Widget Styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                transition: opacity 1s ease-in-out;
                opacity: 0;
                pointer-events: none;
                z-index: 9999;
              }
              .chat-widget.active {
                opacity: 1;
                pointer-events: auto;
              }

              @media (max-width: 640px) {
                .chat-widget {
                  bottom: 15px;
                  right: 15px;
                }
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
