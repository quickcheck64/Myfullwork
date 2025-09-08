"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bitcoin, Coins, ArrowLeft, Send } from "lucide-react"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  bitcoin_balance: number
  ethereum_balance: number
  bitcoin_balance_usd: number
  ethereum_balance_usd: number
}

interface UserInfo {
  id: number
  email: string
}

interface Transfer {
  id: number
  crypto_type: string
  amount: number
  usd_amount: number
  transaction_hash: string
  created_at: string
  from_user: UserInfo
  to_user: UserInfo
  direction: "sent" | "received"
}

interface TransferFormProps {
  onTransferSuccess: () => void
  onReturnToDashboard: () => void
}

export default function CryptoTransferForm({ onTransferSuccess, onReturnToDashboard }: TransferFormProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<"bitcoin" | "ethereum">("bitcoin")
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch user profile for balances
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    queryFn: () => apiCall<UserProfile>("/api/user/profile", "GET", null, true),
  })

  // Fetch user transfers
  const { data: transfers } = useQuery<Transfer[]>({
    queryKey: ["/api/user/transfers"],
    queryFn: () => apiCall<Transfer[]>("/api/user/transfers", "GET", null, true),
  })

  // Create transfer mutation
  const createTransferMutation = useMutation({
    mutationFn: (data: { crypto_type: string; amount: number; to_email?: string; to_user_id?: number }) =>
      apiCall("/api/transfers/create", "POST", data, true),
    onSuccess: () => {
      toast({
        title: "Transfer Successful",
        description: "Your crypto transfer has been completed successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["/api/user/transfers"] })
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] })
      setAmount("")
      setRecipient("")
      onTransferSuccess()
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to complete transfer",
        variant: "destructive",
      })
    },
  })

  const isEmail = (input: string) => {
    return input.includes("@") && input.includes(".")
  }

  const handleCreateTransfer = () => {
    const transferAmount = Number.parseFloat(amount)

    if (!transferAmount || transferAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (!recipient.trim()) {
      toast({
        title: "Invalid Recipient",
        description: "Please enter a valid email address or account ID",
        variant: "destructive",
      })
      return
    }

    if (recipient.includes("@") && !isEmail(recipient)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    if (!recipient.includes("@") && !/^\d+$/.test(recipient)) {
      toast({
        title: "Invalid Account ID",
        description: "Account ID must contain only digits",
        variant: "destructive",
      })
      return
    }

    const availableBalance = selectedCrypto === "bitcoin" ? profile?.bitcoin_balance : profile?.ethereum_balance

    if (!availableBalance || transferAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this transfer",
        variant: "destructive",
      })
      return
    }

    const transferData: any = {
      crypto_type: selectedCrypto,
      amount: transferAmount,
    }

    if (isEmail(recipient)) {
      transferData.to_email = recipient
    } else {
      transferData.to_user_id = Number(recipient)
    }

    createTransferMutation.mutate(transferData)
  }

  const getAvailableBalance = () => {
    if (!profile) return 0
    return Number(selectedCrypto === "bitcoin" ? profile.bitcoin_balance : profile.ethereum_balance) || 0
  }

  const getAvailableBalanceUSD = () => {
    if (!profile) return 0
    return Number(selectedCrypto === "bitcoin" ? profile.bitcoin_balance_usd : profile.ethereum_balance_usd) || 0
  }

  const safeFormatCrypto = (value: number | string | null | undefined, decimals = 8) => {
    const num = Number(value) || 0
    return num.toFixed(decimals)
  }

  const safeFormatCurrency = (value: number | string | null | undefined) => {
    const num = Number(value) || 0
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReturnToDashboard}
            className="text-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Crypto Transfers</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="text-foreground data-[state=active]:text-primary-foreground">
              Create Transfer
            </TabsTrigger>
            <TabsTrigger value="history" className="text-foreground data-[state=active]:text-primary-foreground">
              Transfer History
            </TabsTrigger>
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
                      <p className="text-sm text-muted-foreground">₿ {safeFormatCrypto(profile?.bitcoin_balance)}</p>
                      <p className="text-xs text-muted-foreground">
                        {safeFormatCurrency(profile?.bitcoin_balance_usd)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                    <Coins className="h-8 w-8 text-[var(--color-crypto-ethereum)]" />
                    <div>
                      <p className="font-medium">Ethereum</p>
                      <p className="text-sm text-muted-foreground">Ξ {safeFormatCrypto(profile?.ethereum_balance)}</p>
                      <p className="text-xs text-muted-foreground">
                        {safeFormatCurrency(profile?.ethereum_balance_usd)}
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
                <CardDescription>Choose which cryptocurrency you want to transfer</CardDescription>
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

            {/* Transfer Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Transfer Details</span>
                </CardTitle>
                <CardDescription>
                  Available: {safeFormatCrypto(getAvailableBalance(), 8)} {selectedCrypto.toUpperCase()} (
                  {safeFormatCurrency(getAvailableBalanceUSD())})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient (Email or Account ID)</Label>
                  <Input
                    type="text"
                    placeholder="Enter email address or account ID (digits only)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter either an email address (user@example.com) or account ID (123456789)
                  </p>
                </div>

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
                      className="h-auto p-0 text-primary hover:text-primary/80"
                      onClick={() => setAmount(getAvailableBalance().toString())}
                    >
                      Use Max
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Important Notes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Transfers are processed instantly on our platform</li>
                    <li>• Recipient must have a registered mining account</li>
                    <li>• Minimum transfer: 0.001 {selectedCrypto.toUpperCase()}</li>
                    <li>• All transfers are recorded for security</li>
                  </ul>
                </div>

                <Button
                  onClick={handleCreateTransfer}
                  disabled={createTransferMutation.isPending || !amount || !recipient}
                  className="w-full"
                >
                  {createTransferMutation.isPending ? "Processing..." : "Send Transfer"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {transfers?.map((transfer) => (
              <Card key={transfer.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transfer.direction === "sent"
                            ? "bg-blue-100 dark:bg-blue-900/20"
                            : "bg-green-100 dark:bg-green-900/20"
                        }`}
                      >
                        {transfer.crypto_type === "bitcoin" ? (
                          <Bitcoin
                            className={`h-5 w-5 ${
                              transfer.direction === "sent"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          />
                        ) : (
                          <Coins
                            className={`h-5 w-5 ${
                              transfer.direction === "sent"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {safeFormatCrypto(transfer.amount, 8)} {transfer.crypto_type.toUpperCase()}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              transfer.direction === "sent"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                            }`}
                          >
                            {transfer.direction === "sent" ? "→ Sent" : "← Received"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{safeFormatCurrency(transfer.usd_amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {transfer.direction === "sent"
                            ? `To: ${transfer.to_user?.email || `Account #${transfer.to_user?.id}`}`
                            : `From: ${transfer.from_user?.email || `Account #${transfer.from_user?.id}`}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(transfer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {transfer.transaction_hash && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">TX: {transfer.transaction_hash.slice(0, 20)}...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {(!transfers || transfers.length === 0) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transfers found</p>
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
