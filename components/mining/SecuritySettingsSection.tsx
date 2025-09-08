"use client"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PinInput } from "@/components/ui/pin-input"
import { Shield, Lock, Key, ArrowLeft, Settings, Eye, EyeOff } from "lucide-react"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface SecuritySettingsSectionProps {
  onReturnToDashboard: () => void
}

function ChangePinForm({ onBack }: { onBack: () => void }) {
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const changePinMutation = useMutation({
    mutationFn: (data: { current_pin: string; new_pin: string }) => apiCall("/api/change-pin", "POST", data, true),
    onSuccess: () => {
      toast({
        title: "PIN Changed Successfully",
        description: "Your security PIN has been updated.",
      })
      setCurrentPin("")
      setNewPin("")
      setConfirmPin("")
      onBack()
    },
    onError: (error: any) => {
      toast({
        title: "PIN Change Failed",
        description: error.message || "Failed to change PIN",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = () => {
    if (!currentPin || !newPin || !confirmPin) {
      toast({
        title: "Missing Information",
        description: "Please fill in all PIN fields",
        variant: "destructive",
      })
      return
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      })
      return
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "New PIN and confirmation don't match",
        variant: "destructive",
      })
      return
    }

    if (currentPin === newPin) {
      toast({
        title: "Same PIN",
        description: "New PIN must be different from current PIN",
        variant: "destructive",
      })
      return
    }

    changePinMutation.mutate({
      current_pin: currentPin,
      new_pin: newPin,
    })
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Change PIN</h1>
            <p className="text-muted-foreground">Update your 4-digit security PIN</p>
          </div>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Security PIN</CardTitle>
                <p className="text-muted-foreground text-sm">Enter your current and new PIN</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Label htmlFor="current-pin" className="text-sm font-medium text-card-foreground mb-3 block">
                Current PIN
              </Label>
              <div className="flex justify-center">
                <PinInput
                  id="current-pin"
                  name="current-pin"
                  length={4}
                  required
                  value={currentPin}
                  onChange={setCurrentPin}
                  disabled={changePinMutation.isPending}
                />
              </div>
            </div>

            <div className="text-center">
              <Label htmlFor="new-pin" className="text-sm font-medium text-card-foreground mb-3 block">
                New PIN
              </Label>
              <div className="flex justify-center">
                <PinInput
                  id="new-pin"
                  name="new-pin"
                  length={4}
                  required
                  value={newPin}
                  onChange={setNewPin}
                  disabled={changePinMutation.isPending}
                />
              </div>
            </div>

            <div className="text-center">
              <Label htmlFor="confirm-pin" className="text-sm font-medium text-card-foreground mb-3 block">
                Confirm New PIN
              </Label>
              <div className="flex justify-center">
                <PinInput
                  id="confirm-pin"
                  name="confirm-pin"
                  length={4}
                  required
                  value={confirmPin}
                  onChange={setConfirmPin}
                  disabled={changePinMutation.isPending}
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">PIN Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Must be exactly 4 digits</li>
                <li>• Avoid sequential numbers (1234)</li>
                <li>• Don't use easily guessable dates</li>
                <li>• Must be different from current PIN</li>
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={changePinMutation.isPending || !currentPin || !newPin || !confirmPin}
              className="w-full"
            >
              {changePinMutation.isPending ? "Changing PIN..." : "Change PIN"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ChangePasswordForm({ onBack }: { onBack: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const changePasswordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      apiCall("/api/change-password", "POST", data, true),
    onSuccess: () => {
      toast({
        title: "Password Changed Successfully",
        description: "Your account password has been updated.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      onBack()
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      toast({
        title: "Weak Password",
        description: "Password must contain uppercase, lowercase, and numbers",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match",
        variant: "destructive",
      })
      return
    }

    if (currentPassword === newPassword) {
      toast({
        title: "Same Password",
        description: "New password must be different from current password",
        variant: "destructive",
      })
      return
    }

    changePasswordMutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    })
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Change Password</h1>
            <p className="text-muted-foreground">Update your account password</p>
          </div>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Account Password</CardTitle>
                <p className="text-muted-foreground text-sm">Enter your current and new password</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Password Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Include at least one number</li>
                <li>• Must be different from current password</li>
              </ul>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SecuritySettingsSection({ onReturnToDashboard }: SecuritySettingsSectionProps) {
  const [activeForm, setActiveForm] = useState<"main" | "changePin" | "changePassword">("main")

  if (activeForm === "changePin") {
    return <ChangePinForm onBack={() => setActiveForm("main")} />
  }

  if (activeForm === "changePassword") {
    return <ChangePasswordForm onBack={() => setActiveForm("main")} />
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Security Settings</h1>
            <p className="text-muted-foreground">Manage your account security and authentication</p>
          </div>
          <Button onClick={onReturnToDashboard} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Security Overview */}
        <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Account Security</CardTitle>
                <p className="text-primary-foreground/80 text-sm">Keep your mining account secure</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/90 text-sm mb-1">Security Status</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-400/30">
                    Secure
                  </Badge>
                  <span className="text-sm">All security features enabled</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/80 text-sm">Last Updated</p>
                <p className="font-semibold">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Change PIN */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveForm("changePin")}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Change PIN</CardTitle>
                  <p className="text-muted-foreground text-sm">Update your 4-digit security PIN</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current PIN Status</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  Update PIN
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveForm("changePassword")}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Change Password</CardTitle>
                  <p className="text-muted-foreground text-sm">Update your account password</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Password Strength</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Strong
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Security Best Practices</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">PIN Security</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use a unique 4-digit combination</li>
                  <li>• Avoid sequential numbers (1234)</li>
                  <li>• Don't use easily guessable dates</li>
                  <li>• Change your PIN regularly</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Password Security</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use at least 8 characters</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Add numbers and special characters</li>
                  <li>• Don't reuse passwords from other accounts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
