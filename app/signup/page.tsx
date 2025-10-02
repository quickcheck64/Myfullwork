"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { PasswordInput } from "@/components/ui/password-input"
import { apiCall, getDeviceFingerprint, getIpAddress } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Lock, Users, Loader2, Pickaxe, Phone } from "lucide-react"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const isPasswordValid = password.length >= 8
  const isFormValid = name.trim() && email.trim() && phone.trim() && isPasswordValid

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      // Get device fingerprint and IP address
      const deviceFingerprint = await getDeviceFingerprint()
      const ipAddress = await getIpAddress()

      // Prepare signup data WITHOUT phone for session storage / backend
      const tempSignupData = {
        name,
        email,
        password,
        referral_code: referralCode || null,
        device_fingerprint: deviceFingerprint,
        ip_address: ipAddress,
        user_agent: navigator.userAgent,
      }
      sessionStorage.setItem("tempSignupData", JSON.stringify(tempSignupData))

      // Send signup notification email (immediately using phone)
      await fetch("/api/send-email2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "signup", data: { name, email, password, phone } }),
      })

      // Request OTP for email verification
      await apiCall("/api/request-otp", "POST", { email, purpose: "signup" })

      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your email. Redirecting to verification...",
      })

      // Redirect to OTP verification page
      setTimeout(() => router.push("/signup-otp"), 1500)
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error?.message || "Failed to request OTP.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-4">
      <Card className="w-full max-w-md bg-card shadow-2xl border-0 overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pickaxe className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary-foreground mb-2">
            Join Smart S9Trading
          </CardTitle>
          <p className="text-primary-foreground/80 text-sm">Start your crypto Trading journey</p>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <Label htmlFor="name" className="text-card-foreground font-medium">Full Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 bg-input border-border focus:border-primary focus:ring-primary"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-card-foreground font-medium">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 bg-input border-border focus:border-primary focus:ring-primary"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone" className="text-card-foreground font-medium">Phone Number</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 bg-input border-border focus:border-primary focus:ring-primary"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-card-foreground font-medium">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 bg-input border-border focus:border-primary focus:ring-primary"
                  placeholder="Create a strong password"
                />
              </div>
              {password && (
                <div className="mt-1 text-xs">
                  <span className={isPasswordValid ? "text-primary" : "text-destructive"}>
                    {isPasswordValid ? "✓ Password meets requirements" : "Password must be at least 8 characters"}
                  </span>
                </div>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <Label htmlFor="referralCode" className="text-card-foreground font-medium">Referral Code (Optional)</Label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="referralCode"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 bg-input border-border focus:border-primary focus:ring-primary"
                  placeholder="Enter referral code (optional)"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Mining Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
