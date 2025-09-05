"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bitcoin, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MiningSession {
  session_id: number
  crypto_type: "BTC" | "ETH"
  deposited_amount: number
  mining_rate: number
  current_mined: number
  progress_percentage: number
  elapsed_hours: number
  mining_per_second: number
}

export default function LiveMiningStats() {
  const [sessions, setSessions] = useState<MiningSession[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const wsRef = useRef<WebSocket | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken")
    if (!token) return

    const ws = new WebSocket(`wss://dansog-backend.onrender.com/ws/mining/live-progress?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (!data.active_sessions) return

      // Map sessions and calculate mining_per_second for smooth ticking
      const updatedSessions: MiningSession[] = data.active_sessions.map((s: any) => {
        const miningPerSecond = (s.deposited_amount * (s.mining_rate / 100)) / (24 * 3600)
        return {
          ...s,
          mining_per_second: miningPerSecond,
        }
      })

      setSessions(updatedSessions)
      setLastUpdate(new Date())
    }

    ws.onerror = (err) => {
      console.error("WebSocket error:", err)
      toast({
        title: "WebSocket Error",
        description: "Failed to connect to live mining updates",
        variant: "destructive",
      })
    }

    ws.onclose = () => {
      setIsConnected(false)
      console.log("WebSocket disconnected")
    }

    return () => {
      ws.close()
    }
  }, [])

  // ⏱️ Live ticking every second
  useEffect(() => {
    if (!sessions.length) return
    const tick = setInterval(() => {
      setSessions((prev) =>
        prev.map((s) => {
          const newMined = s.current_mined + s.mining_per_second
          const target = s.deposited_amount * (s.mining_rate / 100)
          return {
            ...s,
            current_mined: newMined,
            progress_percentage: Math.min((newMined / target) * 100, 100),
          }
        })
      )
    }, 1000)
    return () => clearInterval(tick)
  }, [sessions])

  const formatAmount = (amount: number, type: "BTC" | "ETH") =>
    `${amount.toFixed(8)} ${type}`

  if (!isConnected && sessions.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bitcoin className="h-6 w-6" />
              <span>Live Mining Progress</span>
            </CardTitle>
            <div className="animate-spin">
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-white/80">Connecting to live updates...</p>
        </CardContent>
      </Card>
    )
  }

  if (!sessions.length) {
    return (
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle>No Active BTC/ETH Mining</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bitcoin className="h-6 w-6" />
            <span>BTC & ETH Mining Progress</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Live
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {sessions.map((s) => (
          <div key={s.session_id} className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-white/80 mb-1">
              {s.crypto_type} — {s.mining_rate}% daily rate
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">{formatAmount(s.current_mined, s.crypto_type)}</span>
              <span className="text-xs text-white/60">{s.progress_percentage.toFixed(2)}% complete</span>
            </div>

            <div className="w-full bg-white/20 h-2 rounded mt-2">
              <div
                className="h-2 bg-green-400 rounded"
                style={{ width: `${s.progress_percentage}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>Deposited: {formatAmount(s.deposited_amount, s.crypto_type)}</span>
              <span>Per Sec: {s.mining_per_second.toFixed(8)} {s.crypto_type}</span>
            </div>
          </div>
        ))}

        <div className="text-center text-white/60 text-xs">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}
