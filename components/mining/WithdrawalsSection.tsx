"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bitcoin, Coins, ArrowLeft, Send } from "lucide-react"
import { apiCall, formatCurrency, formatCrypto } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  bitcoin_balance: number
  ethereum_balance: number
  bitcoin_balance_usd: number
  ethereum_balance_usd: number
}

interface Withdrawal {
  id: number
  crypto_type: string
  amount: number
  usd_amount: number
  wallet_address: string
  status: string
  transaction_hash?: string
  created_at: string
}

interface WithdrawalsProps {
  onReturnToDashboard: () => void
}

export default function WithdrawalsSection({ onReturnToDashboard }: WithdrawalsProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<"bitcoin" | "ethereum">("bitcoin")
  const [amount, setAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch user profile for balances
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    queryFn: () => apiCall<UserProfile>("/api/user/profile", "GET", null, true),
  })

  // Fetch user withdrawals
  const { data: withdrawals } = useQuery<Withdrawal[]>({
    queryKey: ["/api/user/withdrawals"],
    queryFn: () => apiCall<Withdrawal[]>("/api/user/withdrawals", "GET", null, true),
  })

  // Create withdrawal mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: (data: { crypto_type: string; amount: number; wallet_address: string }) =>
      apiCall("/api/withdrawals/create", "POST", data, true),
    onSuccess: () => {
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted for processing.",
      })
      queryClient.invalidateQueries({ queryKey: ["/api/user/withdrawals"] })
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] })
      setAmount("")
      setWalletAddress("")
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to create withdrawal request",
        variant: "destructive",
      })
    },
  })

  const handleCreateWithdrawal = () => {
    const withdrawAmount = Number.parseFloat(amount)

    if (!withdrawAmount || withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (!walletAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      })
      return
    }

    const availableBalance = selectedCrypto === "bitcoin" ? profile?.bitcoin_balance : profile?.ethereum_balance

    if (!availableBalance || withdrawAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      })
      return
    }

    createWithdrawalMutation.mutate({
      crypto_type: selectedCrypto,
      amount: withdrawAmount,
      wallet_address: walletAddress,
    })
  }

  const getAvailableBalance = () => {
    if (!profile) return 0
    return selectedCrypto === "bitcoin" ? profile.bitcoin_balance : profile.ethereum_balance
  }

  const getAvailableBalanceUSD = () => {
    if (!profile) return 0
    return selectedCrypto === "bitcoin" ? profile.bitcoin_balance_usd : profile.ethereum_balance_usd
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
          <h1 className="text-lg font-semibold">Crypto Withdrawals</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Withdrawal</TabsTrigger>
            <TabsTrigger value="history">Withdrawal History</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            {/* Available Balance */}
            <Card>
              <CardHeader>
                <CardTitle>Available Balance</CardTitle>
                <CardDescription>Your current cryptocurrency balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <Bitcoin className="h-8 w-8 text-[var(--color-crypto-bitcoin)]" />
                    <div>
                      <p className="font-medium">Bitcoin</p>
                      <p className="text-sm text-muted-foreground">₿ {formatCrypto(profile?.bitcoin_balance || 0)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(profile?.bitcoin_balance_usd || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <Coins className="h-8 w-8 text-[var(--color-crypto-ethereum)]" />
                    <div>
                      <p className="font-medium">Ethereum</p>
                      <p className="text-sm text-muted-foreground">Ξ {formatCrypto(profile?.ethereum_balance || 0)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(profile?.ethereum_balance_usd || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crypto Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Cryptocurrency</CardTitle>
                <CardDescription>Choose which cryptocurrency you want to withdraw</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={selectedCrypto === "bitcoin" ? "default" : "outline"}
                    onClick={() => setSelectedCrypto("bitcoin")}
                    className="h-16 flex flex-col space-y-2"
                  >
                    <Bitcoin className="h-6 w-6 text-[var(--color-crypto-bitcoin)]" />
                    <span>Bitcoin</span>
                  </Button>
                  <Button
                    variant={selectedCrypto === "ethereum" ? "default" : "outline"}
                    onClick={() => setSelectedCrypto("ethereum")}
                    className="h-16 flex flex-col space-y-2"
                  >
                    <Coins className="h-6 w-6 text-[var(--color-crypto-ethereum)]" />
                    <span>Ethereum</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Withdrawal Details</span>
                </CardTitle>
                <CardDescription>
                  Available: {formatCrypto(getAvailableBalance(), 8)} {selectedCrypto.toUpperCase()} (
                  {formatCurrency(getAvailableBalanceUSD())})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount ({selectedCrypto.toUpperCase()})</Label>
                  <Input
                    type="number"
                    step="0.00000001"
                    placeholder="0.00000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Minimum: 0.001 {selectedCrypto.toUpperCase()}</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => setAmount(getAvailableBalance().toString())}
                    >
                      Use Max
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <Input
                    placeholder={`Enter your ${selectedCrypto} wallet address`}
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Important Notes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Withdrawals are processed within 24 hours</li>
                    <li>• Network fees will be deducted from your withdrawal</li>
                    <li>• Double-check your wallet address before submitting</li>
                    <li>• Minimum withdrawal amount applies</li>
                  </ul>
                </div>

                <Button
                  onClick={handleCreateWithdrawal}
                  disabled={createWithdrawalMutation.isPending || !amount || !walletAddress}
                  className="w-full"
                >
                  {createWithdrawalMutation.isPending ? "Processing..." : "Request Withdrawal"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {withdrawals?.map((withdrawal) => (
              <Card key={withdrawal.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {withdrawal.crypto_type === "bitcoin" ? (
                        <Bitcoin className="h-5 w-5 text-[var(--color-crypto-bitcoin)]" />
                      ) : (
                        <Coins className="h-5 w-5 text-[var(--color-crypto-ethereum)]" />
                      )}
                      <div>
                        <p className="font-medium">
                          {formatCrypto(withdrawal.amount, 8)} {withdrawal.crypto_type.toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(withdrawal.usd_amount)}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          To: {withdrawal.wallet_address.slice(0, 20)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          withdrawal.status === "completed"
                            ? "default"
                            : withdrawal.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {withdrawal.transaction_hash && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">TX: {withdrawal.transaction_hash.slice(0, 20)}...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {(!withdrawals || withdrawals.length === 0) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No withdrawals found</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
