import { toast } from "@/hooks/use-toast"
import FingerprintJS from "@fingerprintjs/fingerprintjs"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.smarts9trading.online"

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

// Get auth token from sessionStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("authToken")
  }
  return null
}

export async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
  requiresAuth = true,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  const headers: Record<string, string> = {}

  // Add Authorization header if required
  if (requiresAuth) {
    const token = getAuthToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  const config: RequestInit = { method, headers }

  if (body && method !== "GET") {
    if (body instanceof FormData) {
      // For file uploads, do NOT set Content-Type; browser sets it automatically
      config.body = body
    } else {
      // For JSON requests
      headers["Content-Type"] = "application/json"
      config.body = JSON.stringify(body)
    }
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      if (response.status === 401) {
        // Clear auth data on unauthorized
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("authToken")
          sessionStorage.removeItem("currentUser")
          window.location.href = "/login"
        }
        throw new Error("Unauthorized")
      }

      // Try to parse error JSON, fallback to status text
      const errorData = await response.json().catch(() => ({ detail: response.statusText }))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }

    return response.json()
  } catch (error: any) {
    console.error(`API call failed for ${endpoint}:`, error)
    toast({
      title: "Network Error",
      description: error.message || "Could not connect to the server.",
      variant: "destructive",
    })
    throw error
  }
}

// -------------------------
// Device Fingerprint & IP
// -------------------------

export async function getIpAddress(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json")
    if (!response.ok) {
      console.warn("Failed to fetch IP address from ipify.org, status:", response.status)
      return "unknown"
    }
    const data = await response.json()
    return data.ip || "unknown"
  } catch (error) {
    console.error("Error fetching IP address:", error)
    return "unknown"
  }
}

export async function getDeviceFingerprint(): Promise<string> {
  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    return result.visitorId
  } catch (error) {
    console.error("Error generating device fingerprint:", error)
    return "unknown_fingerprint"
  }
}

// -------------------------
// Auth functions
// -------------------------

export async function loginUser(
  email: string,
  password: string,
  twoFaToken?: string,
  deviceFingerprint?: string,
  ipAddress?: string,
) {
  const response = await apiCall<{
    access_token: string
    token_type: string
    user: any
  }>(
    "/api/login",
    "POST",
    {
      email,
      password,
      two_fa_token: twoFaToken,
      device_fingerprint: deviceFingerprint,
      ip_address: ipAddress,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    },
    false,
  )

  if (typeof window !== "undefined") {
    sessionStorage.setItem("authToken", response.access_token)
    sessionStorage.setItem("currentUser", JSON.stringify(response.user))
  }

  return response
}

export async function registerUser(userData: {
  email: string
  password: string
  name: string
  pin: string
  referral_code?: string
}) {
  return await apiCall<{ user: any; access_token: string }>("/api/register", "POST", userData, false)
}

export async function logoutUser() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("currentUser")
  }
}

// -------------------------
// Format helpers
// -------------------------

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatCrypto = (amount: number, decimals = 6): string => {
  return amount.toFixed(decimals)
}

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}
