"use client"

import { useState, useEffect, useRef } from "react"
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
  const sessionRefs = useRef<Record<number, { startTime: number; baseMined: number; baseBalance: number }>>({})

  const fetchMiningProgress = async () => {
    try {
      setIsLoading(true)
      const data = await apiCall("/api/mining/live-progress", "POST")
      setSessions(data.sessions || [])
      setLastUpdate(new Date())

      // Store base mined + balance per session for per-second increment
      const refs: Record<number, { startTime: number; baseMined: number; baseBalance: number }> = {}
      data.sessions?.forEach((s: MiningSessionProgress) => {
        refs[s.session_id] = {
          startTime: Date.now(),
          baseMined: s.current_mined,
          baseBalance: s.balance,
        }
      })
      sessionRefs.current = refs
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

  // Per-second increment animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) =>
        prev.map((s) => {
          const ref = sessionRefs.current[s.session_id]
          if (!ref) return s

          const secondsElapsed = (Date.now() - ref.startTime) / 1000
          const increment = ((s.deposited_amount * (s.mining_rate_percent / 100)) / 86400) * secondsElapsed

          return {
            ...s,
            current_mined: ref.baseMined + increment,
            // ✅ only update this session's crypto balance
            balance: ref.baseBalance + increment,
          }
        }),
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchMiningProgress()
    const interval = setInterval(fetchMiningProgress, 30000) // sync with backend every 30s
    return () => clearInterval(interval)
  }, [])

  const groupedSessions = sessions.reduce(
    (acc, session) => {
      const cryptoType = session.crypto_type.toLowerCase()
      if (!acc[cryptoType]) {
        acc[cryptoType] = {
          crypto_type: session.crypto_type,
          sessions: [],
          total_deposited: 0,
          total_mined: 0,
          total_balance: 0,
          avg_mining_rate: 0,
        }
      }

      acc[cryptoType].sessions.push(session)
      acc[cryptoType].total_deposited += session.deposited_amount
      acc[cryptoType].total_mined += session.current_mined
      acc[cryptoType].total_balance += session.balance

      return acc
    },
    {} as Record<
      string,
      {
        crypto_type: string
        sessions: MiningSessionProgress[]
        total_deposited: number
        total_mined: number
        total_balance: number
        avg_mining_rate: number
      }
    >,
  )

  // Calculate average mining rate for each crypto type
  Object.values(groupedSessions).forEach((group) => {
    group.avg_mining_rate = group.sessions.reduce((sum, s) => sum + s.mining_rate_percent, 0) / group.sessions.length
  })

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
        {Object.keys(groupedSessions).length === 0 ? (
          <p className="text-white/80 text-center">No active mining sessions</p>
        ) : (
          Object.values(groupedSessions).map((group) => (
            <div key={group.crypto_type} className="bg-white/10 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">{group.crypto_type.toUpperCase()}</span>
                <div className="text-right">
                  <span className="text-sm text-white/60">{group.avg_mining_rate.toFixed(2)}% / day</span>
                  <p className="text-xs text-white/50">
                    {group.sessions.length} active session{group.sessions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-white/60">Total Deposited</p>
                  <p className="font-semibold">{formatCrypto(group.total_deposited)}</p>
                </div>
                <div>
                  <p className="text-white/60">Total Mined</p>
                  <p className="font-semibold">{formatCrypto(group.total_mined)}</p>
                </div>
                <div>
                  <p className="text-white/60">Total Balance</p>
                  <p className="font-semibold">{formatCrypto(group.total_balance)}</p>
                </div>
              </div>
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
