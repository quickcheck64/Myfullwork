"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bitcoin, Coins, ArrowLeft, Play, Pause, Square, RefreshCw } from "lucide-react"
import { apiCall, formatCrypto } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface MiningSession {
  session_id: number
  crypto_type: string
  deposited_amount: number
  mining_rate: number
  current_mined: number
  mining_per_second: number
  progress_percentage: number
  elapsed_hours: number
  is_active: boolean
  paused_at?: string
  created_at: string
}

interface MiningProgress {
  active_sessions: MiningSession[]
}

interface MiningSessionsProps {
  onReturnToDashboard: () => void
}

export default function MiningSessionsSection({ onReturnToDashboard }: MiningSessionsProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch mining progress
  const { data: miningProgress, refetch } = useQuery<MiningProgress>({
    queryKey: ["/api/mining/live-progress"],
    queryFn: () => apiCall<MiningProgress>("/api/mining/live-progress", "GET", null, true),
    refetchInterval: 5000, // Update every 5 seconds
  })

  // Pause mining session mutation
  const pauseSessionMutation = useMutation({
    mutationFn: (sessionId: number) => apiCall(`/api/mining/${sessionId}/pause`, "PUT", {}, true),
    onSuccess: () => {
      toast({
        title: "Session Paused",
        description: "Mining session has been paused successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["/api/mining/live-progress"] })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Pause",
        description: error.message || "Failed to pause mining session",
        variant: "destructive",
      })
    },
  })

  // Resume mining session mutation
  const resumeSessionMutation = useMutation({
    mutationFn: (sessionId: number) => apiCall(`/api/mining/${sessionId}/resume`, "PUT", {}, true),
    onSuccess: () => {
      toast({
        title: "Session Resumed",
        description: "Mining session has been resumed successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["/api/mining/live-progress"] })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Resume",
        description: error.message || "Failed to resume mining session",
        variant: "destructive",
      })
    },
  })

  // Stop mining session mutation
  const stopSessionMutation = useMutation({
    mutationFn: (sessionId: number) => apiCall(`/api/mining/${sessionId}/stop`, "PUT", {}, true),
    onSuccess: () => {
      toast({
        title: "Session Stopped",
        description: "Mining session has been stopped and rewards credited.",
      })
      queryClient.invalidateQueries({ queryKey: ["/api/mining/live-progress"] })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Stop",
        description: error.message || "Failed to stop mining session",
        variant: "destructive",
      })
    },
  })

  const handlePauseSession = (sessionId: number) => {
    pauseSessionMutation.mutate(sessionId)
  }

  const handleResumeSession = (sessionId: number) => {
    resumeSessionMutation.mutate(sessionId)
  }

  const handleStopSession = (sessionId: number) => {
    if (confirm("Are you sure you want to stop this mining session? This action cannot be undone.")) {
      stopSessionMutation.mutate(sessionId)
    }
  }

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}h ${m}m`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onReturnToDashboard}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-lg font-semibold">Mining Sessions</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Active Sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Mining Sessions</h2>
            <Badge variant="secondary">{miningProgress?.active_sessions?.length || 0} Active</Badge>
          </div>

          {miningProgress?.active_sessions?.map((session) => (
            <Card key={session.session_id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {session.crypto_type === "bitcoin" ? (
                      <Bitcoin className="h-6 w-6 text-[var(--color-crypto-bitcoin)]" />
                    ) : (
                      <Coins className="h-6 w-6 text-[var(--color-crypto-ethereum)]" />
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {session.crypto_type.charAt(0).toUpperCase() + session.crypto_type.slice(1)} Mining
                      </CardTitle>
                      <CardDescription>
                        Session #{session.session_id} • {session.mining_rate}% Rate
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={session.is_active ? "default" : "secondary"}
                      className={session.is_active ? "bg-[var(--color-mining-active)]" : ""}
                    >
                      {session.is_active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mining Progress</span>
                    <span>{session.progress_percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={session.progress_percentage} className="h-3" />
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Deposited</p>
                    <p className="font-medium">{formatCrypto(session.deposited_amount, 6)}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Mined</p>
                    <p className="font-medium text-[var(--color-crypto-success)]">
                      {formatCrypto(session.current_mined, 8)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Runtime</p>
                    <p className="font-medium">{formatDuration(session.elapsed_hours)}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Rate/Hour</p>
                    <p className="font-medium">{formatCrypto(session.mining_per_second * 3600, 8)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Started: {new Date(session.created_at).toLocaleDateString()}
                    {session.paused_at && (
                      <span className="ml-2">• Paused: {new Date(session.paused_at).toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {session.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePauseSession(session.session_id)}
                        disabled={pauseSessionMutation.isPending}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResumeSession(session.session_id)}
                        disabled={resumeSessionMutation.isPending}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStopSession(session.session_id)}
                      disabled={stopSessionMutation.isPending}
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!miningProgress?.active_sessions || miningProgress.active_sessions.length === 0) && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bitcoin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Active Mining Sessions</h3>
                  <p className="text-muted-foreground mb-4">
                    Start mining by making a deposit and creating a new mining session.
                  </p>
                  <Button onClick={onReturnToDashboard}>Go to Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
