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
import { Shield, Check, X, Loader2, Pickaxe } from "lucide-react"

export default function CreatePinPage() {
  const [newPin, setNewPin] = useState("")
  const [confirmNewPin, setConfirmNewPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tempSignupData, setTempSignupData] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  const isPinValid = newPin.length === 4 && /^\d{4}$/.test(newPin)
  const pinsMatch = newPin === confirmNewPin && confirmNewPin.length === 4

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = sessionStorage.getItem("tempSignupData")
      if (storedData) {
        try {
          setTempSignupData(JSON.parse(storedData))
        } catch (e) {
          console.error("Failed to parse tempSignupData:", e)
          toast({
            title: "Session Error",
            description: "Signup session data is corrupted. Please start signup again.",
            variant: "destructive",
          })
          router.push("/signup")
        }
      } else {
        toast({
          title: "Session Expired",
          description: "No signup data found. Please start signup again.",
          variant: "destructive",
        })
        router.push("/signup")
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

    if (!tempSignupData || !tempSignupData.email) {
      toast({
        title: "Session Expired",
        description: "Signup session expired. Please start again.",
        variant: "destructive",
      })
      router.push("/signup")
      setIsLoading(false)
      return
    }

    const fullSignupData = {
      ...tempSignupData,
      pin: newPin,
    }

    try {
      await apiCall("/api/register", "POST", fullSignupData)
      toast({
        title: "Account Created",
        description: "Account created and PIN set successfully! Redirecting to login...",
      })
      sessionStorage.removeItem("tempSignupData")
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account or set PIN.",
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Your PIN</h1>
          <p className="text-muted-foreground">Set up a 4-digit PIN for quick access</p>
        </div>

        <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center text-card-foreground">
              Create Your 4-Digit PIN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <Label htmlFor="newPin" className="text-sm font-medium text-card-foreground mb-2 block">
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
                {newPin.length > 0 && (
                  <div className="flex items-center justify-center mt-2">
                    {isPinValid ? (
                      <div className="flex items-center text-green-600 text-sm">
                        <Check className="w-4 h-4 mr-1" />
                        Valid PIN
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 text-sm">
                        <X className="w-4 h-4 mr-1" />
                        PIN must be 4 digits
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-center">
                <Label htmlFor="confirmNewPin" className="text-sm font-medium text-card-foreground mb-2 block">
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
                {confirmNewPin.length > 0 && (
                  <div className="flex items-center justify-center mt-2">
                    {pinsMatch ? (
                      <div className="flex items-center text-green-600 text-sm">
                        <Check className="w-4 h-4 mr-1" />
                        PINs match
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 text-sm">
                        <X className="w-4 h-4 mr-1" />
                        PINs don't match
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading || !isPinValid || !pinsMatch}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating PIN...
                  </>
                ) : (
                  "Create PIN"
                )}
              </Button>
            </form>

            <div className="bg-accent/50 border border-border rounded-lg p-4">
              <h4 className="text-sm font-semibold text-card-foreground mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-primary" />
                Security Tips
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Choose a PIN that's easy for you to remember</li>
                <li>• Don't use obvious combinations like 1234 or 0000</li>
                <li>• Keep your PIN confidential and secure</li>
              </ul>
            </div>

            <div className="text-center pt-4 border-t border-border">
              <Link
                href="/login"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
              >
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
