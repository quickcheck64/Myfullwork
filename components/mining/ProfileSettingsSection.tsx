"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, Globe, Calendar, Clipboard, Id, Mail, Gift } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiCall } from "@/lib/api"

// Formatting helpers
const formatCrypto = (value: number | string | null | undefined, decimals = 6) => {
  const num = Number(value) || 0
  return num.toFixed(decimals)
}
const formatUSD = (value: number | string | null | undefined) => {
  const num = Number(value) || 0
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// User Profile Interface
interface UserProfile {
  id: number
  user_id: string
  name: string
  email?: string
  status: string
  usd_balance: number | string
  bitcoin_balance: number | string
  ethereum_balance: number | string
  bitcoin_balance_usd: number | string
  ethereum_balance_usd: number | string
  total_balance_usd: number | string
  referral_code?: string
  birthday_day?: number
  birthday_month?: number
  birthday_year?: number
  gender?: string
  user_country_code?: string
  zip_code?: string
  created_at: string
  referred_users_count?: number
}

export default function ProfileSettingsCard() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const data = await apiCall<UserProfile>("/api/user/profile", "GET", null, true)
      setUser(data)
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load profile", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const copyReferralCode = () => {
    if (!user?.referral_code) return
    navigator.clipboard.writeText(user.referral_code)
    toast({ title: "Copied!", description: "Referral code copied to clipboard", variant: "default" })
  }

  useEffect(() => { fetchProfile() }, [])

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl shadow-lg p-8 flex items-center justify-center min-h-[300px]">
        <User className="h-10 w-10 text-white animate-pulse" />
        <span className="ml-4 text-white text-lg">Loading profile...</span>
      </div>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
        <User className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <p className="text-red-500 text-lg mb-4">Failed to load profile</p>
        <Button onClick={fetchProfile} variant="outline">Retry</Button>
      </div>
    </div>
  )

  // Helper for hover effect item
  const ItemWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      {children}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Profile Settings</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your account and portfolio</p>
          </div>
          <Button onClick={() => window.location.href = "/dashboard"} variant="outline">Back to Dashboard</Button>
        </div>

        {/* Portfolio Card */}
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

            {/* User Info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold truncate">{user.name}</h2>
                  {user.status && (
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full
                      ${user.status.toLowerCase() === "verified" ? "bg-green-600 text-white" : "bg-blue-600 text-white"}`}>
                      {user.status}
                    </span>
                  )}
                </div>
                <p className="text-white/90 truncate">{user.email}</p>
              </div>
            </div>

            {/* Portfolio Summary */}
            <div className="flex-shrink-0 w-full md:w-auto max-w-full md:max-w-[220px] text-right space-y-1">
              <p className="text-white/80 text-xs">Total Portfolio</p>
              <p className="text-2xl font-bold whitespace-nowrap">${formatUSD(user.total_balance_usd)}</p>

              <div className="mt-2 space-y-1">
                <p className="text-white/80 text-xs truncate">
                  BTC: {formatCrypto(user.bitcoin_balance)} (~${formatUSD(user.bitcoin_balance_usd)})
                </p>
                <p className="text-white/80 text-xs truncate">
                  ETH: {formatCrypto(user.ethereum_balance)} (~${formatUSD(user.ethereum_balance_usd)})
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Grid: Profile Details + Referral */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Profile Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Profile Details</h3>
            </div>

            <ItemWrapper><Id className="h-4 w-4 text-gray-500 dark:text-gray-300" /><span><span className="font-bold">User ID:</span> {user.user_id}</span></ItemWrapper>
            <ItemWrapper><User className="h-4 w-4 text-gray-500 dark:text-gray-300" /><span><span className="font-bold">Name:</span> {user.name}</span></ItemWrapper>
            {user.email && <ItemWrapper><Mail className="h-4 w-4 text-gray-500 dark:text-gray-300" /><span><span className="font-bold">Email:</span> {user.email}</span></ItemWrapper>}
            {user.birthday_day && user.birthday_month && <ItemWrapper><Calendar className="h-4 w-4 text-gray-500 dark:text-gray-300" /><span>{user.birthday_day}/{user.birthday_month}{user.birthday_year ? `/${user.birthday_year}` : ""}</span></ItemWrapper>}
            {user.gender && <ItemWrapper><User className="h-4 w-4 text-gray-500 dark:text-gray-300" /><span><span className="font-bold">Gender:</span> {user.gender}</span></ItemWrapper>}
            {user.user_country_code && <ItemWrapper><Globe className="h-4 w-4 text-gray-500 dark:text-gray-300" /><span>{user.user_country_code}</span></ItemWrapper>}
            {user.zip_code && <ItemWrapper><Id className="h-4 w-4 text-gray-500 dark:text-gray-300" /><span><span className="font-bold">ZIP Code:</span> {user.zip_code}</span></ItemWrapper>}
          </div>

          {/* Referral Program */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Referral Program</h3>
            </div>

            {user.referral_code ? (
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg font-mono text-gray-900 dark:text-gray-100">{user.referral_code}</code>
                <Button size="sm" variant="outline" onClick={copyReferralCode}><Clipboard className="h-4 w-4" /></Button>
              </div>
            ) : <p className="text-gray-400 dark:text-gray-400">No referral code assigned</p>}

            {user.referred_users_count !== undefined && <ItemWrapper><User className="h-4 w-4 text-gray-500 dark:text-gray-300" /><span><span className="font-bold">Referred Users:</span> {user.referred_users_count}</span></ItemWrapper>}
          </div>

        </div>

        {/* Account Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-700 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-200" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Account Timeline</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Member Since</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Account Age</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000*60*60*24))} days
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
            }
