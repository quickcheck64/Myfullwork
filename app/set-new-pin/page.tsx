"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PinInput } from "@/components/ui/pin-input"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Shield, Lock, CheckCircle, XCircle, Pickaxe } from "lucide-react"

export default function SetNewPinPage() {
  const [newPin, setNewPin] = useState("")
  const [confirmNewPin, setConfirmNewPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = sessionStorage.getItem("pinResetEmail")
      const storedOtp = sessionStorage.getItem("pinResetOtp")
      if (storedEmail && storedOtp) {
        setEmail(storedEmail)
        setOtpCode(storedOtp)
      } else {
        toast({
          title: "Session Expired",
          description: "PIN reset session expired. Please restart the process.",
          variant: "destructive",
        })
        router.push("/reset-pin")
      }
    }
  }, [router, toast])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    if (newPin !== confirmNewPin) {
      toast({
        title: "PIN Mismatch",
        description: "PINs do not match.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be a 4-digit number.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!email || !otpCode) {
      toast({
        title: "Session Error",
        description: "PIN reset session invalid. Please restart.",
        variant: "destructive",
      })
      router.push("/reset-pin")
      setIsLoading(false)
      return
    }

    try {
      await apiCall("/auth/reset-pin", "POST", {
        email,
        otp_code: otpCode,
        new_pin: newPin,
      })
      toast({
        title: "PIN Reset",
        description: "New PIN set successfully! Redirecting to PIN verification...",
      })
      sessionStorage.removeItem("pinResetEmail")
      sessionStorage.removeItem("pinResetOtp")
      router.push("/pin-verify-login")
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to set new PIN.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crypto-primary via-crypto-dark to-crypto-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-crypto-primary to-crypto-accent rounded-2xl flex items-center justify-center mb-4">
            <Pickaxe className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-crypto-primary to-crypto-accent bg-clip-text text-transparent">
            Set Your New PIN
          </CardTitle>
          <p className="text-gray-600 text-sm mt-2">Create a secure 4-digit PIN for your mining account</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPin" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                New PIN
              </Label>
              <div className="flex justify-center">
                <PinInput
                  id="newPin"
                  name="newPin"
                  length={4}
                  required
                  value={newPin}
                  onChange={setNewPin}
                  disabled={isLoading}
                />
              </div>
              {newPin.length === 4 && /^\d{4}$/.test(newPin) && (
                <div className="flex items-center gap-2 text-crypto-success text-sm justify-center">
                  <CheckCircle className="w-4 h-4" />
                  Valid PIN format
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPin" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm New PIN
              </Label>
              <div className="flex justify-center">
                <PinInput
                  id="confirmNewPin"
                  name="confirmNewPin"
                  length={4}
                  required
                  value={confirmNewPin}
                  onChange={setConfirmNewPin}
                  disabled={isLoading}
                />
              </div>
              {confirmNewPin.length === 4 && (
                <div className="flex items-center gap-2 text-sm justify-center">
                  {newPin === confirmNewPin ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-crypto-success" />
                      <span className="text-crypto-success">PINs match</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-crypto-error" />
                      <span className="text-crypto-error">PINs don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-crypto-primary to-crypto-accent hover:from-crypto-primary/90 hover:to-crypto-accent/90 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading || newPin !== confirmNewPin || newPin.length !== 4}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting PIN...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Set New PIN
                </div>
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
            <Link
              href="/login"
              className="text-sm text-crypto-primary hover:text-crypto-accent font-medium transition-colors duration-200"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
