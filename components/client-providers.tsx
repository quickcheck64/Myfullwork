"use client"

import { Suspense } from "react"
import { Providers } from "@/components/providers"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Providers>
        <AuthProvider>
          {children}
          <Toaster /> {/* ✅ Toasts now work globally */}
        </AuthProvider>
      </Providers>
    </Suspense>
  )
}
