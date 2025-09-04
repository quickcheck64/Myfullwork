"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
  saveAuthData: (token: string, user: User, requiresPin: boolean, requires2FA: boolean) => void
  clearAuthData: () => void
  isAuthenticated: boolean
  requiresPinVerify: boolean
  requires2FA: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [requiresPinVerify, setRequiresPinVerify] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)

  // Load stored auth data on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser")
    const token = sessionStorage.getItem("authToken")
    const pinRequired = sessionStorage.getItem("requiresPinVerify") === "true"
    const faRequired = sessionStorage.getItem("requires2FA") === "true"

    if (storedUser && token) {
      try {
        setCurrentUser(JSON.parse(storedUser))
        setRequiresPinVerify(pinRequired)
        setRequires2FA(faRequired)
      } catch (error) {
        console.error("Failed to parse stored user data:", error)
        clearAuthData()
      }
    }
  }, [])

  const saveAuthData = (token: string, user: User, requiresPin: boolean, requires2FA: boolean) => {
    sessionStorage.setItem("authToken", token)
    sessionStorage.setItem("currentUser", JSON.stringify(user))
    sessionStorage.setItem("requiresPinVerify", String(requiresPin))
    sessionStorage.setItem("requires2FA", String(requires2FA))
    setCurrentUser(user)
    setRequiresPinVerify(requiresPin)
    setRequires2FA(requires2FA)
  }

  const clearAuthData = () => {
    sessionStorage.clear()
    setCurrentUser(null)
    setRequiresPinVerify(false)
    setRequires2FA(false)
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
    requiresPinVerify,
    requires2FA,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
