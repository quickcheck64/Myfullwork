"use client"

import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { useEffect, useState } from "react"

interface AdminSettings {
  bitcoin_rate_usd: number
  ethereum_rate_usd: number
  global_mining_rate: number | undefined
  bitcoin_wallet_address: string
  ethereum_wallet_address: string
  referral_reward_enabled: boolean
  referral_reward_type: string
  referrer_reward_percent: number
}

interface User {
  id: string
  personal_mining_rate: number | undefined
}

const AdminPage = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    bitcoin_rate_usd: 0,
    ethereum_rate_usd: 0,
    global_mining_rate: undefined, // Initialize as undefined
    bitcoin_wallet_address: "",
    ethereum_wallet_address: "",
    referral_reward_enabled: false,
    referral_reward_type: "percentage",
    referrer_reward_percent: 0,
  })

  const [settingsForm, setSettingsForm] = useState<AdminSettings>({
    bitcoin_rate_usd: 0,
    ethereum_rate_usd: 0,
    global_mining_rate: undefined, // Initialize as undefined
    bitcoin_wallet_address: "",
    ethereum_wallet_address: "",
    referral_reward_enabled: false,
    referral_reward_type: "percentage",
    referrer_reward_percent: 0,
  })

  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const userActionMutation = { isPending: false } // Placeholder for actual mutation state

  const handleUserAction = (userId: string, action: string, payload?: any) => {
    // Placeholder for actual user action handling
    console.log(`Handling user action ${action} for user ${userId}`, payload)
  }

  useEffect(() => {
    if (adminSettings) {
      setSettingsForm(adminSettings)
      setSettings({
        bitcoin_rate_usd: adminSettings.bitcoin_rate_usd || 0,
        ethereum_rate_usd: adminSettings.ethereum_rate_usd || 0,
        global_mining_rate: adminSettings.global_mining_rate,
        bitcoin_wallet_address: adminSettings.bitcoin_wallet_address || "",
        ethereum_wallet_address: adminSettings.ethereum_wallet_address || "",
        referral_reward_enabled: adminSettings.referral_reward_enabled || false,
        referral_reward_type: adminSettings.referral_reward_type || "percentage",
        referrer_reward_percent: adminSettings.referrer_reward_percent || 0,
      })
    }
  }, [adminSettings])

  return (
    <div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Global Mining Rate (%)</Label>
        <Input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*\.?[0-9]*"
          value={
            settingsForm.global_mining_rate !== undefined && settingsForm.global_mining_rate !== null
              ? settingsForm.global_mining_rate.toString()
              : ""
          }
          onChange={(e) => {
            const value = e.target.value
            console.log("[v0] Mining rate input changed:", value) // Debug log

            // Allow empty string
            if (value === "" || value === null) {
              setSettingsForm((prev) => ({ ...prev, global_mining_rate: undefined }))
              return
            }

            // Only allow valid number patterns
            if (!/^\d*\.?\d*$/.test(value)) {
              return // Don't update if invalid pattern
            }

            const numValue = Number.parseFloat(value)
            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
              console.log("[v0] Setting mining rate as whole number:", numValue) // Debug log
              setSettingsForm((prev) => ({ ...prev, global_mining_rate: numValue }))
            }
          }}
          placeholder="Enter percentage (e.g., 80 for 80%)"
        />
        <p className="text-xs text-muted-foreground">
          Default mining rate for all users. Individual users can have personal rates that override this.
        </p>
      </div>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Current Personal Rate</Label>
              <div className="text-2xl font-bold text-primary">
                {selectedUser?.personal_mining_rate
                  ? `${selectedUser.personal_mining_rate.toFixed(1)}%`
                  : "Using Global Rate"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Global Rate: {adminSettings ? `${adminSettings.global_mining_rate.toFixed(1)}%` : "Loading..."}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Label className="text-sm font-medium">Set Personal Mining Rate (%)</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Enter rate (e.g., 75 for 75%)"
                defaultValue={selectedUser?.personal_mining_rate ? selectedUser.personal_mining_rate.toFixed(1) : ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = (e.target as HTMLInputElement).value
                    if (value) {
                      const rateValue = Number(value)
                      handleUserAction(selectedUser?.id || "", "set-mining-rate", { mining_rate: rateValue })
                    } else {
                      handleUserAction(selectedUser?.id || "", "clear-mining-rate")
                    }
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement
                  const value = input?.value
                  if (value) {
                    const rateValue = Number(value)
                    handleUserAction(selectedUser?.id || "", "set-mining-rate", { mining_rate: rateValue })
                  } else {
                    handleUserAction(selectedUser?.id || "", "clear-mining-rate")
                  }
                }}
                disabled={userActionMutation.isPending}
              >
                <Save className="h-4 w-4 mr-1" />
                Set Rate
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUserAction(selectedUser?.id || "", "clear-mining-rate")}
              disabled={userActionMutation.isPending}
              className="w-full"
            >
              Clear Personal Rate (Use Global Rate)
            </Button>
            <p className="text-xs text-muted-foreground">
              Leave empty or clear to use the global mining rate. Personal rate overrides global rate when set.
            </p>
          </div>
        </div>
      </CardContent>
    </div>
  )
}

export default AdminPage
