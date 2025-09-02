"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { PinInput } from "@/components/ui/pin-input"
import { apiCall } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Shield, Lock, LogOut, Pickaxe } from "lucide-react"

export default function PinVerifyLoginPage() {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { clearAuthData } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      await apiCall("/api/verify-pin", "POST", { pin }, true)
      toast({
        title: "PIN Verified",
        description: "Accessing mining dashboard...",
      })

      const redirectToPath = sessionStorage.getItem("prePinVerifyPath") || "/dashboard"
      sessionStorage.removeItem("prePinVerifyPath")
      router.push(redirectToPath)
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid PIN. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuthData()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card shadow-2xl border-0 rounded-2xl overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pickaxe className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground mb-2">Security Verification</h1>
          <p className="text-primary-foreground/80 text-sm">Enter your PIN to access mining dashboard</p>
        </div>

        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Please enter your 4-digit PIN to securely access your mining dashboard and account features.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <Label htmlFor="pin" className="text-sm font-medium text-card-foreground mb-3 block">
                Enter PIN
              </Label>
              <div className="flex justify-center">
                <PinInput id="pin" name="pin" length={4} required value={pin} onChange={setPin} disabled={isLoading} />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying PIN...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Verify PIN</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t border-border">
            <Button
              type="button"
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 px-4 py-2 rounded-lg transition-colors bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>

            <Link
              href="/reset-pin"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Reset PIN
            </Link>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Your PIN helps keep your mining account secure. Never share it with anyone.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
