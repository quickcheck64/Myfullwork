"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Minimal user interface
interface User {
  id: string
  email: string
  name?: string
  status: string
  referral_code?: string
  email_verified: boolean
  is_admin: boolean
  is_agent: boolean
  created_at: string
}

interface AuthContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  saveAuthData: (token: string, user: User) => void
  clearAuthData: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Load stored user + token on mount
  useEffect(() => {
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

  // Save both token and user
  const saveAuthData = (token: string, user: User) => {
    sessionStorage.setItem("authToken", token)
    sessionStorage.setItem("currentUser", JSON.stringify(user))
    setCurrentUser(user)
  }

  const clearAuthData = () => {
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("currentUser")
    setCurrentUser(null)
  }

  const value: AuthContextType = {
    currentUser,
    setCurrentUser: (user: User | null) => {
      setCurrentUser(user)
      if (user) sessionStorage.setItem("currentUser", JSON.stringify(user))
    },
    saveAuthData,
    clearAuthData,
    isAuthenticated: !!currentUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
