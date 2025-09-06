"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { apiCall } from "@/lib/api"

export default function ProfileSettingsSection() {
  const { data: user } = useQuery(["userProfile"], () =>
    apiCall("/api/dashboard/stats", "GET", null, true)
  )

  return (
    <div className="min-h-screen p-4 bg-background">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                ? `${user.birthday_day}/${user.birthday_month}`
                : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
