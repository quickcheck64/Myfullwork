"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Send, ArrowRight, CheckCircle, AlertCircle, Info, ArrowLeft, Bitcoin, Coins } from "lucide-react"

interface TransferFormProps {
  onTransferSuccess: () => void
  onReturnToDashboard: () => void
}

export default function CryptoTransferForm({ onTransferSuccess, onReturnToDashboard }: TransferFormProps) {
  const [receiverEmail, setReceiverEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [cryptoType, setCryptoType] = useState<"bitcoin" | "ethereum">("bitcoin")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const isValidEmail = receiverEmail.includes("@") && receiverEmail.includes(".")
  const isValidAmount = amount && !isNaN(Number.parseFloat(amount)) && Number.parseFloat(amount) > 0
  const isFormValid = isValidEmail && isValidAmount && cryptoType

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    const transferAmount = Number.parseFloat(amount)

    if (!receiverEmail.trim() || isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid email and amount greater than zero.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      await apiCall(
        "/api/transfers/crypto",
        "POST",
        {
          to_email: receiverEmail,
          amount: transferAmount,
          crypto_type: cryptoType,
        },
        true,
      )

      toast({
        title: "Transfer Successful",
        description: `${cryptoType} transferred successfully!`,
      })

      setReceiverEmail("")
      setAmount("")
      setCryptoType("bitcoin")
      onTransferSuccess()
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer crypto.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Transfer Crypto</h1>
            <p className="text-muted-foreground">Send Bitcoin or Ethereum to other users</p>
          </div>
          <Button onClick={onReturnToDashboard} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Form Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Crypto Transfer</CardTitle>
                <p className="text-primary-foreground/80 text-sm">Send crypto to other miners</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Transfer Guidelines */}
            <div className="bg-muted border border-border rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mt-0.5">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-2">Transfer Guidelines</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Transfers are processed instantly on our platform</li>
                    <li>• Recipient must have a registered mining account</li>
                    <li>• Minimum transfer: 0.0001 BTC or 0.001 ETH</li>
                    <li>• All transfers are recorded for security</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Crypto Type Selection */}
              <div className="space-y-2">
                <Label className="text-base font-bold text-foreground">Cryptocurrency</Label>
                <Select value={cryptoType} onValueChange={(value: "bitcoin" | "ethereum") => setCryptoType(value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitcoin">
                      <div className="flex items-center space-x-2">
                        <Bitcoin className="h-4 w-4 text-[var(--color-crypto-bitcoin)]" />
                        <span>Bitcoin (BTC)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ethereum">
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-[var(--color-crypto-ethereum)]" />
                        <span>Ethereum (ETH)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recipient Email */}
              <div className="space-y-2">
                <Label htmlFor="receiverEmail" className="text-base font-bold text-foreground">
                  Recipient Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="receiverEmail"
                    type="email"
                    placeholder="Enter recipient's email address"
                    required
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    disabled={isLoading}
                    className={`h-12 pr-10 ${
                      receiverEmail && isValidEmail
                        ? "border-[var(--color-crypto-success)] bg-[var(--color-crypto-success)]/5"
                        : receiverEmail && !isValidEmail
                          ? "border-destructive bg-destructive/5"
                          : ""
                    }`}
                  />
                  {receiverEmail && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidEmail ? (
                        <CheckCircle className="h-5 w-5 text-[var(--color-crypto-success)]" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                {receiverEmail && !isValidEmail && (
                  <p className="text-sm text-destructive">Please enter a valid email address</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="transferAmount" className="text-base font-bold text-foreground">
                  Amount to Transfer
                </Label>
                <div className="relative">
                  <Input
                    id="transferAmount"
                    type="number"
                    placeholder={`Enter ${cryptoType === "bitcoin" ? "BTC" : "ETH"} amount`}
                    required
                    min={cryptoType === "bitcoin" ? 0.0001 : 0.001}
                    step={cryptoType === "bitcoin" ? 0.0001 : 0.001}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading}
                    className={`h-12 pr-16 ${
                      amount && isValidAmount
                        ? "border-[var(--color-crypto-success)] bg-[var(--color-crypto-success)]/5"
                        : amount && !isValidAmount
                          ? "border-destructive bg-destructive/5"
                          : ""
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {cryptoType === "bitcoin" ? "BTC" : "ETH"}
                    </Badge>
                    {amount &&
                      (isValidAmount ? (
                        <CheckCircle className="h-5 w-5 text-[var(--color-crypto-success)]" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ))}
                  </div>
                </div>
                {amount && !isValidAmount && (
                  <p className="text-sm text-destructive">
                    Amount must be at least {cryptoType === "bitcoin" ? "0.0001 BTC" : "0.001 ETH"}
                  </p>
                )}
              </div>

              {/* Transfer Preview */}
              {isFormValid && (
                <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <ArrowRight className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Transfer Preview</p>
                          <p className="text-xs text-muted-foreground">Ready to send</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                          {amount} {cryptoType === "bitcoin" ? "BTC" : "ETH"}
                        </p>
                        <p className="text-xs text-muted-foreground">to {receiverEmail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" className="w-full h-12 text-base font-bold" disabled={!isFormValid || isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Sending {cryptoType === "bitcoin" ? "Bitcoin" : "Ethereum"}...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Send {cryptoType === "bitcoin" ? "Bitcoin" : "Ethereum"}</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
