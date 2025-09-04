"use client"

import { useState, useEffect, useCallback } from "react"

interface User {
  id: string
  email: string
  name?: string
  status: string
  points_balance: number
  referral_code?: string
  email_verified: boolean
  is_admin: boolean
  is_agent: boolean
  created_at: string
}

interface AuthData {
  accessToken: string
  user: User
}

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = sessionStorage.getItem("accessToken")
      const storedUser = sessionStorage.getItem("currentUser")
      if (storedToken) {
        setAccessToken(storedToken)
      }
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser))
        } catch (e) {
          console.error("Failed to parse stored user data:", e)
          clearAuthData()
        }
      }
      setIsLoading(false)
    }
  }, [])

  const saveAuthData = useCallback((token: string, user: User) => {
    sessionStorage.setItem("accessToken", token)
    sessionStorage.setItem("currentUser", JSON.stringify(user))
    setAccessToken(token)
    setCurrentUser(user)
  }, [])

  const clearAuthData = useCallback(() => {
    sessionStorage.removeItem("accessToken")
    sessionStorage.removeItem("currentUser")
    setAccessToken(null)
    setCurrentUser(null)
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login for demo
    return Promise.resolve()
  }

  const logout = async () => {
    clearAuthData()
  }

  return {
    accessToken,
    currentUser,
    saveAuthData,
    clearAuthData,
    isLoading,
    login,
    logout,
  }
}
