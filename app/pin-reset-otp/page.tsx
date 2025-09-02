"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Mail, ArrowLeft, RefreshCw, Pickaxe } from "lucide-react"

export default function PinResetOtpPage() {
  const [otpCode, setOtpCode] = useState("")
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = sessionStorage.getItem("pinResetEmail")
      if (storedEmail) {
        setEmail(storedEmail)
      } else {
        toast({
          title: "Session Expired",
          description: "No email found for PIN reset. Please start again.",
          variant: "destructive",
        })
        router.push("/reset-pin")
      }
    }
  }, [router, toast])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please go back to PIN reset.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      await apiCall("/auth/verify-otp", "POST", { email, otp_code: otpCode, purpose: "pin_reset" })
      sessionStorage.setItem("pinResetOtp", otpCode)
      toast({
        title: "OTP Verified",
        description: "Redirecting to set new PIN...",
      })
      setTimeout(() => {
        router.push("/set-new-pin")
      }, 1500)
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "OTP verification failed.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    if (!email) {
      toast({
        title: "Error",
        description: "Email not found for OTP resend. Please go back to PIN reset.",
        variant: "destructive",
      })
      setIsResending(false)
      return
    }

    try {
      await apiCall("/api/request-otp", "POST", { email, purpose: "pin_reset" })
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email.",
      })
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend OTP.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-crypto-light via-crypto-muted to-crypto-secondary/20">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-crypto-primary to-crypto-accent text-white rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Pickaxe className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">Verify PIN Reset OTP</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-crypto-light rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-crypto-primary" />
              </div>
            </div>
            <p className="text-gray-600">An OTP has been sent to your email address for PIN reset.</p>
            {email && <p className="text-sm text-crypto-primary font-medium mt-2">{email}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="otpCode" className="text-gray-700 font-medium">
                OTP Code
              </Label>
              <Input
                id="otpCode"
                name="otpCode"
                type="text"
                maxLength={6}
                pattern="\d{6}"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                disabled={isLoading || isResending}
                className="mt-2 h-12 text-center text-lg font-mono tracking-widest border-gray-200 focus:border-crypto-primary focus:ring-crypto-primary"
                placeholder="000000"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-crypto-primary to-crypto-accent hover:from-crypto-primary/90 hover:to-crypto-accent/90 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading || isResending}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <Button
              type="button"
              onClick={handleResendOtp}
              className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg border border-gray-200 transition-all duration-200"
              disabled={isLoading || isResending}
            >
              {isResending ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Resending...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend OTP
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/reset-pin"
              className="inline-flex items-center text-crypto-primary hover:text-crypto-accent font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to PIN Reset
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
