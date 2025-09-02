const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://chainminer.onrender.com"

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return SessionStorage.getItem("authToken")
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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  // Add authorization header if required
  if (requiresAuth) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const config: RequestInit = {
    method,
    headers,
  }

  if (body && method !== "GET") {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      if (response.status === 401) {
        // Clear auth data on unauthorized
        if (typeof window !== "undefined") {
          SessionStorage.removeItem("authToken")
          SessionStorage.removeItem("currentUser")
          window.location.href = "/login"
        }
        throw new Error("Unauthorized")
      }

      const errorData = await response.json().catch(() => ({ detail: "Request failed" }))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

export async function loginUser(email: string, password: string, twoFaToken?: string) {
  const response = await apiCall<{ access_token: string; token_type: string; user: any }>(
    "/login",
    "POST",
    {
      email,
      password,
      two_fa_token: twoFaToken,
    },
    false,
  )

  // Store auth token
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", response.access_token)
    localStorage.setItem("currentUser", JSON.stringify(response.user))
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
  return await apiCall<{ user: any; access_token: string }>("/register", "POST", userData, false)
}

export async function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
  }
}

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
