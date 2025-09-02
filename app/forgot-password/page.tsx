"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Mail, Shield, ArrowLeft, Loader2, Pickaxe } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    sessionStorage.setItem("forgotPasswordEmail", email)

    try {
      await apiCall("/api/request-otp", "POST", { email, purpose: "password_reset" })
      toast({
        title: "OTP Sent",
        description: "Password reset OTP sent. Redirecting to verification...",
      })
      setTimeout(() => {
        router.push("/forgot-password-otp")
      }, 1500)
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to request password reset OTP.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 backdrop-blur-sm rounded-2xl mb-4">
            <Pickaxe className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground">We'll help you reset it securely</p>
        </div>

        <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center text-card-foreground">Reset Your Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-accent/50 border border-border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-card-foreground font-medium">Password Reset Process</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your email address and we'll send you a secure OTP to reset your password.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-12 bg-input border-border focus:border-primary focus:ring-primary"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Requesting OTP...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Request Password Reset OTP
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-border">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm">Secure crypto mining platform</p>
        </div>
      </div>
    </div>
  )
}
