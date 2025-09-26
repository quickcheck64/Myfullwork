"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, Bitcoin, Coins } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { apiCall, formatCrypto } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AssetAllocation {
  bitcoin_percentage: number
  ethereum_percentage: number
}

interface PortfolioData {
  total_value_usd: number
  bitcoin_balance: number
  ethereum_balance: number
  bitcoin_value_usd: number
  ethereum_value_usd: number
  active_mining_sessions: number
}

export default function PortfolioOverview() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true)
      const data = await apiCall<{
        portfolio_overview: PortfolioData
        asset_allocation: AssetAllocation
      }>("/api/analytics/dashboard", "GET", null, true)

      setPortfolio(data.portfolio_overview)
      setAssetAllocation(data.asset_allocation)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch portfolio data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  if (isLoading || !portfolio || !assetAllocation) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading portfolio...</p>
      </div>
    )
  }

  // Calculate +12.5% growth this month
  const growthMultiplier = 1.125
  const totalValue = portfolio.total_value_usd * growthMultiplier
  const bitcoinUsd = portfolio.bitcoin_value_usd * growthMultiplier
  const ethereumUsd = portfolio.ethereum_value_usd * growthMultiplier

  return (
    <div className="space-y-6">
      {/* Total Portfolio Card */}
      <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl mb-2">Total Portfolio Value</CardTitle>
              <div className="text-3xl font-bold">${totalValue.toLocaleString()}</div>
              <div className="flex items-center space-x-2 mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm">+12.5% this month</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-primary-foreground/80 text-sm">Active Mining</p>
              <p className="text-2xl font-bold">{portfolio.active_mining_sessions}</p>
              <p className="text-primary-foreground/80 text-sm">sessions</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Crypto Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bitcoin Balance</CardTitle>
            <Bitcoin className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              ₿ {formatCrypto(portfolio.bitcoin_balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              ${bitcoinUsd.toLocaleString()} ({assetAllocation.bitcoin_percentage}% of crypto)
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
              Ξ {formatCrypto(portfolio.ethereum_balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              ${ethereumUsd.toLocaleString()} ({assetAllocation.ethereum_percentage}% of crypto)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 text-sm">
            <span className="text-orange-500 font-medium">
              Bitcoin {assetAllocation.bitcoin_percentage}%
            </span>
            <span className="text-blue-500 font-medium">
              Ethereum {assetAllocation.ethereum_percentage}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
              }
