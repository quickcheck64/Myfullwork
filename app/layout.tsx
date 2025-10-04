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

        {/* ✅ JivoChat Script */}
        <script src="//code.jivosite.com/widget/nYkjqWua55" async></script>

        {/* ✅ WhatsApp Floating Widget */}
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

        {/* ✅ Toggle Logic */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function showWhatsApp(show) {
                const wa = document.getElementById("whatsapp-widget");
                const jivo = document.querySelector("#jivo-iframe-container");

                if (wa && jivo) {
                  if (show) {
                    wa.classList.add("active");
                    jivo.style.opacity = "0";
                    jivo.style.pointerEvents = "none";
                  } else {
                    wa.classList.remove("active");
                    jivo.style.opacity = "1";
                    jivo.style.pointerEvents = "auto";
                  }
                }
              }

              document.addEventListener("DOMContentLoaded", () => {
                // Wait for JivoChat iframe to load
                const checkJivo = setInterval(() => {
                  const jivo = document.querySelector("#jivo-iframe-container");
                  if (jivo) {
                    clearInterval(checkJivo);
                    jivo.style.transition = "opacity 1s ease-in-out";
                    showWhatsApp(false); // start with JivoChat

                    setInterval(() => {
                      const showWA = Math.random() > 0.5;
                      showWhatsApp(showWA);
                    }, 15000); // every 15 seconds
                  }
                }, 1000);
              });
            `,
          }}
        />

        {/* ✅ Styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                opacity: 0;
                pointer-events: none;
                transition: opacity 1s ease-in-out;
                z-index: 999999;
              }
              .chat-widget.active {
                opacity: 1;
                pointer-events: auto;
              }

              #jivo-iframe-container {
                transition: opacity 1s ease-in-out !important;
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
