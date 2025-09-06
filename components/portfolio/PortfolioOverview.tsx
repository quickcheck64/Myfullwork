"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Bitcoin, Coins, DollarSign, TrendingUp, RefreshCw } from "lucide-react"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface PortfolioData {
  total_balance_usd: number
  bitcoin_balance: number
  ethereum_balance: number
  bitcoin_balance_usd: number
  ethereum_balance_usd: number
  usd_balance: number
}

interface PortfolioOverviewProps {
  className?: string
}

export default function PortfolioOverview({ className }: PortfolioOverviewProps) {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const response = await apiCall("/api/dashboard/stats", "GET")
      setData(response)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch portfolio data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
    const interval = setInterval(fetchPortfolio, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)

  const formatCrypto = (amount: number, decimals = 6) => amount.toFixed(decimals)

  const calculateAllocation = (amount: number, total: number) =>
    total > 0 ? ((amount / total) * 100).toFixed(1) : "0.0"

  if (!data) {
    return (
      <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Portfolio Overview</span>
            {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-primary-foreground/80 py-4">Loading portfolio...</p>
        </CardContent>
      </Card>
    )
  }

  const totalCryptoValue = data.bitcoin_balance_usd + data.ethereum_balance_usd
  const bitcoinAllocation = calculateAllocation(data.bitcoin_balance_usd, totalCryptoValue)
  const ethereumAllocation = calculateAllocation(data.ethereum_balance_usd, totalCryptoValue)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Total Portfolio Value */}
      <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl mb-2">Total Portfolio Value</CardTitle>
              <div className="text-3xl font-bold">{formatCurrency(data.total_balance_usd)}</div>
              <div className="flex items-center space-x-2 mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm">Auto-updating every 30s</span>
              </div>
            </div>
            <div className="text-right">
              <TrendingUp className="h-8 w-8 mb-2" />
              <p className="text-primary-foreground/80 text-sm">Portfolio Growth</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Asset Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bitcoin */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bitcoin</CardTitle>
            <Bitcoin className="h-4 w-4 text-[var(--color-crypto-bitcoin)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-crypto-bitcoin)]">
              ₿ {formatCrypto(data.bitcoin_balance)}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{formatCurrency(data.bitcoin_balance_usd)}</p>
            <Badge variant="secondary" className="text-xs">
              {bitcoinAllocation}% of crypto
            </Badge>
          </CardContent>
        </Card>

        {/* Ethereum */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ethereum</CardTitle>
            <Coins className="h-4 w-4 text-[var(--color-crypto-ethereum)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-crypto-ethereum)]">
              Ξ {formatCrypto(data.ethereum_balance)}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{formatCurrency(data.ethereum_balance_usd)}</p>
            <Badge variant="secondary" className="text-xs">
              {ethereumAllocation}% of crypto
            </Badge>
          </CardContent>
        </Card>

        {/* USD Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USD Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.usd_balance)}</div>
            <p className="text-xs text-muted-foreground mb-2">Available for trading</p>
            <Badge variant="outline" className="text-xs">
              Fiat currency
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Allocation Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[var(--color-crypto-bitcoin)] rounded-full" />
                <span className="text-sm">Bitcoin</span>
              </div>
              <span className="text-sm font-medium">{bitcoinAllocation}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[var(--color-crypto-ethereum)] rounded-full" />
                <span className="text-sm">Ethereum</span>
              </div>
              <span className="text-sm font-medium">{ethereumAllocation}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
