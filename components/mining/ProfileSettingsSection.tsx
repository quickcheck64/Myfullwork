"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiCall, formatCrypto } from "@/lib/api"

interface UserProfile {
  id: number
  user_id: string
  name: string
  email?: string
  status: string
  is_admin: boolean
  is_agent: boolean
  is_flagged: boolean
  usd_balance: number
  bitcoin_balance: number
  ethereum_balance: number
  bitcoin_balance_usd: number
  ethereum_balance_usd: number
  total_balance_usd: number
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

export default function ProfileSettingsSection() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const data = await apiCall("/api/user/profile", "GET", null, true)
      setUser(data)
    } catch (err: any) {
      setError(err.message || "Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  if (isLoading) return <p>Loading profile...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!user) return <p>No profile data found</p>

  return (
    <div className="min-h-screen p-4 bg-background space-y-6">
      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Total Portfolio Value: ${user.total_balance_usd ?? 0}</p>
          <p>Bitcoin Balance: {formatCrypto(user.bitcoin_balance)} BTC (~${user.bitcoin_balance_usd})</p>
          <p>Ethereum Balance: {formatCrypto(user.ethereum_balance)} ETH (~${user.ethereum_balance_usd})</p>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p>Name: {user.name}</p>
            <p>Email: {user.email ?? "N/A"}</p>
            <p>Birthday: {user.birthday_day && user.birthday_month ? `${user.birthday_day}/${user.birthday_month}${user.birthday_year ? `/${user.birthday_year}` : ""}` : "N/A"}</p>
          </div>
          <div>
            <p>Referral Code: {user.referral_code ?? "N/A"}</p>
            <p>Referred Users: {user.referred_users_count ?? 0}</p>
          </div>
          <div>
            <p>Bitcoin Wallet: {user.bitcoin_wallet ?? "N/A"}</p>
            <p>Ethereum Wallet: {user.ethereum_wallet ?? "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
