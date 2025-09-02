"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name?: string
  status: string
  points_balance: number
  bitcoin_balance: number
  ethereum_balance: number
  referral_code?: string
  email_verified: boolean
  is_admin: boolean
  is_agent: boolean
  created_at: string
}

interface AuthContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  clearAuthData: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = sessionStorage.getItem("currentUser")
    const token = sessionStorage.getItem("authToken")

    if (storedUser && token) {
      try {
        setCurrentUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user data:", error)
        clearAuthData()
      }
    }
  }, [])

  const clearAuthData = () => {
    sessionStorage.removeItem("currentUser")
    sessionStorage.removeItem("authToken")
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    setCurrentUser: (user: User | null) => {
      setCurrentUser(user)
      if (user) {
        sessionStorage.setItem("currentUser", JSON.stringify(user))
      }
    },
    clearAuthData,
    isAuthenticated: !!currentUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
