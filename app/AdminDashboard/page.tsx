"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Settings,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Bitcoin,
  Wallet,
  Activity,
  FileText,
  Search,
  UserX,
  UserCheck,
  Pause,
  Play,
  Ban,
  Shield,
  Eye,
} from "lucide-react"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AdminDashboardProps {
  onReturnToDashboard: () => void
}

interface DashboardStats {
  total_users: number
  total_deposits: number
  total_crypto_distributed: number
  pending_withdrawals: number
  active_mining_sessions: number
}

interface PendingDeposit {
  id: number
  user_id: number
  user_email: string
  crypto_type: string
  amount: number
  transaction_hash: string
  created_at: string
}

interface User {
  id: number
  email: string
  name: string
  bitcoin_balance: number
  ethereum_balance: number
  is_active: boolean
  is_suspended: boolean
  mining_paused: boolean
  withdrawal_suspended: boolean
  created_at: string
}

interface UserProfile extends User {
  total_deposits: number
  total_withdrawals: number
  mining_sessions_count: number
  referral_count: number
  last_login: string
}

interface AdminSettings {
  bitcoin_rate_usd: number
  ethereum_rate_usd: number
  global_mining_rate: number
  bitcoin_wallet_address: string
  ethereum_wallet_address: string
  referral_reward_enabled: boolean
  referral_reward_type: string
  referral_reward_amount: number
  referrer_reward_amount: number
}

interface TransactionLog {
  id: number
  admin_email: string
  action: string
  target_user_id: number
  target_user_email: string
  details: string
  created_at: string
}

