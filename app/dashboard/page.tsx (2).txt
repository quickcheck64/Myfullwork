import { CardContent } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"

import { dashboardAnalytics } from "path/to/dashboardAnalytics"
import { activeSection } from "path/to/activeSection"
import { getUserDisplayName } from "path/to/getUserDisplayName"
import { currentUser } from "path/to/currentUser"
import { getCurrentTime } from "path/to/getCurrentTime"
import LiveBitcoinStats from "path/to/LiveBitcoinStats"
import ArrowUpRight from "path/to/ArrowUpRight"
import ArrowDownRight from "path/to/ArrowDownRight"
import Bitcoin from "path/to/Bitcoin"
import Coins from "path/to/Coins"

export default function CryptoMiningDashboard() {
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

  const calculateGrowthPercentage = () => {
    if (!dashboardAnalytics) return 0
    // Use the growth_rate from API data, or calculate from available metrics
    const growthRate = dashboardAnalytics.growth_metrics.growth_rate
    return growthRate || 0
  }

  const calculateAssetAllocation = () => {
    if (!dashboardAnalytics) return { bitcoin: 0, ethereum: 0 }

    const { bitcoin_value_usd, ethereum_value_usd, total_value_usd } = dashboardAnalytics.portfolio_overview

    if (total_value_usd === 0) return { bitcoin: 0, ethereum: 0 }

    const bitcoinPercentage = (bitcoin_value_usd / total_value_usd) * 100
    const ethereumPercentage = (ethereum_value_usd / total_value_usd) * 100

    return {
      bitcoin: Math.round(bitcoinPercentage * 10) / 10, // Round to 1 decimal
      ethereum: Math.round(ethereumPercentage * 10) / 10,
    }
  }

  const formatGrowthPercentage = (growth: number) => {
    const sign = growth >= 0 ? "+" : ""
    return `${sign}${growth.toFixed(2)}%`
  }

  const renderSection = () => {
    if (!dashboardAnalytics) return null

    switch (activeSection) {
      // ... existing cases ...
      default:
        return (
          <div className="px-4 py-6 space-y-6">
            {/* Welcome Section */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1 text-balance">
                  Welcome back, {getUserDisplayName(currentUser?.name)}! ⚡
                </h1>
                <p className="text-muted-foreground">Monitor your mining operations and portfolio performance</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Last sync</p>
                <p className="font-semibold text-foreground">Today, {getCurrentTime()}</p>
              </div>
            </div>

            {/* Live Bitcoin Stats component fetches its own data independently */}
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
                      {calculateGrowthPercentage() >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="text-sm">{formatGrowthPercentage(calculateGrowthPercentage())} this period</span>
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
                    {formatCurrency(dashboardAnalytics.portfolio_overview.bitcoin_value_usd)} (
                    {calculateAssetAllocation().bitcoin}% of portfolio)
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
                    {formatCurrency(dashboardAnalytics.portfolio_overview.ethereum_value_usd)} (
                    {calculateAssetAllocation().ethereum}% of portfolio)
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }
}
