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
                    // Show WhatsApp, hide JivoChat
                    wa.classList.add("active");
                    jivo.style.opacity = "0";
                    jivo.style.pointerEvents = "none";
                    jivo.style.zIndex = "1"; // Push JivoChat behind
                  } else {
                    // Show JivoChat, hide WhatsApp
                    wa.classList.remove("active");
                    jivo.style.opacity = "1";
                    jivo.style.pointerEvents = "auto";
                    jivo.style.zIndex = "99999"; // Bring JivoChat back
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
                    showWhatsApp(false); // Start with JivoChat

                    setInterval(() => {
                      const showWA = Math.random() > 0.5;
                      showWhatsApp(showWA);
                    }, 15000); // Every 15 seconds
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
                transition: opacity 1s ease-in-out, transform 0.5s ease-in-out;
                z-index: 100000; /* Higher than JivoChat */
              }
              .chat-widget.active {
                opacity: 1;
                pointer-events: auto;
                transform: scale(1.05);
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
