"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bitcoin, TrendingUp, TrendingDown, RefreshCw, Activity, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BitcoinStats {
  price: number
  change_24h: number
  change_percentage_24h: number
  market_cap: number
  volume_24h: number
  hash_rate: string
  difficulty: string
  block_height: number
  mempool_size: number
}

export default function LiveBitcoinStats() {
  const [stats, setStats] = useState<BitcoinStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { toast } = useToast()

  const fetchBitcoinStats = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - replace with real API calls
      const mockStats: BitcoinStats = {
        price: 67420.5 + (Math.random() - 0.5) * 1000,
        change_24h: 1250.3 + (Math.random() - 0.5) * 500,
        change_percentage_24h: 1.89 + (Math.random() - 0.5) * 2,
        market_cap: 1330000000000,
        volume_24h: 28500000000,
        hash_rate: "450.2 EH/s",
        difficulty: "72.7T",
        block_height: 825847 + Math.floor(Math.random() * 10),
        mempool_size: 15420 + Math.floor(Math.random() * 1000),
      }

      setStats(mockStats)
      setLastUpdate(new Date())
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Bitcoin stats",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBitcoinStats()
    const interval = setInterval(fetchBitcoinStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return formatCurrency(num)
  }

  if (isLoading && !stats) {
    return (
      <Card className="bg-gradient-to-r from-[var(--color-crypto-bitcoin)] to-orange-500 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bitcoin className="h-6 w-6" />
              <span>Live Bitcoin Stats</span>
            </CardTitle>
            <div className="animate-spin">
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-white/80">Loading Bitcoin data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const isPositive = stats.change_percentage_24h >= 0

  return (
    <Card className="bg-gradient-to-r from-[var(--color-crypto-bitcoin)] to-orange-500 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bitcoin className="h-6 w-6" />
            <span>Live Bitcoin Stats</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Live
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchBitcoinStats}
              className="text-white hover:bg-white/20 p-1"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-white/80 text-sm mb-1">Bitcoin Price</p>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{formatCurrency(stats.price)}</span>
              <div className={`flex items-center space-x-1 ${isPositive ? "text-green-300" : "text-red-300"}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {isPositive ? "+" : ""}
                  {stats.change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <p className="text-white/60 text-xs">
              {isPositive ? "+" : ""}
              {formatCurrency(stats.change_24h)} (24h)
            </p>
          </div>

          <div>
            <p className="text-white/80 text-sm mb-1">Market Cap</p>
            <div className="text-xl font-bold">{formatLargeNumber(stats.market_cap)}</div>
            <p className="text-white/60 text-xs">24h Volume: {formatLargeNumber(stats.volume_24h)}</p>
          </div>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span className="text-white/80 text-xs">Hash Rate</span>
            </div>
            <p className="font-bold text-sm">{stats.hash_rate}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Activity className="h-4 w-4 text-blue-300" />
              <span className="text-white/80 text-xs">Difficulty</span>
            </div>
            <p className="font-bold text-sm">{stats.difficulty}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-4 h-4 bg-white/30 rounded text-xs flex items-center justify-center">#</span>
              <span className="text-white/80 text-xs">Block Height</span>
            </div>
            <p className="font-bold text-sm">{stats.block_height.toLocaleString()}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-4 h-4 bg-white/30 rounded text-xs flex items-center justify-center">M</span>
              <span className="text-white/80 text-xs">Mempool</span>
            </div>
            <p className="font-bold text-sm">{stats.mempool_size.toLocaleString()}</p>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-center">
          <p className="text-white/60 text-xs">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
