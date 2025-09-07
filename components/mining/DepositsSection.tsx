"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bitcoin, Coins, Copy, ArrowLeft } from "lucide-react"
import { apiCall, formatCurrency, formatCrypto } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface DepositInfo {
  crypto_type: string
  qr_code_url?: string
  wallet_address: string
}

interface CryptoRates {
  bitcoin_usd_rate: number
  ethereum_usd_rate: number
}

interface Deposit {
  id: number
  crypto_type: string
  amount: number
  usd_amount: number
  status: string
  transaction_hash?: string
  created_at: string
  evidence_url?: string
}

interface DepositsProps {
  onReturnToDashboard: () => void
}

export default function DepositsSection({ onReturnToDashboard }: DepositsProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [createdDepositId, setCreatedDepositId] = useState<number | null>(null)

  const [selectedCrypto, setSelectedCrypto] = useState<"bitcoin" | "ethereum">("bitcoin")

  // Separate state for user typing
  const [cryptoInput, setCryptoInput] = useState("")
  const [usdInput, setUsdInput] = useState("")

  // Converted amounts from API
  const [cryptoAmount, setCryptoAmount] = useState("")
  const [usdAmount, setUsdAmount] = useState("")

  const [transactionHash, setTransactionHash] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)

  const { toast } = useToast()
  const queryClient = useQueryClient()

  /** Route 1: Fetch deposit info */
  const { data: depositInfo } = useQuery<DepositInfo>({
    queryKey: ["/api/deposits/info", selectedCrypto],
    queryFn: () => apiCall<DepositInfo>(`/api/deposits/info/${selectedCrypto}`, "GET", null, true),
  })

  /** Route 2: Fetch crypto rates */
  const { data: rates } = useQuery<CryptoRates>({
    queryKey: ["/api/deposits/rates"],
    queryFn: () => apiCall<CryptoRates>("/api/deposits/rates", "GET", null, true),
  })

  /** Route 5 & 7: Fetch deposits and poll for status updates */
  const { data: deposits } = useQuery<Deposit[]>({
    queryKey: ["/api/user/deposits"],
    queryFn: () => apiCall<Deposit[]>("/api/user/deposits", "GET", null, true),
    refetchInterval: 15000,
  })

  /** Route 3: Convert amount via API */
  const convertAmount = async (value: string, type: "crypto" | "usd") => {
    if (!value) return { crypto: "", usd: "" }

    const payload =
      type === "crypto"
        ? { crypto_type: selectedCrypto, amount: Number.parseFloat(value) }
        : { crypto_type: selectedCrypto, usd_amount: Number.parseFloat(value) }

    const response = await apiCall<{ crypto_amount: number; usd_amount: number }>(
      "/api/deposits/convert",
      "POST",
      payload,
      true,
    )

    return {
      crypto: response.crypto_amount.toFixed(8),
      usd: response.usd_amount.toFixed(2),
    }
  }

  const handleCryptoInputChange = (value: string) => {
    setCryptoInput(value)
    convertAmount(value, "crypto")
      .then((converted) => {
        setCryptoAmount(converted.crypto)
        setUsdAmount(converted.usd)
        setUsdInput(converted.usd) // optional: keep input in sync if desired
      })
      .catch(() =>
        toast({
          title: "Conversion Error",
          description: "Failed to convert amount",
          variant: "destructive",
        }),
      )
  }

  const handleUsdInputChange = (value: string) => {
    setUsdInput(value)
    convertAmount(value, "usd")
      .then((converted) => {
        setCryptoAmount(converted.crypto)
        setUsdAmount(converted.usd)
        setCryptoInput(converted.crypto) // optional: keep input in sync
      })
      .catch(() =>
        toast({
          title: "Conversion Error",
          description: "Failed to convert amount",
          variant: "destructive",
        }),
      )
  }

  /** Route 4: Create deposit */
  const createDepositMutation = useMutation({
    mutationFn: (data: { crypto_type: string; amount?: number; usd_amount?: number; transaction_hash?: string }) =>
      apiCall("/api/deposits/create", "POST", data, true),
    onSuccess: (response: any) => {
      setCreatedDepositId(response.deposit_id)
      setCurrentStep(3)
      toast({
        title: "Deposit Created",
        description: "Your deposit has been created. You can upload proof if needed.",
      })
      queryClient.invalidateQueries({ queryKey: ["/api/user/deposits"] })
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to create deposit",
        variant: "destructive",
      })
    },
  })

  /** Route 6: Upload proof */
  const uploadProofMutation = useMutation({
    mutationFn: (data: { deposit_id: number; file: File }) => apiCall("/api/deposits/upload-proof", "POST", data, true),
    onSuccess: () => {
      toast({ title: "Proof Uploaded" })
      setProofFile(null)
      queryClient.invalidateQueries({ queryKey: ["/api/user/deposits"] })
    },
    onError: (err: any) =>
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload proof",
        variant: "destructive",
      }),
  })

  const submitDepositMutation = useMutation({
    mutationFn: (depositId: number) => apiCall(`/api/deposits/${depositId}/submit`, "POST", {}, true),
    onSuccess: () => {
      toast({
        title: "Deposit Submitted",
        description: "Your deposit has been submitted for admin review.",
      })
      queryClient.invalidateQueries({ queryKey: ["/api/user/deposits"] })
      // Reset to step 1
      setCurrentStep(1)
      setCreatedDepositId(null)
      setCryptoInput("")
      setUsdInput("")
      setCryptoAmount("")
      setUsdAmount("")
      setTransactionHash("")
      setProofFile(null)
    },
    onError: (error: any) => {
      toast({
        title: "Submit Failed",
        description: error.message || "Failed to submit deposit",
        variant: "destructive",
      })
    },
  })

  const handleProceedToDeposit = () => {
    const amount = Number.parseFloat(cryptoAmount || cryptoInput)
    const usd = Number.parseFloat(usdAmount || usdInput)

    if ((!amount || isNaN(amount)) && (!usd || isNaN(usd))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setCurrentStep(2)
  }

  const handleCreateDeposit = () => {
    const amount = Number.parseFloat(cryptoAmount || cryptoInput)
    const usd = Number.parseFloat(usdAmount || usdInput)

    createDepositMutation.mutate({
      crypto_type: selectedCrypto,
      amount: amount || undefined,
      usd_amount: usd || undefined,
      transaction_hash: transactionHash || undefined,
    })
  }

  const handleSubmitDeposit = async () => {
    console.log("[v0] handleSubmitDeposit called, createdDepositId:", createdDepositId)
    console.log("[v0] proofFile:", proofFile)
    console.log("[v0] submitDepositMutation.isPending:", submitDepositMutation.isPending)
    console.log("[v0] uploadProofMutation.isPending:", uploadProofMutation.isPending)

    if (!createdDepositId) {
      console.log("[v0] No createdDepositId, returning")
      toast({
        title: "Error",
        description: "No deposit ID found. Please create a deposit first.",
        variant: "destructive",
      })
      return
    }

    try {
      if (proofFile) {
        console.log("[v0] Uploading proof file:", proofFile.name)
        await uploadProofMutation.mutateAsync({
          deposit_id: createdDepositId,
          file: proofFile,
        })
        console.log("[v0] Proof uploaded successfully")
      }

      console.log("[v0] About to submit deposit with ID:", createdDepositId)
      console.log("[v0] submitDepositMutation object:", submitDepositMutation)

      const result = await submitDepositMutation.mutateAsync(createdDepositId)
      console.log("[v0] Deposit submitted successfully, result:", result)
    } catch (error) {
      console.log("[v0] Error in handleSubmitDeposit:", error)
      toast({
        title: "Submit Error",
        description: `Failed to submit deposit: ${error}`,
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    })
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
          <h1 className="text-lg font-semibold">Crypto Deposits</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Deposit</TabsTrigger>
            <TabsTrigger value="history">Deposit History</TabsTrigger>
          </TabsList>

          {/* Create Deposit */}
          <TabsContent value="create" className="space-y-6">
            {currentStep === 1 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Select Cryptocurrency</CardTitle>
                    <CardDescription>Choose which cryptocurrency you want to deposit</CardDescription>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Deposit Amount</CardTitle>
                    <CardDescription>Enter the amount you want to deposit</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{selectedCrypto.toUpperCase()} Amount</Label>
                        <Input
                          type="number"
                          step="0.00000001"
                          placeholder="0.00000000"
                          value={cryptoInput}
                          onChange={(e) => handleCryptoInputChange(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>USD Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={usdInput}
                          onChange={(e) => handleUsdInputChange(e.target.value)}
                        />
                      </div>
                    </div>

                    {rates && (
                      <div className="text-sm text-muted-foreground">
                        Current rate: 1 {selectedCrypto.toUpperCase()} ={" "}
                        {formatCurrency(
                          selectedCrypto === "bitcoin" ? rates.bitcoin_usd_rate : rates.ethereum_usd_rate,
                        )}
                      </div>
                    )}

                    <Button
                      onClick={handleProceedToDeposit}
                      disabled={!cryptoAmount && !cryptoInput && !usdAmount && !usdInput}
                      className="w-full"
                    >
                      Proceed to Deposit
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {currentStep === 2 && depositInfo && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {selectedCrypto === "bitcoin" ? (
                        <Bitcoin className="h-5 w-5 text-[var(--color-crypto-bitcoin)]" />
                      ) : (
                        <Coins className="h-5 w-5 text-[var(--color-crypto-ethereum)]" />
                      )}
                      <span>Send {selectedCrypto.toUpperCase()} to this address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {depositInfo.qr_code_url && (
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-lg">
                          <img
                            src={depositInfo.qr_code_url || "/placeholder.svg"}
                            alt="QR Code"
                            className="w-48 h-48"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Wallet Address</Label>
                      <div className="flex items-center space-x-2">
                        <Input value={depositInfo.wallet_address} readOnly className="font-mono text-sm" />
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(depositInfo.wallet_address)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Amount to Send</Label>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">
                          {formatCrypto(Number.parseFloat(cryptoAmount || cryptoInput), 8)}{" "}
                          {selectedCrypto.toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ≈ {formatCurrency(Number.parseFloat(usdAmount || usdInput))}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Transaction Hash (Optional)</Label>
                      <Input
                        placeholder="Enter transaction hash if already sent"
                        value={transactionHash}
                        onChange={(e) => setTransactionHash(e.target.value)}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button
                        onClick={handleCreateDeposit}
                        disabled={createDepositMutation.isPending}
                        className="flex-1"
                      >
                        {createDepositMutation.isPending ? "Creating..." : "Create Deposit"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Proof (Optional)</CardTitle>
                  <CardDescription>
                    Upload transaction proof if you have it, then submit your deposit for review
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Proof of Transaction (Optional)</Label>
                    <Input
                      type="file"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      accept="image/*,.pdf"
                    />
                    {proofFile && <p className="text-sm text-muted-foreground">Selected: {proofFile.name}</p>}
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Deposit Summary:</strong>
                    </p>
                    <p className="text-sm">
                      {formatCrypto(Number.parseFloat(cryptoAmount || cryptoInput), 8)} {selectedCrypto.toUpperCase()}≈{" "}
                      {formatCurrency(Number.parseFloat(usdAmount || usdInput))}
                    </p>
                    {transactionHash && (
                      <p className="text-xs text-muted-foreground mt-1">TX: {transactionHash.slice(0, 20)}...</p>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      console.log("[v0] Submit button clicked!")
                      handleSubmitDeposit()
                    }}
                    disabled={submitDepositMutation.isPending || uploadProofMutation.isPending}
                    className="w-full"
                  >
                    {submitDepositMutation.isPending || uploadProofMutation.isPending
                      ? "Submitting..."
                      : "Submit Deposit"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Deposit History */}
          <TabsContent value="history" className="space-y-4">
            {deposits?.map((deposit) => (
              <Card key={deposit.id}>
                <CardContent className="pt-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {deposit.crypto_type === "bitcoin" ? (
                        <Bitcoin className="h-5 w-5 text-[var(--color-crypto-bitcoin)]" />
                      ) : (
                        <Coins className="h-5 w-5 text-[var(--color-crypto-ethereum)]" />
                      )}
                      <div>
                        <p className="font-medium">
                          {formatCrypto(deposit.amount, 8)} {deposit.crypto_type.toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(deposit.usd_amount)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          deposit.status === "confirmed"
                            ? "default"
                            : deposit.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {deposit.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {deposit.transaction_hash && (
                    <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                      TX: {deposit.transaction_hash.slice(0, 20)}...
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {!deposits || deposits.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No deposits found</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
