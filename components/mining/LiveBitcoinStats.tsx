"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bitcoin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MiningSession {
  session_id: number
  crypto_type: "BTC" | "ETH"
  deposited_amount: number
  mining_rate: number
  current_mined: number
  progress_percentage: number
  elapsed_hours: number
}

export default function LiveMiningStats() {
  const [sessions, setSessions] = useState<MiningSession[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const connectWebSocket = () => {
    const token = sessionStorage.getItem("accessToken")
    if (!token) {
      console.error("No access token found for WebSocket connection")
      return
    }

    // Direct backend URL
    const wsUrl = `wss://chainminer.onrender.com/ws/mining/live-progress?token=${token}`
    console.log("Connecting to WebSocket:", wsUrl)

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("WebSocket connected")
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("WebSocket message received:", data)
        if (!data.active_sessions) return
        setSessions(data.active_sessions)
        setLastUpdate(new Date())
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err)
      }
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
      console.log("WebSocket disconnected, reconnecting in 5s...")
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000)
    }
  }

  useEffect(() => {
    connectWebSocket()
    return () => {
      wsRef.current?.close()
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    }
  }, [])

  const formatAmount = (amount: number, type: "BTC" | "ETH") => `${amount.toFixed(8)} ${type}`

  if (!isConnected && sessions.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bitcoin className="h-6 w-6" />
            <span>Connecting to live mining...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-white/80">Please wait while connecting...</p>
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
              <div className="h-2 bg-green-400 rounded" style={{ width: `${s.progress_percentage}%` }} />
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>Deposited: {formatAmount(s.deposited_amount, s.crypto_type)}</span>
              <span>Elapsed: {s.elapsed_hours.toFixed(2)} hrs</span>
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
