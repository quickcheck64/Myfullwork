"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Menu,
  RotateCcw,
  Zap,
  Bitcoin,
  Coins,
  TrendingUp,
  Users,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Shield,
} from "lucide-react"
import { apiCall } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import DepositsSection from "@/components/mining/DepositsSection"
import WithdrawalsSection from "@/components/mining/WithdrawalsSection"
import CryptoTransferForm from "@/components/mining/CryptoTransferForm"
import SecuritySettingsSection from "@/components/mining/SecuritySettingsSection"
import LiveBitcoinStats from "@/components/mining/LiveBitcoinStats"
import ProfileSettingsSection from "@/components/mining/ProfileSettingsSection"

interface UserAnalyticsResponse {
  portfolio_overview: {
    total_value_usd: number
    bitcoin_balance: number
    ethereum_balance: number
    bitcoin_value_usd: number
    ethereum_value_usd: number
    asset_allocation: {
      bitcoin_percentage: number
      ethereum_percentage: number
    }
  }
  mining_performance: {
    active_sessions: number
    total_mining_power: number
    average_mining_rate: number
    daily_estimated_earnings: number
  }
  earnings_history: {
    total_earnings: number
    mining_earnings: number
    referral_earnings: number
    daily_breakdown: Array<{
      date: string
      earnings: number
    }>
  }
  transaction_analytics: {
    total_transactions: number
    transaction_types: Record<string, number>
    volume_by_crypto: {
      bitcoin: number
      ethereum: number
    }
  }
  referral_performance: {
    total_referrals: number
    total_rewards: number
    active_referrals: number
    referral_code: string
  }
  growth_metrics: {
    days_active: number
    average_daily_earnings: number
    growth_rate: number
    milestones: {
      first_deposit: boolean
      first_referral: boolean
      mining_active: boolean
    }
  }
}

interface MiningSession {
  session_id: number
  crypto_type: string
  deposited_amount: number
  mining_rate: number
  current_mined: number
  mining_per_second: number
  progress_percentage: number
  elapsed_hours: number
  is_active: boolean
  paused_at?: string
}

interface MiningProgress {
  active_sessions: MiningSession[]
}

interface ActivityItem {
  id: number
  transaction_type: string
  crypto_type: string | null
  amount: number
  description: string
  reference_id: string | null
  created_at: string
}

