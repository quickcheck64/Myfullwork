"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, CreditCard, Globe, Calendar } from "lucide-react"
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
    <Card className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg">
      {/* Header */}
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

      {/* Card Content */}
      <CardContent className="space-y-6">
        {isLoading && <p className="text-white/80 text-center py-4">Loading profile data...</p>}

        {!isLoading && user && (
          <>
            {/* Portfolio Overview */}
            <div className="bg-white/10 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-lg">Portfolio Overview</p>
              <p>Total Portfolio Value: <span className="font-bold">${formatUSD(user.total_balance_usd)}</span></p>
              <p>
                Bitcoin Balance: <span className="font-bold">{formatCrypto(user.bitcoin_balance)} BTC</span> (~${formatUSD(user.bitcoin_balance_usd)})
              </p>
              <p>
                Ethereum Balance: <span className="font-bold">{formatCrypto(user.ethereum_balance)} ETH</span> (~${formatUSD(user.ethereum_balance_usd)})
              </p>
            </div>

            {/* Profile Details */}
            <div className="bg-white/10 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-lg">Profile Details</p>
              <p><span className="font-bold">Name:</span> {user.name}</p>
              {user.email && <p><span className="font-bold">Email:</span> {user.email}</p>}
              {user.birthday_day && user.birthday_month && (
                <p className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-white/70" />
                  <span>{user.birthday_day}/{user.birthday_month}{user.birthday_year ? `/${user.birthday_year}` : ""}</span>
                </p>
              )}
              {user.gender && <p><span className="font-bold">Gender:</span> {user.gender}</p>}
              {user.user_country_code && (
                <p className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-white/70" />
                  <span>{user.user_country_code}</span>
                </p>
              )}
              {user.zip_code && <p><span className="font-bold">ZIP Code:</span> {user.zip_code}</p>}
              {user.referral_code && <p><span className="font-bold">Referral Code:</span> {user.referral_code}</p>}
              {user.referred_users_count !== undefined && <p><span className="font-bold">Referred Users:</span> {user.referred_users_count}</p>}
              {user.bitcoin_wallet && <p><span className="font-bold">Bitcoin Wallet:</span> {user.bitcoin_wallet}</p>}
              {user.ethereum_wallet && <p><span className="font-bold">Ethereum Wallet:</span> {user.ethereum_wallet}</p>}
            </div>
          </>
        )}

        {!isLoading && !user && <p className="text-white/80 text-center">No profile data found</p>}
      </CardContent>
    </Card>
  )
}
