"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Pause, Play, Settings, TrendingUp } from "lucide-react"

interface MiningSession {
  session_id: number
  crypto_type: string
  deposited_amount: number
  mining_rate: number
  current_mined: number
  mining_per_second: number
  progress_percentage: number
  elapsed_hours: number
  is_active?: boolean
}

interface MiningSessionCardProps {
  session: MiningSession
  onPause?: (sessionId: number) => void
  onResume?: (sessionId: number) => void
  onSettings?: (sessionId: number) => void
}

export default function MiningSessionCard({ session, onPause, onResume, onSettings }: MiningSessionCardProps) {
  const [isActive, setIsActive] = useState(session.is_active ?? true)

  const formatCrypto = (amount: number, decimals = 6) => {
    return amount.toFixed(decimals)
  }

  const handleToggle = () => {
    if (isActive) {
      onPause?.(session.session_id)
    } else {
      onResume?.(session.session_id)
    }
    setIsActive(!isActive)
  }

  const getCryptoColor = (cryptoType: string) => {
    return cryptoType === "bitcoin" ? "text-[var(--color-crypto-bitcoin)]" : "text-[var(--color-crypto-ethereum)]"
  }

  const getCryptoBgColor = (cryptoType: string) => {
    return cryptoType === "bitcoin" ? "bg-[var(--color-crypto-bitcoin)]" : "bg-[var(--color-crypto-ethereum)]"
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getCryptoBgColor(session.crypto_type)}`} />
            <CardTitle className="text-base capitalize">{session.crypto_type} Mining</CardTitle>
            <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Paused"}</Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleToggle} className="h-8 w-8 p-0">
              {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onSettings?.(session.session_id)} className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mining Rate Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Mining Rate</span>
          </div>
          <Badge variant="outline" className={getCryptoColor(session.crypto_type)}>
            {session.mining_rate}%
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{session.progress_percentage.toFixed(1)}%</span>
          </div>
          <Progress value={session.progress_percentage} className="h-2" />
        </div>

        {/* Mining Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Deposited</p>
            <p className={`font-medium ${getCryptoColor(session.crypto_type)}`}>
              {formatCrypto(session.deposited_amount, 4)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Mined</p>
            <p className={`font-medium ${getCryptoColor(session.crypto_type)}`}>
              {formatCrypto(session.current_mined, 6)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Runtime</p>
            <p className="font-medium">{session.elapsed_hours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-muted-foreground">Rate/Hour</p>
            <p className={`font-medium ${getCryptoColor(session.crypto_type)}`}>
              {formatCrypto(session.mining_per_second * 3600, 8)}
            </p>
          </div>
        </div>

        {/* Estimated Completion */}
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Est. Completion</span>
            <span>
              {session.progress_percentage < 100
                ? `${((100 - session.progress_percentage) / (session.progress_percentage / session.elapsed_hours)).toFixed(1)}h remaining`
                : "Complete"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
