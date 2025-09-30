"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bitcoin, Zap, TrendingUp, RefreshCw, Wallet } from "lucide-react"
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
            balance: ref.baseBalance + increment,
          }
        }),
      )
    }, 100) // Update every 100ms for smoother animation
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
      <Card className="border-2 border-primary/20 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span>Live Mining Statistics</span>
            <div className="animate-spin ml-auto">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Loading mining data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/20 bg-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/30 py-2 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10 animate-pulse">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Live Mining Statistics</h3>
              <p className="text-xs text-muted-foreground font-normal">Real-time tracking</p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 animate-pulse text-xs px-2 py-0.5"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1"></span>
              Live
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchMiningProgress}
              className="hover:bg-primary/10 p-1.5 h-auto"
              disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {Object.keys(groupedSessions).length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex p-3 rounded-full bg-muted/50 mb-3">
              <Bitcoin className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No active mining sessions</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Start mining to see live statistics</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.values(groupedSessions).map((group) => {
              const perSecondRate = (group.total_deposited * (group.avg_mining_rate / 100)) / 86400

              return (
                <div
                  key={group.crypto_type}
                  className="rounded-lg border border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 p-2.5 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Bitcoin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{group.crypto_type.toUpperCase()}</h3>
                        <p className="text-xs text-muted-foreground">
                          {group.sessions.length} session{group.sessions.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="font-bold text-sm">{group.avg_mining_rate.toFixed(2)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">daily</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="bg-card/50 rounded-md p-2 border border-border/30">
                      <div className="flex items-center gap-1 mb-1">
                        <Wallet className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground uppercase">Deposited</p>
                      </div>
                      <p className="font-bold text-xl md:text-lg text-foreground font-mono leading-tight">
                        {formatCrypto(group.total_deposited, 8)}
                      </p>
                    </div>

                    <div className="bg-primary/5 rounded-md p-2 border-2 border-primary/20">
                      <div className="flex items-center gap-1 mb-1">
                        <Zap className="h-3 w-3 text-primary animate-pulse" />
                        <p className="text-xs font-medium text-primary uppercase">Mined</p>
                      </div>
                      <p className="font-bold text-2xl text-primary font-mono tabular-nums leading-tight">
                        {formatCrypto(group.total_mined, 8)}
                      </p>
                      <p className="text-xs text-primary/70 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-primary animate-pulse"></span>+
                        {formatCrypto(perSecondRate, 10)}/sec
                      </p>
                    </div>

                    <div className="bg-card/50 rounded-md p-2 border border-border/30">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground uppercase">Balance</p>
                      </div>
                      <p className="font-bold text-2xl md:text-2xl text-foreground font-mono leading-tight">
                        {formatCrypto(group.total_balance, 8)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-primary animate-pulse"></span>
            Last synced: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
