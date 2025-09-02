"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordInput } from "@/components/ui/password-input"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Shield, Lock, CheckCircle, XCircle, ArrowLeft, Pickaxe } from "lucide-react"

export default function NewPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const isPasswordValid = newPassword.length >= 8
  const doPasswordsMatch = newPassword === confirmNewPassword && confirmNewPassword.length > 0

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = sessionStorage.getItem("forgotPasswordEmail")
      const storedOtp = sessionStorage.getItem("forgotPasswordOtp")
      if (storedEmail && storedOtp) {
        setEmail(storedEmail)
        setOtpCode(storedOtp)
      } else {
        toast({
          title: "Session Expired",
          description: "Password reset session expired. Please restart the process.",
          variant: "destructive",
        })
        router.push("/forgot-password")
      }
    }
  }, [router, toast])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!email || !otpCode) {
      toast({
        title: "Session Error",
        description: "Password reset session invalid. Please restart.",
        variant: "destructive",
      })
      setTimeout(() => router.push("/forgot-password"), 2000)
      setIsLoading(false)
      return
    }

    try {
      await apiCall("/auth/reset-password", "POST", {
        email,
        otp_code: otpCode,
        new_password: newPassword,
      })
      toast({
        title: "Password Reset",
        description: "Password reset successfully! Redirecting to login...",
      })
      sessionStorage.removeItem("forgotPasswordEmail")
      sessionStorage.removeItem("forgotPasswordOtp")
      setTimeout(() => router.push("/login"), 1500)
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password.",
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Set New Password</h1>
          <p className="text-muted-foreground">Create a strong password for your account</p>
        </div>

        <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center text-card-foreground">Create New Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-card-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <PasswordInput
                    id="newPassword"
                    name="newPassword"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-12 bg-input border-border focus:border-primary focus:ring-primary"
                    placeholder="Enter new password"
                  />
                  {newPassword && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      {isPasswordValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {newPassword && (
                  <p className={`text-xs ${isPasswordValid ? "text-green-600" : "text-red-600"}`}>
                    {isPasswordValid ? "Password meets requirements" : "Password must be at least 8 characters"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword" className="text-sm font-medium text-card-foreground">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <PasswordInput
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-12 bg-input border-border focus:border-primary focus:ring-primary"
                    placeholder="Confirm new password"
                  />
                  {confirmNewPassword && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      {doPasswordsMatch ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {confirmNewPassword && (
                  <p className={`text-xs ${doPasswordsMatch ? "text-green-600" : "text-red-600"}`}>
                    {doPasswordsMatch ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>Setting Password...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Set New Password</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="bg-accent/50 border border-border rounded-lg p-4">
              <h4 className="font-semibold text-card-foreground mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Password Security Tips
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use at least 8 characters</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Add numbers and special characters</li>
                <li>• Avoid common words or personal information</li>
              </ul>
            </div>

            <div className="text-center pt-4 border-t border-border">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
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
