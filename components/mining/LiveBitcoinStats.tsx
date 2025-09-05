"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bitcoin, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiCall, formatCrypto } from "@/lib/api"

interface MiningSessionProgress {
  session_id: number
  crypto_type: string
  deposited_amount: number
  mining_rate_percent: number
  current_mined: number
  balance: number
}

export default function LiveMiningStats() {
  const [sessions, setSessions] = useState<MiningSessionProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { toast } = useToast()

  const fetchMiningProgress = async () => {
    try {
      setIsLoading(true)
      const data = await apiCall("/api/mining/live-progress", "GET")
      setSessions(data.active_sessions || [])
      setLastUpdate(new Date())
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch mining stats",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMiningProgress()
    const interval = setInterval(fetchMiningProgress, 3000) // Update every 3 seconds
    return () => clearInterval(interval)
  }, [])

  if (isLoading && sessions.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-[var(--color-crypto-bitcoin)] to-orange-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bitcoin className="h-6 w-6" />
            <span>Live Mining Stats</span>
            <div className="animate-spin">
              <RefreshCw className="h-4 w-4" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-white/80 py-4">Loading mining data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-[var(--color-crypto-bitcoin)] to-orange-500 text-white">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Bitcoin className="h-6 w-6" />
          <span>Live Mining Stats</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Live
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMiningProgress}
            className="text-white hover:bg-white/20 p-1"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-white/80 text-center">No active mining sessions</p>
        ) : (
          sessions.map((session) => (
            <div key={session.session_id} className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-bold">{session.crypto_type.toUpperCase()}</span>
                <span className="text-sm text-white/60">{session.mining_rate_percent}% / day</span>
              </div>
              <p className="text-white/80 text-sm">Deposited: {formatCrypto(session.deposited_amount)}</p>
              <p className="text-white/80 text-sm">Mined: {formatCrypto(session.current_mined)}</p>
              <p className="text-white/80 text-sm">Balance: {formatCrypto(session.balance)}</p>
            </div>
          ))
        )}

        <div className="text-center">
          <p className="text-white/60 text-xs">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
