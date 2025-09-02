"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Key, ArrowLeft, Settings } from "lucide-react"

interface SecuritySettingsSectionProps {
  onReturnToDashboard: () => void
}

export default function SecuritySettingsSection({ onReturnToDashboard }: SecuritySettingsSectionProps) {
  const [activeForm, setActiveForm] = useState<"main" | "changePin" | "changePassword">("main")

  if (activeForm === "changePin") {
    // Import and use the existing ChangePinForm component
    return <div>Change PIN Form would go here</div>
  }

  if (activeForm === "changePassword") {
    // Import and use the existing ChangePasswordForm component
    return <div>Change Password Form would go here</div>
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
