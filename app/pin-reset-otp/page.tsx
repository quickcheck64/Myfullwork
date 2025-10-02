"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Mail, ArrowLeft, Loader2, Pickaxe } from "lucide-react"

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
      await apiCall("/api/verify-otp", "POST", { email, otp_code: otpCode, purpose: "pin_reset" })
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="text-center p-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Pickaxe className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground mb-2">
            Verify PIN Reset OTP
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            An OTP has been sent to your email address for PIN reset.
          </p>
          {email && (
            <p className="text-sm text-primary font-medium mt-1">{email}</p>
          )}
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="otpCode" className="text-sm font-medium text-card-foreground">
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
                className="mt-2 h-12 text-center text-lg font-mono tracking-widest bg-input border-border focus:border-primary focus:ring-primary rounded-lg text-card-foreground placeholder:text-muted-foreground"
                placeholder="000000"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading || isResending}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <Button
              type="button"
              onClick={handleResendOtp}
              className="w-full h-12 bg-muted hover:bg-muted/90 text-muted-foreground font-medium rounded-lg shadow border border-border transition-all duration-200"
              disabled={isLoading || isResending}
            >
              {isResending ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Resending...
                </div>
              ) : (
                "Resend OTP"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/reset-pin"
              className="inline-flex items-center text-sm text-card-foreground hover:text-primary font-medium transition-colors duration-200"
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
