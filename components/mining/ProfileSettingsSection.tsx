"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiCall } from "@/lib/api"

// -----------------------
// Formatting helpers
// -----------------------
const formatCrypto = (value: number | string | null | undefined, decimals = 6) => {
  const num = Number(value) || 0
  return num.toFixed(decimals)
}

const formatUSD = (value: number | string | null | undefined) => {
  const num = Number(value) || 0
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// -----------------------
// User Profile Interface
// -----------------------
interface UserProfile {
  id: number
  user_id: string
  name: string
  email?: string
  status: string
  is_admin: boolean
  is_agent: boolean
  is_flagged: boolean
  usd_balance: number | string
  bitcoin_balance: number | string
  ethereum_balance: number | string
  bitcoin_balance_usd: number | string
  ethereum_balance_usd: number | string
  total_balance_usd: number | string
  bitcoin_wallet?: string
  ethereum_wallet?: string
  personal_mining_rate?: number
  referral_code?: string
  email_verified: boolean
  birthday_day?: number
  birthday_month?: number
  birthday_year?: number
  gender?: string
  user_country_code?: string
  zip_code?: string
  created_at: string
  referred_users_count?: number
}

// -----------------------
// Profile Component
// -----------------------
export default function ProfileSettingsCard() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const data = await apiCall("/api/user/profile", "GET", null, true)
      setUser(data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <User className="h-6 w-6" />
          <span>User Profile</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {isLoading ? "Loading..." : "Active"}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchProfile}
            className="text-white hover:bg-white/20 p-1"
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-white/80 text-center py-4">Loading profile data...</p>}

        {!isLoading && user && (
          <>
            {/* Portfolio Overview */}
            <div className="space-y-2">
              <p>Total Portfolio Value: ${formatUSD(user.total_balance_usd)}</p>
              <p>
                Bitcoin Balance: {formatCrypto(user.bitcoin_balance)} BTC (~${formatUSD(user.bitcoin_balance_usd)})
              </p>
              <p>
                Ethereum Balance: {formatCrypto(user.ethereum_balance)} ETH (~${formatUSD(user.ethereum_balance_usd)})
              </p>
            </div>

            {/* Profile Details */}
            <div className="space-y-2">
              <p>Name: {user.name}</p>
              <p>Email: {user.email ?? "N/A"}</p>
              <p>
                Birthday:{" "}
                {user.birthday_day && user.birthday_month
                  ? `${user.birthday_day}/${user.birthday_month}${user.birthday_year ? `/${user.birthday_year}` : ""}`
                  : "N/A"}
              </p>
              <p>Referral Code: {user.referral_code ?? "N/A"}</p>
              <p>Referred Users: {user.referred_users_count ?? 0}</p>
              <p>Bitcoin Wallet: {user.bitcoin_wallet ?? "N/A"}</p>
              <p>Ethereum Wallet: {user.ethereum_wallet ?? "N/A"}</p>
            </div>
          </>
        )}

        {!isLoading && !user && <p className="text-white/80 text-center">No profile data found</p>}
      </CardContent>
    </Card>
  )
}
