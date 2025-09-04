"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Menu,
  Clock,
  RotateCcw,
  Zap,
  Bitcoin,
  Coins,
  Activity,
  TrendingUp,
  Users,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Pause,
  RefreshCw,
  Shield,
} from "lucide-react"
import { apiCall } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import DepositsSection from "@/components/mining/DepositsSection"
import WithdrawalsSection from "@/components/mining/WithdrawalsSection"
import MiningSessionsSection from "@/components/mining/MiningSessionsSection"
import LiveBitcoinStats from "@/components/mining/LiveBitcoinStats"
import CryptoTransferForm from "@/components/mining/CryptoTransferForm"
import SecuritySettingsSection from "@/components/mining/SecuritySettingsSection"

interface DashboardStats {
  email: string
  name?: string
  status: string
  usd_balance: number
  bitcoin_balance: number
  ethereum_balance: number
  bitcoin_balance_usd: number
  ethereum_balance_usd: number
  total_balance_usd: number
  active_mining_sessions: number
  total_deposits: number
  pending_withdrawals: number
  is_flagged: boolean
  personal_mining_rate: number
  referral_code: string
  referred_users_count: number
  email_verified: boolean
  is_admin: boolean
  is_agent: boolean
  created_at: string
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
  id: string
  type: string
  message: string
  timestamp: string
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
      10 * 60 * 1000, // 10 minutes
    )
  }

  useEffect(() => {
    // Handle section persistence on page refresh
    const sectionParam = searchParams.get("section")
    if (sectionParam) {
      setActiveSection(sectionParam)
    } else {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set("section", "dashboardHome")
      router.replace(`?${newParams.toString()}`, { scroll: false })
    }

    // Set up inactivity timeout
    resetTimeout()

    const handleActivity = () => resetTimeout()

    // Add event listeners for user activity
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
    data: dashboardStats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery<DashboardStats>({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      return await apiCall<DashboardStats>("/api/analytics/dashboard", "GET", null, true)
    },
  })

  const {
    data: miningProgress,
    isLoading: isMiningLoading,
    refetch: refetchMining,
  } = useQuery<MiningProgress>({
    queryKey: ["/api/mining/live-progress"],
    queryFn: async () => {
      return await apiCall<MiningProgress>("/api/mining/live-progress", "GET", null, true)
    },
    refetchInterval: 5000, // Update every 5 seconds
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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleMenuAction = (section: string) => {
    setActiveSection(section)
    setSidebarOpen(false)
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set("section", section)
    router.push(`?${newParams.toString()}`, { scroll: false })
  }

  const handleSuccess = () => {
    refetchStats()
    refetchActivity()
    refetchMining()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatCrypto = (amount: number, decimals = 6) => {
    return amount.toFixed(decimals)
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
    return names[0] // Return first name only
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

  // Loading state
  if (isStatsLoading || isMiningLoading || isActivityLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (statsError || activityError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive text-lg font-medium">Failed to load dashboard data</p>
          <p className="text-muted-foreground mt-2">Please try refreshing the page</p>
          <Button
            onClick={() => {
              refetchStats()
              refetchActivity()
              refetchMining()
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
    if (!dashboardStats) return null

    switch (activeSection) {
      case "deposits":
        return <DepositsSection onReturnToDashboard={() => handleMenuAction("dashboardHome")} />
      case "withdrawals":
        return <WithdrawalsSection onReturnToDashboard={() => handleMenuAction("dashboardHome")} />
      case "mining":
        return <MiningSessionsSection onReturnToDashboard={() => handleMenuAction("dashboardHome")} />
      case "transfers":
        return (
          <CryptoTransferForm
            onTransferSuccess={handleSuccess}
            onReturnToDashboard={() => handleMenuAction("dashboardHome")}
          />
        )
      case "security":
        return <SecuritySettingsSection onReturnToDashboard={() => handleMenuAction("dashboardHome")} />
      default:
        return (
          <div className="min-h-screen bg-background">
            {/* Header */}
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
                  <div className="w-2 h-2 bg-[var(--color-crypto-success)] rounded-full"></div>
                  <span className="text-sm text-[var(--color-crypto-success)] font-medium">
                    {miningProgress?.active_sessions?.length ? "Mining Active" : "Online"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-secondary-foreground text-sm font-bold">
                      {getUserInitials(currentUser?.name || dashboardStats?.name)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {getUserDisplayName(currentUser?.name || dashboardStats?.name)}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-6 space-y-6">
              {/* Welcome Section */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1 text-balance">
                    Welcome back, {getUserDisplayName(currentUser?.name || dashboardStats?.name)}! ⚡
                  </h1>
                  <p className="text-muted-foreground">Monitor your mining operations and portfolio performance</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">Last sync</p>
                  <p className="font-semibold text-foreground">Today, {getCurrentTime()}</p>
                </div>
              </div>

              {/* Live Bitcoin Stats */}
              <LiveBitcoinStats />

              {/* Portfolio Overview - PRIORITIZED */}
              <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">Total Portfolio Value</CardTitle>
                      <div className="text-3xl font-bold">{formatCurrency(dashboardStats?.total_balance_usd || 0)}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="text-sm">Active Mining Portfolio</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-foreground/80 text-sm">Active Mining</p>
                      <p className="text-2xl font-bold">{dashboardStats?.active_mining_sessions || 0}</p>
                      <p className="text-primary-foreground/80 text-sm">sessions</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Mining Sessions - PRIORITIZED */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Active Mining Sessions</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => refetchMining()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {miningProgress?.active_sessions?.map((session) => (
                    <div key={session.session_id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              session.crypto_type === "bitcoin"
                                ? "bg-[var(--color-crypto-bitcoin)]"
                                : "bg-[var(--color-crypto-ethereum)]"
                            }`}
                          />
                          <span className="font-medium capitalize">{session.crypto_type} Mining</span>
                          <Badge variant="secondary">{session.mining_rate}% Rate</Badge>
                          {!session.is_active && <Badge variant="destructive">Paused</Badge>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{session.progress_percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={session.progress_percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Deposited: {formatCrypto(session.deposited_amount, 4)}</span>
                          <span>Mined: {formatCrypto(session.current_mined, 6)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Runtime: {session.elapsed_hours.toFixed(1)}h</span>
                          <span>Rate: {formatCrypto(session.mining_per_second * 3600, 8)}/hr</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!miningProgress?.active_sessions || miningProgress.active_sessions.length === 0) && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No active mining sessions</p>
                      <Button className="mt-4" onClick={() => handleMenuAction("deposits")}>
                        Start Mining
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Crypto Balances */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bitcoin Balance</CardTitle>
                    <Bitcoin className="h-4 w-4 text-[var(--color-crypto-bitcoin)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-crypto-bitcoin)]">
                      ₿ {formatCrypto(dashboardStats?.bitcoin_balance || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(dashboardStats?.bitcoin_balance_usd || 0)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ethereum Balance</CardTitle>
                    <Coins className="h-4 w-4 text-[var(--color-crypto-ethereum)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-crypto-ethereum)]">
                      Ξ {formatCrypto(dashboardStats?.ethereum_balance || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(dashboardStats?.ethereum_balance_usd || 0)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                    <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats?.total_deposits || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats?.pending_withdrawals || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mining Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats?.personal_mining_rate || 0}%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Referrals</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats?.referred_users_count || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
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
                      const description = activity?.message || "Activity occurred"
                      const createdAt = activity?.timestamp ? new Date(activity.timestamp) : new Date()

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
                            <p className="font-medium text-foreground">{description}</p>
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

              {/* Referral Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Referral Program</CardTitle>
                  <CardDescription>Earn rewards by inviting friends to join the mining platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Your Referral Code</p>
                      <p className="text-2xl font-bold text-primary">{dashboardStats?.referral_code}</p>
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(dashboardStats?.referral_code || "")
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
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <div className="w-2 h-2 bg-[var(--color-crypto-success)] rounded-full"></div>
            <span className="text-sm text-[var(--color-crypto-success)] font-medium">
              {miningProgress?.active_sessions?.length ? "Mining Active" : "Online"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-secondary-foreground text-sm font-bold">
                {getUserInitials(currentUser?.name || dashboardStats?.name)}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {getUserDisplayName(currentUser?.name || dashboardStats?.name)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {renderSection()}

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={toggleSidebar}>
          <div className="bg-card w-80 h-full shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
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

              <Button variant="ghost" className="w-full justify-start" onClick={() => handleMenuAction("mining")}>
                <Zap className="h-4 w-4 mr-3" />
                Mining Sessions
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

              <Button variant="ghost" className="w-full justify-start" onClick={() => handleMenuAction("analytics")}>
                <PieChart className="h-4 w-4 mr-3" />
                Analytics
              </Button>

              <Button variant="ghost" className="w-full justify-start" onClick={() => handleMenuAction("referrals")}>
                <Users className="h-4 w-4 mr-3" />
                Referrals
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