export default function AdminDashboard({ onReturnToDashboard }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [userProfileOpen, setUserProfileOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Safe formatting functions
  const safeFormatCrypto = (value: number | string | null | undefined, decimals = 8) => {
    const num = Number(value) || 0
    return num.toFixed(decimals)
  }

  const safeFormatCurrency = (value: number | string | null | undefined) => {
    const num = Number(value) || 0
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => apiCall<DashboardStats>("/api/admin/dashboard/stats", "GET", null, true),
  })

  // Fetch pending deposits
  const { data: pendingDeposits, isLoading: depositsLoading } = useQuery<PendingDeposit[]>({
    queryKey: ["admin-pending-deposits"],
    queryFn: () => apiCall<PendingDeposit[]>("/api/admin/deposits/pending", "GET", null, true),
  })

  // Fetch all users with search
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["admin-users", searchQuery],
    queryFn: () => {
      const url = searchQuery ? `/api/admin/users/search?q=${encodeURIComponent(searchQuery)}` : "/api/admin/users"
      return apiCall<User[]>(url, "GET", null, true)
    },
  })

  // Fetch admin settings
  const { data: adminSettings, isLoading: settingsLoading } = useQuery<AdminSettings>({
    queryKey: ["admin-settings"],
    queryFn: () => apiCall<AdminSettings>("/api/admin/settings", "GET", null, true),
  })

  // Fetch transaction logs
  const { data: transactionLogs, isLoading: logsLoading } = useQuery<TransactionLog[]>({
    queryKey: ["admin-transaction-logs"],
    queryFn: () => apiCall<TransactionLog[]>("/api/admin/logs/transactions", "GET", null, true),
  })

  // Fetch individual user profile
  const fetchUserProfile = async (userId: number) => {
    const profile = await apiCall<UserProfile>(`/api/admin/users/${userId}/profile`, "GET", null, true)
    setSelectedUser(profile)
    setUserProfileOpen(true)
  }

  // Confirm/Reject deposit mutation
  const confirmDepositMutation = useMutation({
    mutationFn: ({ depositId, action }: { depositId: number; action: string }) =>
      apiCall(`/api/admin/deposits/${depositId}/confirm?action=${action}`, "PUT", null, true),
    onSuccess: () => {
      toast({
        title: "Deposit Updated",
        description: "Deposit status has been updated successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["admin-pending-deposits"] })
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] })
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update deposit status",
        variant: "destructive",
      })
    },
  })

  // User management mutations
  const userActionMutation = useMutation({
    mutationFn: ({ userId, action, data }: { userId: number; action: string; data?: any }) =>
      apiCall(`/api/admin/users/${userId}/${action}`, "PUT", data, true),
    onSuccess: (_, variables) => {
      toast({
        title: "User Updated",
        description: `User ${variables.action} completed successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      if (selectedUser) {
        fetchUserProfile(selectedUser.id) // Refresh user profile
      }
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to perform user action",
        variant: "destructive",
      })
    },
  })

  // Update admin settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<AdminSettings>) => apiCall("/api/admin/settings", "PUT", data, true),
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Admin settings have been updated successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] })
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      })
    },
  })

  const handleDepositAction = (depositId: number, action: "confirm" | "reject") => {
    confirmDepositMutation.mutate({ depositId, action })
  }

  const handleUserAction = (userId: number, action: string, data?: any) => {
    userActionMutation.mutate({ userId, action, data })
  }

  const handleSettingsUpdate = (updatedSettings: Partial<AdminSettings>) => {
    updateSettingsMutation.mutate(updatedSettings)
  }

  const filteredUsers =
    users?.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toString().includes(searchQuery),
    ) || []

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your crypto mining platform</p>
          </div>
          <Button onClick={onReturnToDashboard} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : safeFormatCurrency(stats?.total_users || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : safeFormatCurrency(stats?.total_deposits || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Crypto Distributed</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : safeFormatCrypto(stats?.total_crypto_distributed || 0, 4)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : safeFormatCurrency(stats?.pending_withdrawals || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Mining</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : safeFormatCurrency(stats?.active_mining_sessions || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deposit Management */}
          <TabsContent value="deposits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bitcoin className="h-5 w-5" />
                  <span>Pending Deposits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {depositsLoading ? (
                  <div className="text-center py-8">Loading deposits...</div>
                ) : !pendingDeposits || pendingDeposits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No pending deposits</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Crypto</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Transaction Hash</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingDeposits.map((deposit) => (
                        <TableRow key={deposit.id}>
                          <TableCell>{deposit.user_email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{deposit.crypto_type.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell>{safeFormatCrypto(deposit.amount, 8)}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {deposit.transaction_hash.slice(0, 20)}...
                          </TableCell>
                          <TableCell>{new Date(deposit.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleDepositAction(deposit.id, "confirm")}
                                disabled={confirmDepositMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDepositAction(deposit.id, "reject")}
                                disabled={confirmDepositMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or user ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : !filteredUsers || filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No users found matching your search" : "No users found"}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Bitcoin Balance</TableHead>
                        <TableHead>Ethereum Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono">#{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{safeFormatCrypto(user.bitcoin_balance, 8)} BTC</TableCell>
                          <TableCell>{safeFormatCrypto(user.ethereum_balance, 8)} ETH</TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <Badge variant={user.is_active ? "default" : "secondary"}>
                                {user.is_active ? "Active" : "Inactive"}
                              </Badge>
                              {user.is_suspended && <Badge variant="destructive">Suspended</Badge>}
                              {user.mining_paused && <Badge variant="outline">Mining Paused</Badge>}
                              {user.withdrawal_suspended && <Badge variant="outline">Withdrawal Suspended</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => fetchUserProfile(user.id)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Crypto Rates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settingsLoading ? (
                    <div className="text-center py-4">Loading settings...</div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Bitcoin Rate (USD)</Label>
                        <Input
                          type="number"
                          defaultValue={adminSettings?.bitcoin_rate_usd}
                          onBlur={(e) => handleSettingsUpdate({ bitcoin_rate_usd: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ethereum Rate (USD)</Label>
                        <Input
                          type="number"
                          defaultValue={adminSettings?.ethereum_rate_usd}
                          onBlur={(e) => handleSettingsUpdate({ ethereum_rate_usd: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Global Mining Rate (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={adminSettings?.global_mining_rate}
                          onBlur={(e) => handleSettingsUpdate({ global_mining_rate: Number(e.target.value) })}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5" />
                    <span>Wallet Addresses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settingsLoading ? (
                    <div className="text-center py-4">Loading settings...</div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Bitcoin Wallet Address</Label>
                        <Input
                          defaultValue={adminSettings?.bitcoin_wallet_address}
                          onBlur={(e) => handleSettingsUpdate({ bitcoin_wallet_address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ethereum Wallet Address</Label>
                        <Input
                          defaultValue={adminSettings?.ethereum_wallet_address}
                          onBlur={(e) => handleSettingsUpdate({ ethereum_wallet_address: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Admin Action Logs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="text-center py-8">Loading transaction logs...</div>
                ) : !transactionLogs || transactionLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No transaction logs found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target User</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                          <TableCell>{log.admin_email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>
                            {log.target_user_email} (#{log.target_user_id})
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={userProfileOpen} onOpenChange={setUserProfileOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>User Management - {selectedUser?.name}</span>
              </DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <strong>User ID:</strong> #{selectedUser.id}
                      </div>
                      <div>
                        <strong>Name:</strong> {selectedUser.name}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedUser.email}
                      </div>
                      <div>
                        <strong>Joined:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Last Login:</strong>{" "}
                        {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : "Never"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Account Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <strong>Total Deposits:</strong> {safeFormatCurrency(selectedUser.total_deposits)}
                      </div>
                      <div>
                        <strong>Total Withdrawals:</strong> {safeFormatCurrency(selectedUser.total_withdrawals)}
                      </div>
                      <div>
                        <strong>Mining Sessions:</strong> {selectedUser.mining_sessions_count}
                      </div>
                      <div>
                        <strong>Referrals:</strong> {selectedUser.referral_count}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Balances */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Balances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Bitcoin Balance</Label>
                        <div className="text-2xl font-bold">
                          {safeFormatCrypto(selectedUser.bitcoin_balance, 8)} BTC
                        </div>
                      </div>
                      <div>
                        <Label>Ethereum Balance</Label>
                        <div className="text-2xl font-bold">
                          {safeFormatCrypto(selectedUser.ethereum_balance, 8)} ETH
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Controls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button
                        variant={selectedUser.is_suspended ? "default" : "destructive"}
                        onClick={() =>
                          handleUserAction(selectedUser.id, selectedUser.is_suspended ? "unsuspend" : "suspend")
                        }
                        disabled={userActionMutation.isPending}
                      >
                        {selectedUser.is_suspended ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Unsuspend
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Suspend
                          </>
                        )}
                      </Button>

                      <Button
                        variant={selectedUser.mining_paused ? "default" : "outline"}
                        onClick={() =>
                          handleUserAction(
                            selectedUser.id,
                            selectedUser.mining_paused ? "resume-mining" : "pause-mining",
                          )
                        }
                        disabled={userActionMutation.isPending}
                      >
                        {selectedUser.mining_paused ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Resume Mining
                          </>
                        ) : (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Mining
                          </>
                        )}
                      </Button>

                      <Button
                        variant={selectedUser.withdrawal_suspended ? "default" : "outline"}
                        onClick={() =>
                          handleUserAction(
                            selectedUser.id,
                            selectedUser.withdrawal_suspended ? "enable-withdrawals" : "suspend-withdrawals",
                          )
                        }
                        disabled={userActionMutation.isPending}
                      >
                        {selectedUser.withdrawal_suspended ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Enable Withdrawals
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend Withdrawals
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleUserAction(selectedUser.id, "reset-password")}
                        disabled={userActionMutation.isPending}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Reset Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