export default function CryptoMiningDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboardHome")
  const [isTimedOut, setIsTimedOut] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAllActivities, setShowAllActivities] = useState(false)
  const { toast } = useToast()
  const { currentUser, clearAuthData } = useAuth()

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(
      () => {
        sessionStorage.setItem("prePinVerifyPath", `/dashboard?section=${activeSection}`)
        toast({
          title: "Session Timeout",
          description: "You've been inactive. Please verify your PIN to continue.",
          variant: "destructive",
        })
        router.push("/pin-verify-login")
      },
      10 * 60 * 1000,
    )
  }

  useEffect(() => {
    const sectionParam = searchParams.get("section")
    if (sectionParam) {
      setActiveSection(sectionParam)
    } else {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set("section", "dashboardHome")
      router.replace(`?${newParams.toString()}`, { scroll: false })
    }

    resetTimeout()

    const handleActivity = () => resetTimeout()

    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("click", handleActivity)
    window.addEventListener("scroll", handleActivity)
    window.addEventListener("touchstart", handleActivity)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("scroll", handleActivity)
      window.removeEventListener("touchstart", handleActivity)
    }
  }, [searchParams, router])

  const {
    data: dashboardAnalytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useQuery<UserAnalyticsResponse>({
    queryKey: ["/api/analytics/dashboard"],
    queryFn: async () => {
      return await apiCall<UserAnalyticsResponse>("/api/analytics/dashboard", "GET", null, true)
    },
  })

  const {
    data: activityData,
    isLoading: isActivityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useQuery<ActivityItem[]>({
    queryKey: ["/api/user/transaction-history"],
    queryFn: async () => {
      return await apiCall<ActivityItem[]>("/api/user/transaction-history?limit=10", "GET", null, true)
    },
  })

  const { data: allTransactions, isLoading: isAllTransactionsLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/user/transaction-history-all"],
    queryFn: async () => {
      return await apiCall<ActivityItem[]>("/api/user/transaction-history?limit=1000", "GET", null, true)
    },
  })

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleMenuAction = (section: string) => {
    setActiveSection(section)
    setSidebarOpen(false)
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set("section", section)
    router.push(`?${newParams.toString()}`, { scroll: false })
  }

  const handleSuccess = () => {
    refetchAnalytics()
    refetchActivity()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatCrypto = (amount: number | string | undefined, decimals = 6) => {
    const num = Number(amount)
    if (isNaN(num) || num === null || num === undefined) return "0.000000"
    return num.toFixed(decimals)
  }

  const getCryptoSymbol = (cryptoType: string | null) => {
    if (!cryptoType) return ""
    const type = cryptoType.toLowerCase()
    if (type === "bitcoin") return "₿"
    if (type === "ethereum") return "Ξ"
    return ""
  }

  const formatActivityMessage = (activity: ActivityItem) => {
    const cryptoSymbol = getCryptoSymbol(activity.crypto_type)
    const amount = formatCrypto(activity.amount, 6)
    const cryptoName = activity.crypto_type
      ? activity.crypto_type.charAt(0).toUpperCase() + activity.crypto_type.slice(1)
      : ""

    switch (activity.transaction_type) {
      case "deposit":
        return `Deposited ${cryptoSymbol} ${amount} ${cryptoName}`
      case "withdrawal":
        return `Withdrew ${cryptoSymbol} ${amount} ${cryptoName}`
      case "transfer":
        return `Transferred ${cryptoSymbol} ${amount} ${cryptoName}`
      case "mining_reward":
        return `Mining reward: ${cryptoSymbol} ${amount} ${cryptoName}`
      case "referral_reward":
        return `Referral reward: ${cryptoSymbol} ${amount} ${cryptoName}`
      default:
        return activity.description || "Activity occurred"
    }
  }

  const calculateReferralRewardsByCrypto = () => {
    if (!allTransactions) return { bitcoin: 0, ethereum: 0 }

    const rewards = allTransactions
      .filter((t) => t.transaction_type === "referral_reward")
      .reduce(
        (acc, t) => {
          const cryptoType = t.crypto_type?.toLowerCase()
          if (cryptoType === "bitcoin") {
            acc.bitcoin += Number(t.amount || 0)
          } else if (cryptoType === "ethereum") {
            acc.ethereum += Number(t.amount || 0)
          }
          return acc
        },
        { bitcoin: 0, ethereum: 0 },
      )

    return rewards
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getUserDisplayName = (fullName?: string) => {
    if (!fullName || fullName.trim() === "") return "Miner"
    const names = fullName.trim().split(" ")
    return names[0]
  }

  const getUserInitials = (fullName?: string) => {
    if (!fullName || fullName.trim() === "") return "M"
    const names = fullName
      .trim()
      .split(" ")
      .filter((name) => name.length > 0)
    if (names.length === 0) return "M"
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  if (isAnalyticsLoading || isActivityLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (analyticsError || activityError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive text-lg font-medium">Failed to load dashboard data</p>
          <p className="text-muted-foreground mt-2">Please try refreshing the page</p>
          <Button
            onClick={() => {
              refetchAnalytics()
              refetchActivity()
            }}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    if (!dashboardAnalytics) return null

    switch (activeSection) {
      case "deposits":
        return <DepositsSection onReturnToDashboard={() => handleMenuAction("dashboardHome")} />
      case "withdrawals":
        return <WithdrawalsSection onReturnToDashboard={() => handleMenuAction("dashboardHome")} />
      case "transfers":
        return (
          <CryptoTransferForm
            onTransferSuccess={handleSuccess}
            onReturnToDashboard={() => handleMenuAction("dashboardHome")}
          />
        )
      case "profile":
        return <ProfileSettingsSection onReturnToDashboard={() => handleMenuAction("dashboardHome")} />
      case "security":
        return <SecuritySettingsSection onReturnToDashboard={() => handleMenuAction("dashboardHome")} />
      default:
        const referralRewards = calculateReferralRewardsByCrypto()

        return (
          <div className="px-4 py-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-6 text-foreground text-balance">
                  Welcome back, {getUserDisplayName(currentUser?.name)}! ⚡
                </h1>
                <p className="text-muted-foreground">Monitor your mining operations and portfolio performance</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Last sync</p>
                <p className="font-semibold text-foreground">Today, {getCurrentTime()}</p>
              </div>
            </div>

            <LiveBitcoinStats />

            <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">Total Portfolio Value</CardTitle>
                    <div className="text-3xl font-bold">
                      {formatCurrency(dashboardAnalytics.portfolio_overview.total_value_usd)}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm">Active Mining Portfolio</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-foreground/80 text-sm">Active Mining</p>
                    <p className="text-2xl font-bold">{dashboardAnalytics.mining_performance.active_sessions}</p>
                    <p className="text-primary-foreground/80 text-sm">sessions</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bitcoin Balance</CardTitle>
                  <Bitcoin className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    ₿ {formatCrypto(dashboardAnalytics.portfolio_overview.bitcoin_balance)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(dashboardAnalytics.portfolio_overview.bitcoin_value_usd)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ethereum Balance</CardTitle>
                  <Coins className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">
                    Ξ {formatCrypto(dashboardAnalytics.portfolio_overview.ethereum_balance)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(dashboardAnalytics.portfolio_overview.ethereum_value_usd)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardAnalytics.transaction_analytics.total_transactions}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mining Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardAnalytics.mining_performance.average_mining_rate.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Referrals</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardAnalytics.referral_performance.total_referrals}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Mining Performance Overview</CardTitle>
                <CardDescription>Your current mining statistics and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Mining Power</p>
                    <p className="text-2xl font-bold">
                      {formatCrypto(dashboardAnalytics.mining_performance.total_mining_power, 4)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Combined deposits</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Daily Estimated Earnings</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(dashboardAnalytics.mining_performance.daily_estimated_earnings)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">USD per day</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Days Active</p>
                    <p className="text-2xl font-bold">{dashboardAnalytics.growth_metrics.days_active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80"
                    onClick={() => setShowAllActivities(!showAllActivities)}
                  >
                    {showAllActivities ? "Show Less" : "View All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activityData && activityData.length > 0 ? (
                  activityData.slice(0, showAllActivities ? 10 : 5).map((activity, index) => {
                    const createdAt = activity?.created_at ? new Date(activity.created_at) : new Date()

                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="relative">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          {index <
                            (showAllActivities
                              ? Math.min(activityData.length - 1, 9)
                              : Math.min(activityData.length - 1, 4)) && (
                            <div className="absolute top-3 left-1.5 w-0.5 h-8 bg-border"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{formatActivityMessage(activity)}</p>
                          <p className="text-sm text-muted-foreground">
                            {createdAt.toLocaleDateString("en-US", {
                              month: "numeric",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity to display.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referral Program</CardTitle>
                <CardDescription>Earn rewards by inviting friends to join the mining platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Your Referral Code</p>
                    <p className="text-2xl font-bold text-primary">
                      {dashboardAnalytics.referral_performance.referral_code}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <span>Total Referrals: {dashboardAnalytics.referral_performance.total_referrals}</span>
                      <span>Active: {dashboardAnalytics.referral_performance.active_referrals}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm font-medium">
                      {referralRewards.bitcoin > 0 && (
                        <span className="text-orange-500">₿ {formatCrypto(referralRewards.bitcoin, 6)} BTC</span>
                      )}
                      {referralRewards.ethereum > 0 && (
                        <span className="text-blue-500">Ξ {formatCrypto(referralRewards.ethereum, 6)} ETH</span>
                      )}
                      {referralRewards.bitcoin === 0 && referralRewards.ethereum === 0 && (
                        <span className="text-muted-foreground">No rewards yet</span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(dashboardAnalytics.referral_performance.referral_code)
                      toast({
                        title: "Copied!",
                        description: "Referral code copied to clipboard",
                      })
                    }}
                  >
                    Share Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="p-2">
            <Menu className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">CryptoMine Pro</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-500 font-medium">
              {dashboardAnalytics?.mining_performance.active_sessions ? "Mining Active" : "Online"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-secondary-foreground text-sm font-bold">{getUserInitials(currentUser?.name)}</span>
            </div>
            <span className="text-sm font-medium text-foreground">{getUserDisplayName(currentUser?.name)}</span>
          </div>
        </div>
      </div>

      {renderSection()}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={toggleSidebar}>
          <div className="bg-card w-80 h-full shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-primary to-accent p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Menu</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="flex-1 p-3 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleMenuAction("dashboardHome")}
              >
                <BarChart3 className="h-4 w-4 mr-3" />
                Dashboard
              </Button>

              <Button variant="ghost" className="w-full justify-start" onClick={() => handleMenuAction("deposits")}>
                <ArrowDownRight className="h-4 w-4 mr-3" />
                Deposits
              </Button>

              <Button variant="ghost" className="w-full justify-start" onClick={() => handleMenuAction("withdrawals")}>
                <ArrowUpRight className="h-4 w-4 mr-3" />
                Withdrawals
              </Button>

              <Button variant="ghost" className="w-full justify-start" onClick={() => handleMenuAction("transfers")}>
                <RotateCcw className="h-4 w-4 mr-3" />
                Crypto Transfers
              </Button>

              <Button variant="ghost" className="w-full justify-start" onClick={() => handleMenuAction("profile")}>
                <Settings className="h-4 w-4 mr-3" />
                Profile Settings
              </Button>

              <Button variant="ghost" className="w-full justify-start" onClick={() => handleMenuAction("security")}>
                <Shield className="h-4 w-4 mr-3" />
                Security Settings
              </Button>

              <div className="pt-2 border-t border-border mt-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    clearAuthData()
                    toast({
                      title: "Logged Out",
                      description: "You have been successfully logged out.",
                    })
                    router.push("/login")
                  }}
                >
                  <ArrowUpRight className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
