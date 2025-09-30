"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  LogOut,
  Save,
  Home,
  TrendingDown,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

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
  personal_mining_rate: number | null
}

interface AdminSettings {
  bitcoin_rate_usd: number
  ethereum_rate_usd: number
  global_mining_rate: number | undefined // Changed to allow undefined for clearing
  bitcoin_wallet_address: string
  ethereum_wallet_address: string
  referral_reward_enabled: boolean
  referral_reward_type: string
  referrer_reward_percent: number // Changed from referral_reward_amount and referrer_reward_amount
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

interface QRCode {
  crypto_type: string
  qr_code_url: string | null
}

interface PendingWithdrawal {
  id: number
  user_email: string
  crypto_type: string
  amount: number
  wallet_address: string
  transaction_hash: string
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfileOpen, setUserProfileOpen] = useState(false)
  const [settingsForm, setSettingsForm] = useState<Partial<AdminSettings>>({})
  const [qrUploadForm, setQrUploadForm] = useState({
    crypto_type: "bitcoin",
    qr_code_url: "",
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [loadingStates, setLoadingStates] = useState<{
    deposits: Record<number, string | null>
    withdrawals: Record<number, string | null>
    users: Record<number, string | null>
  }>({
    deposits: {},
    withdrawals: {},
    users: {},
  })

  // Safe formatting functions
  const safeFormatCrypto = (value: number | string | null | undefined, decimals = 8) => {
    const num = Number(value) || 0
    return num.toFixed(decimals)
  }

  const safeFormatCurrency = (value: number | string | null | undefined) => {
    const num = Number(value) || 0
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleLogout = () => {
    sessionStorage.removeItem("token")
    router.push("/login")
  }

  const handleReturnToDashboard = () => {
    router.push("/dashboard")
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

  useEffect(() => {
    if (adminSettings) {
      setSettingsForm(adminSettings)
      setSettings({
        bitcoin_rate_usd: adminSettings.bitcoin_rate_usd || 0,
        ethereum_rate_usd: adminSettings.ethereum_rate_usd || 0,
        global_mining_rate: adminSettings.global_mining_rate,
        bitcoin_wallet_address: adminSettings.bitcoin_wallet_address || "",
        ethereum_wallet_address: adminSettings.ethereum_wallet_address || "",
        referral_reward_enabled: adminSettings.referral_reward_enabled || false,
        referral_reward_type: adminSettings.referral_reward_type || "percentage",
        referrer_reward_percent: adminSettings.referrer_reward_percent || 0,
      })
    }
  }, [adminSettings])

  // Fetch transaction logs
  const { data: transactionLogs, isLoading: logsLoading } = useQuery<TransactionLog[]>({
    queryKey: ["admin-transaction-logs"],
    queryFn: () => apiCall<TransactionLog[]>("/api/admin/logs/transactions", "GET", null, true),
  })

  const { data: qrCodes, isLoading: qrCodesLoading } = useQuery<QRCode[]>({
    queryKey: ["admin-qr-codes"],
    queryFn: () => apiCall<QRCode[]>("/api/admin/qr-codes", "GET", null, true),
  })

  // Fetch individual user profile
  const fetchUserProfile = async (userId: number) => {
    try {
      const profile = await apiCall<UserProfile>(`/api/admin/users/${userId}/profile`, "GET", null, true)
      setSelectedUser(profile)
      setUserProfileOpen(true)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user profile",
        variant: "destructive",
      })
    }
  }

  // Confirm/Reject deposit mutation
  const confirmDepositMutation = useMutation({
    mutationFn: ({ depositId, action }: { depositId: number; action: string }) =>
      apiCall(`/api/admin/deposits/${depositId}/confirm?action=${action}`, "PUT", null, true),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deposit status has been updated successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["admin-pending-deposits"] })
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
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
        title: "Success",
        description: `User ${variables.action.replace("-", " ")} completed successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      if (selectedUser) {
        fetchUserProfile(selectedUser.id) // Refresh user profile
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
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
        title: "Success",
        description: "Admin settings have been updated successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      })
    },
  })

  // Updated QR upload mutation to send URL as form data instead of file
  const uploadQRMutation = useMutation({
    mutationFn: (data: { crypto_type: string; qr_code_url: string }) => {
      const formData = new FormData()
      formData.append("crypto_type", data.crypto_type)
      formData.append("qr_code_url", data.qr_code_url)

      return apiCall(`/api/admin/upload-qr-code`, "POST", formData, true)
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "QR code URL updated successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["admin-qr-codes"] })
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] })
      setQrUploadForm({ crypto_type: "bitcoin", qr_code_url: "" })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update QR code URL",
        variant: "destructive",
      })
    },
  })

  const deleteQRMutation = useMutation({
    mutationFn: (crypto_type: string) => apiCall(`/api/admin/qr-codes/${crypto_type}`, "DELETE", null, true),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "QR code deleted successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["admin-qr-codes"] })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete QR code",
        variant: "destructive",
      })
    },
  })

  const handleDepositAction = async (depositId: number, action: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      deposits: { ...prev.deposits, [depositId]: action },
    }))

    try {
      await confirmDepositMutation.mutateAsync({ depositId, action })
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        deposits: { ...prev.deposits, [depositId]: null },
      }))
    }
  }

  const handleWithdrawalAction = async (withdrawalId: number, action: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      withdrawals: { ...prev.withdrawals, [withdrawalId]: action },
    }))

    try {
      await withdrawalActionMutation.mutateAsync({ withdrawalId, action })
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        withdrawals: { ...prev.withdrawals, [withdrawalId]: null },
      }))
    }
  }

  const handleUserAction = async (userId: number, action: string, data?: any) => {
    setLoadingStates((prev) => ({
      ...prev,
      users: { ...prev.users, [userId]: action },
    }))

    try {
      await userActionMutation.mutateAsync({ userId, action, data })
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        users: { ...prev.users, [userId]: null },
      }))
    }
  }

  const handleQRUpload = () => {
    if (!qrUploadForm.qr_code_url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a QR code URL",
        variant: "destructive",
      })
      return
    }

    if (!qrUploadForm.qr_code_url.startsWith("http://") && !qrUploadForm.qr_code_url.startsWith("https://")) {
      toast({
        title: "Error",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      })
      return
    }

    uploadQRMutation.mutate({
      crypto_type: qrUploadForm.crypto_type,
      qr_code_url: qrUploadForm.qr_code_url,
    })
  }

  const filteredUsers =
    users?.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toString().includes(searchQuery),
    ) || []

  const [searchTerm, setSearchTerm] = useState("")
  const [settings, setSettings] = useState<AdminSettings>({
    bitcoin_rate_usd: 0,
    ethereum_rate_usd: 0,
    global_mining_rate: undefined, // Initialize as undefined
    bitcoin_wallet_address: "",
    ethereum_wallet_address: "",
    referral_reward_enabled: false,
    referral_reward_type: "percentage",
    referrer_reward_percent: 0, // Changed from referral_reward_amount and referrer_reward_amount
  })

  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]) // Explicitly typed
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false)

  // Fetch pending withdrawals
  const fetchPendingWithdrawals = async () => {
    setWithdrawalsLoading(true)
    try {
      const data = await apiCall<PendingWithdrawal[]>("/api/admin/withdrawals/pending", "GET", null, true)
      setPendingWithdrawals(data)
    } catch (error: any) {
      console.error("Error fetching pending withdrawals:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch pending withdrawals",
        variant: "destructive",
      })
    } finally {
      setWithdrawalsLoading(false)
    }
  }

  // Withdrawal action mutation
  const withdrawalActionMutation = useMutation({
    mutationFn: async ({ withdrawalId, action }: { withdrawalId: number; action: "confirm" | "reject" }) => {
      return await apiCall(`/api/admin/withdrawals/${withdrawalId}/confirm?action=${action}`, "PUT", null, true)
    },
    onSuccess: (data, { action }) => {
      toast({
        title: "Success",
        description: `Withdrawal ${action}ed successfully`,
      })
      fetchPendingWithdrawals() // Refresh the list
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      })
    },
  })

  const { data: withdrawalsData, refetch: refetchWithdrawals } = useQuery<PendingWithdrawal[]>({
    // Explicitly typed
    queryKey: ["pendingWithdrawals"],
    queryFn: async () => {
      return await apiCall("/api/admin/withdrawals/pending", "GET", null, true)
    },
  })

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: AdminSettings) => {
      return await apiCall("/api/admin/settings", "PUT", settings, true)
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] }) // Invalidate to refetch updated settings
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (withdrawalsData) {
      setPendingWithdrawals(withdrawalsData)
    }
  }, [withdrawalsData])

  useEffect(() => {
    if (activeTab === "withdrawals") {
      fetchPendingWithdrawals()
    }
  }, [activeTab])

  const handleSaveSettings = () => {
    const updatedSettings = {
      ...settingsForm,
    }

    console.log("[v0] Saving settings:", updatedSettings) // Debug log
    updateSettingsMutation.mutate(updatedSettings)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin Control Center
            </h1>
            <p className="text-muted-foreground text-lg">Complete platform management and user administration</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleReturnToDashboard} variant="outline" className="gap-2 bg-transparent">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button onClick={handleLogout} variant="destructive" className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="border-b border-border">
            <TabsList className="grid w-full grid-cols-6 h-12 bg-muted/50 rounded-lg p-1">
              <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-background">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="deposits" className="gap-2 data-[state=active]:bg-background">
                <Bitcoin className="h-4 w-4" />
                <span className="hidden sm:inline">Deposits</span>
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="gap-2 data-[state=active]:bg-background">
                <TrendingDown className="h-4 w-4" />
                <span className="hidden sm:inline">Withdrawals</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-background">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-background">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-background">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Logs</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {statsLoading ? "..." : safeFormatCurrency(stats?.total_users || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Deposits</CardTitle>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    ${statsLoading ? "..." : safeFormatCurrency(stats?.total_deposits || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Platform deposits</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Crypto Distributed</CardTitle>
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {statsLoading ? "..." : safeFormatCrypto(stats?.total_crypto_distributed || 0, 4)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Mining rewards</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Withdrawals</CardTitle>
                  <Clock className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    ${statsLoading ? "..." : safeFormatCurrency(stats?.pending_withdrawals || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Mining</CardTitle>
                  <Activity className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {statsLoading ? "..." : safeFormatCurrency(stats?.active_mining_sessions || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Active sessions</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deposit Management */}
          <TabsContent value="deposits" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <Bitcoin className="h-6 w-6 text-primary" />
                  <span>Pending Deposits Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {depositsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading deposits...</p>
                  </div>
                ) : !pendingDeposits || pendingDeposits.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">No pending deposits</p>
                    <p className="text-muted-foreground">All deposits have been processed</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Crypto</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Transaction Hash</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingDeposits.map((deposit) => (
                          <TableRow key={deposit.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{deposit.user_email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {deposit.crypto_type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">{safeFormatCrypto(deposit.amount, 8)}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {deposit.transaction_hash.slice(0, 20)}...
                            </TableCell>
                            <TableCell>{new Date(deposit.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex justify-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleDepositAction(deposit.id, "confirm")}
                                  disabled={loadingStates.deposits[deposit.id] === "confirm"}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {loadingStates.deposits[deposit.id] === "confirm" ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDepositAction(deposit.id, "reject")}
                                  disabled={loadingStates.deposits[deposit.id] === "reject"}
                                >
                                  {loadingStates.deposits[deposit.id] === "reject" ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Users className="h-6 w-6 text-primary" />
                    <span>User Management Center</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or user ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full sm:w-80"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {usersLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading users...</p>
                  </div>
                ) : !filteredUsers || filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">
                      {searchQuery ? "No users found matching your search" : "No users found"}
                    </p>
                    <p className="text-muted-foreground">
                      {searchQuery ? "Try adjusting your search criteria" : "Users will appear here once registered"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
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
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-muted/50 cursor-pointer">
                            <TableCell className="font-mono font-medium">#{user.id}</TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="font-mono">{safeFormatCrypto(user.bitcoin_balance, 8)} BTC</TableCell>
                            <TableCell className="font-mono">
                              {safeFormatCrypto(user.ethereum_balance, 8)} ETH
                            </TableCell>
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
                              <div className="flex justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => fetchUserProfile(user.id)}
                                  className="hover:bg-primary hover:text-primary-foreground"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Manage
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span>Cryptocurrency Rates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {settingsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Loading settings...</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Bitcoin Rate (USD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={settingsForm.bitcoin_rate_usd || ""}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({ ...prev, bitcoin_rate_usd: Number(e.target.value) }))
                          }
                          placeholder="Enter Bitcoin rate in USD"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Ethereum Rate (USD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={settingsForm.ethereum_rate_usd || ""}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({ ...prev, ethereum_rate_usd: Number(e.target.value) }))
                          }
                          placeholder="Enter Ethereum rate in USD"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Global Mining Rate (%)</Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*\.?[0-9]*"
                          value={
                            settingsForm.global_mining_rate !== undefined && settingsForm.global_mining_rate !== null
                              ? settingsForm.global_mining_rate.toString()
                              : ""
                          }
                          onChange={(e) => {
                            const value = e.target.value
                            console.log("[v0] Mining rate input changed:", value) // Debug log

                            // Allow empty string
                            if (value === "" || value === null) {
                              setSettingsForm((prev) => ({ ...prev, global_mining_rate: undefined }))
                              return
                            }

                            // Only allow valid number patterns
                            if (!/^\d*\.?\d*$/.test(value)) {
                              return // Don't update if invalid pattern
                            }

                            const rateValue = Number.parseFloat(value)
                            if (!isNaN(rateValue) && rateValue >= 0 && rateValue <= 100) {
                              console.log("[v0] Setting mining rate:", rateValue) // Debug log
                              setSettingsForm((prev) => ({ ...prev, global_mining_rate: rateValue }))
                            }
                          }}
                          placeholder="Enter percentage (e.g., 80 for 80%)"
                        />
                        <p className="text-xs text-muted-foreground">
                          Default mining rate for all users. Individual users can have personal rates that override
                          this.
                        </p>
                      </div>
                      <Button
                        onClick={handleSaveSettings}
                        disabled={updateSettingsMutation.isPending}
                        className="w-full"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateSettingsMutation.isPending ? "Saving..." : "Save Crypto Rates"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Wallet className="h-6 w-6 text-primary" />
                    <span>Wallet Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {settingsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Loading settings...</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Bitcoin Wallet Address</Label>
                        <Input
                          value={settingsForm.bitcoin_wallet_address || ""}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({ ...prev, bitcoin_wallet_address: e.target.value }))
                          }
                          placeholder="Enter Bitcoin wallet address"
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Ethereum Wallet Address</Label>
                        <Input
                          value={settingsForm.ethereum_wallet_address || ""}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({ ...prev, ethereum_wallet_address: e.target.value }))
                          }
                          placeholder="Enter Ethereum wallet address"
                          className="font-mono text-sm"
                        />
                      </div>
                      <Button
                        onClick={handleSaveSettings}
                        disabled={updateSettingsMutation.isPending}
                        className="w-full"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateSettingsMutation.isPending ? "Saving..." : "Save Wallet Addresses"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Bitcoin className="h-6 w-6 text-blue-500" />
                    <span>QR Code Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Crypto Type</Label>
                      <select
                        value={qrUploadForm.crypto_type}
                        onChange={(e) => setQrUploadForm((prev) => ({ ...prev, crypto_type: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="bitcoin">Bitcoin</option>
                        <option value="ethereum">Ethereum</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">QR Code URL</Label>
                      <Input
                        type="url"
                        placeholder="https://example.com/qr-code.png"
                        value={qrUploadForm.qr_code_url}
                        onChange={(e) => setQrUploadForm((prev) => ({ ...prev, qr_code_url: e.target.value }))}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Enter the URL of your QR code image</p>
                    </div>

                    <Button
                      onClick={handleQRUpload}
                      disabled={uploadQRMutation.isPending || !qrUploadForm.qr_code_url.trim()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadQRMutation.isPending ? "Updating..." : "Update QR Code"}
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-4">Current QR Codes</h4>
                    {/* Updated QR codes display to match backend structure */}
                    {qrCodesLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Loading QR codes...</p>
                      </div>
                    ) : qrCodes && qrCodes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {qrCodes.map((qr) => (
                          <div key={qr.crypto_type} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant={qr.crypto_type === "bitcoin" ? "default" : "secondary"}>
                                {qr.crypto_type.toUpperCase()}
                              </Badge>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteQRMutation.mutate(qr.crypto_type)}
                                disabled={deleteQRMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            {qr.qr_code_url ? (
                              <div className="mt-2">
                                <img
                                  src={qr.qr_code_url || "/placeholder.svg"}
                                  alt={`${qr.crypto_type} QR Code`}
                                  className="w-20 h-20 object-contain border rounded"
                                />
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">No QR code uploaded</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No QR codes uploaded yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <Users className="h-6 w-6 text-primary" />
                  <span>Referral Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Referral Rewards</Label>
                    <p className="text-xs text-muted-foreground">Allow users to earn referral bonuses</p>
                  </div>
                  <Switch
                    checked={settings.referral_reward_enabled}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, referral_reward_enabled: checked }))
                    }
                  />
                </div>

                {settings.referral_reward_enabled && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Reward Type</Label>
                      <Select
                        value={settings.referral_reward_type}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, referral_reward_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bitcoin">Bitcoin</SelectItem>
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Choose which cryptocurrency to use for referral rewards
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Referrer Reward Percentage (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={settings.referrer_reward_percent || ""}
                        onChange={(e) => {
                          const value = e.target.value
                          setSettings((prev) => ({
                            ...prev,
                            referrer_reward_percent: value === "" ? 0 : Number.parseFloat(value),
                          }))
                        }}
                        placeholder="Enter percentage (e.g., 5 for 5%)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Percentage of the deposited amount that will be rewarded to the referrer when someone they
                        referred makes a deposit
                      </p>
                    </div>
                  </>
                )}

                <Button
                  onClick={handleSaveSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Referral Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction Logs */}
          <TabsContent value="logs" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <FileText className="h-6 w-6 text-primary" />
                  <span>Admin Action Logs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {logsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading transaction logs...</p>
                  </div>
                ) : !transactionLogs || transactionLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No transaction logs found</p>
                    <p className="text-muted-foreground">Admin actions will be logged here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
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
                          <TableRow key={log.id} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-sm">
                              {new Date(log.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-medium">{log.admin_email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{log.target_user_email}</div>
                                <div className="text-xs text-muted-foreground font-mono">#{log.target_user_id}</div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={log.details}>
                                {log.details}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="withdrawals" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <TrendingDown className="h-6 w-6 text-primary" />
                  <span>Pending Withdrawals Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {withdrawalsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading withdrawals...</p>
                  </div>
                ) : !pendingWithdrawals || pendingWithdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">No pending withdrawals</p>
                    <p className="text-muted-foreground">All withdrawals have been processed</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Crypto</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Wallet Address</TableHead>
                          <TableHead>Transaction Hash</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingWithdrawals.map((withdrawal) => (
                          <TableRow key={withdrawal.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{withdrawal.user_email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {withdrawal.crypto_type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">{safeFormatCrypto(withdrawal.amount, 8)}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {withdrawal.wallet_address.slice(0, 20)}...
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {withdrawal.transaction_hash
                                ? withdrawal.transaction_hash.slice(0, 20) + "..."
                                : "Pending"}
                            </TableCell>
                            <TableCell>{new Date(withdrawal.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex justify-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleWithdrawalAction(withdrawal.id, "confirm")}
                                  disabled={loadingStates.withdrawals[withdrawal.id] === "confirm"}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {loadingStates.withdrawals[withdrawal.id] === "confirm" ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleWithdrawalAction(withdrawal.id, "reject")}
                                  disabled={loadingStates.withdrawals[withdrawal.id] === "reject"}
                                >
                                  {loadingStates.withdrawals[withdrawal.id] === "reject" ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={userProfileOpen} onOpenChange={setUserProfileOpen}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-xl">
                <Shield className="h-6 w-6 text-primary" />
                <span>User Profile Management - {selectedUser?.name}</span>
              </DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-8 p-2">
                {/* User Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">User ID</Label>
                          <div className="font-mono font-bold">#{selectedUser.id}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <div>
                            <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
                              {selectedUser.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Full Name</Label>
                        <div className="font-medium">{selectedUser.name}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Email Address</Label>
                        <div className="font-medium">{selectedUser.email}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Joined</Label>
                          <div>{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Last Login</Label>
                          <div>
                            {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : "Never"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Account Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Total Deposits</Label>
                          <div className="text-lg font-bold text-green-600">
                            ${safeFormatCurrency(selectedUser.total_deposits)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Total Withdrawals</Label>
                          <div className="text-lg font-bold text-red-600">
                            ${safeFormatCurrency(selectedUser.total_withdrawals)}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Mining Sessions</Label>
                          <div className="text-lg font-bold">{selectedUser.mining_sessions_count}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Referrals</Label>
                          <div className="text-lg font-bold">{selectedUser.referral_count}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Current Balances */}
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Current Cryptocurrency Balances
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <Bitcoin className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                        <Label className="text-sm text-muted-foreground">Bitcoin Balance</Label>
                        <div className="text-2xl font-bold font-mono">
                          {safeFormatCrypto(selectedUser.bitcoin_balance, 8)} BTC
                        </div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="h-8 w-8 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          ETH
                        </div>
                        <Label className="text-sm text-muted-foreground">Ethereum Balance</Label>
                        <div className="text-2xl font-bold font-mono">
                          {safeFormatCrypto(selectedUser.ethereum_balance, 8)} ETH
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Controls */}
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      User Account Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button
                        variant={selectedUser.is_suspended ? "default" : "outline"}
                        onClick={() =>
                          handleUserAction(selectedUser.id, selectedUser.is_suspended ? "unsuspend" : "suspend")
                        }
                        disabled={
                          loadingStates.users[selectedUser.id] === "suspend" ||
                          loadingStates.users[selectedUser.id] === "unsuspend"
                        }
                        className="w-full"
                      >
                        {loadingStates.users[selectedUser.id] === "suspend" ||
                        loadingStates.users[selectedUser.id] === "unsuspend" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : selectedUser.is_suspended ? (
                          <UserCheck className="h-4 w-4 mr-2" />
                        ) : (
                          <UserX className="h-4 w-4 mr-2" />
                        )}
                        {selectedUser.is_suspended ? "Unsuspend Account" : "Suspend Account"}
                      </Button>

                      <Button
                        variant={selectedUser.mining_paused ? "default" : "outline"}
                        onClick={() =>
                          handleUserAction(
                            selectedUser.id,
                            selectedUser.mining_paused ? "resume-mining" : "pause-mining",
                          )
                        }
                        disabled={
                          loadingStates.users[selectedUser.id] === "pause-mining" ||
                          loadingStates.users[selectedUser.id] === "resume-mining"
                        }
                        className="w-full"
                      >
                        {loadingStates.users[selectedUser.id] === "pause-mining" ||
                        loadingStates.users[selectedUser.id] === "resume-mining" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : selectedUser.mining_paused ? (
                          <Play className="h-4 w-4 mr-2" />
                        ) : (
                          <Pause className="h-4 w-4 mr-2" />
                        )}
                        {selectedUser.mining_paused ? "Resume Mining" : "Pause Mining"}
                      </Button>

                      <Button
                        variant={selectedUser.withdrawal_suspended ? "default" : "outline"}
                        onClick={() =>
                          handleUserAction(
                            selectedUser.id,
                            selectedUser.withdrawal_suspended ? "enable-withdrawals" : "suspend-withdrawals",
                          )
                        }
                        disabled={
                          loadingStates.users[selectedUser.id] === "suspend-withdrawals" ||
                          loadingStates.users[selectedUser.id] === "enable-withdrawals"
                        }
                        className="w-full"
                      >
                        {loadingStates.users[selectedUser.id] === "suspend-withdrawals" ||
                        loadingStates.users[selectedUser.id] === "enable-withdrawals" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : selectedUser.withdrawal_suspended ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <Ban className="h-4 w-4 mr-2" />
                        )}
                        {selectedUser.withdrawal_suspended ? "Enable Withdrawals" : "Suspend Withdrawals"}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleUserAction(selectedUser.id, "reset-password")}
                        disabled={loadingStates.users[selectedUser.id] === "reset-password"}
                        className="w-full"
                      >
                        {loadingStates.users[selectedUser.id] === "reset-password" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Settings className="h-4 w-4 mr-2" />
                        )}
                        Reset Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Mining Rate Control */}
                <Card className="border-l-4 border-l-indigo-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Personal Mining Rate Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Current Personal Rate</Label>
                          <div className="text-2xl font-bold text-primary">
                            {selectedUser.personal_mining_rate
                              ? `${selectedUser.personal_mining_rate.toFixed(0)}%`
                              : "Using Global Rate"}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Global Rate:{" "}
                            {adminSettings ? `${adminSettings.global_mining_rate?.toFixed(0)}%` : "Loading..."}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Set Personal Mining Rate (%)</Label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="Enter rate (e.g., 75 for 75%)"
                            defaultValue={
                              selectedUser.personal_mining_rate ? selectedUser.personal_mining_rate.toFixed(0) : ""
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const value = (e.target as HTMLInputElement).value
                                if (value) {
                                  const rateValue = Number(value)
                                  handleUserAction(selectedUser.id, "set-mining-rate", { mining_rate: rateValue })
                                } else {
                                  handleUserAction(selectedUser.id, "clear-mining-rate")
                                }
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement
                              const value = input?.value
                              if (value) {
                                const rateValue = Number(value)
                                handleUserAction(selectedUser.id, "set-mining-rate", { mining_rate: rateValue })
                              } else {
                                handleUserAction(selectedUser.id, "clear-mining-rate")
                              }
                            }}
                            disabled={userActionMutation.isPending}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Set Rate
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(selectedUser.id, "clear-mining-rate")}
                          disabled={userActionMutation.isPending}
                          className="w-full"
                        >
                          Clear Personal Rate (Use Global Rate)
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Leave empty or clear to use the global mining rate. Personal rate overrides global rate when
                          set.
                        </p>
                      </div>
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
