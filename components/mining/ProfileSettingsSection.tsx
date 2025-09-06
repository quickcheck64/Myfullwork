"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { apiCall } from "@/lib/api"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"

export default function ProfileSettingsSection() {
  // Fetch user profile data
  const { data: user, isLoading, isError } = useQuery(["userProfile"], () =>
    apiCall("/api/user/profile", "GET", null, true)
  )

  if (isLoading) return <p>Loading profile...</p>
  if (isError) return <p>Failed to load profile.</p>

  // Prepare data for the pie chart
  const pieData = [
    { name: "Bitcoin", value: user?.bitcoin_balance_usd ?? 0 },
    { name: "Ethereum", value: user?.ethereum_balance_usd ?? 0 },
  ]

  const COLORS = ["#f7931a", "#627eea"] // Bitcoin orange, Ethereum blue

  return (
    <div className="min-h-screen p-4 bg-background space-y-6">
      {/* Portfolio Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-medium">
            Total Portfolio Value: ${user?.total_balance_usd ?? 0}
          </p>

          <div className="w-full h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: $${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value}`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium">{user?.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Birthday</p>
            <p className="font-medium">
              {user?.birthday_day && user?.birthday_month
                ? `${user.birthday_day}/${user.birthday_month}${user.birthday_year ? `/${user.birthday_year}` : ""}`
                : "N/A"}
            </p>
          </div>

          {/* Crypto Balances */}
          <div>
            <p className="text-muted-foreground">Bitcoin Balance</p>
            <p className="font-medium">
              {user?.bitcoin_balance ?? 0} BTC (~${user?.bitcoin_balance_usd ?? 0})
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Ethereum Balance</p>
            <p className="font-medium">
              {user?.ethereum_balance ?? 0} ETH (~${user?.ethereum_balance_usd ?? 0})
            </p>
          </div>

          {/* Referral */}
          <div>
            <p className="text-muted-foreground">Referral Code</p>
            <p className="font-medium">{user?.referral_code || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Referred Users</p>
            <p className="font-medium">{user?.referred_users_count ?? 0}</p>
          </div>

          {/* Wallets */}
          <div>
            <p className="text-muted-foreground">Bitcoin Wallet</p>
            <p className="font-medium">{user?.bitcoin_wallet || "N/A"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ethereum Wallet</p>
            <p className="font-medium">{user?.ethereum_wallet || "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
