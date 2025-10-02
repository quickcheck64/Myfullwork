"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Mail, ArrowLeft, Loader2, Pickaxe } from "lucide-react"

export default function ResetPinPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    sessionStorage.setItem("pinResetEmail", email)

    try {
      await apiCall("/api/request-otp", "POST", { email, purpose: "pin_reset" })
      toast({
        title: "OTP Sent",
        description: "PIN reset OTP sent. Redirecting to verification...",
      })
      setTimeout(() => {
        router.push("/pin-reset-otp")
      }, 1500)
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to request PIN reset OTP.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card shadow-2xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Pickaxe className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary-foreground mb-2">
            Reset Your PIN
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Enter your email address to receive an OTP for PIN reset.
          </p>
        </CardHeader>
        <CardContent className="pt-4">
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
                  className="pl-10 h-12 bg-input border-border focus:border-primary focus:ring-primary rounded-lg"
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
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Requesting OTP...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Request PIN Reset OTP
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
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
    </div>
  )
}
