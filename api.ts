import { toast } from "@/hooks/use-toast"
import FingerprintJS from "@fingerprintjs/fingerprintjs"

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.survecta.com/api"

interface ApiCallOptions {
  [key: string]: string | number | boolean | undefined | null
}

export async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data: any = null,
  requiresAuth = false,
  queryParams: ApiCallOptions = {},
): Promise<T> {
  let url = `${BASE_API_URL}${endpoint}`
  const options: RequestInit = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  }

  if (method === "GET" && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams()
    for (const key in queryParams) {
      const value = queryParams[key]
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    }
    url = `${url}?${params.toString()}`
  } else if (data) {
    options.body = JSON.stringify(data)
  }

  if (requiresAuth) {
    const token = sessionStorage.getItem("accessToken")
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this feature.",
        variant: "destructive",
      })
      sessionStorage.removeItem("accessToken")
      sessionStorage.removeItem("currentUser")
      window.location.href = "/login"
      throw new Error("No authentication token found. Please log in.")
    }
    ;(options.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, options)
    const responseData = await response.json()

    if (!response.ok) {
      const errorMessage = responseData.detail || "An unknown error occurred."

      if (response.status === 401 && requiresAuth) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        sessionStorage.removeItem("accessToken")
        sessionStorage.removeItem("currentUser")
        window.location.href = "/login"
        throw new Error("Session expired. Please log in again.")
      }

      toast({
        title: "API Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw new Error(errorMessage)
    }
    return responseData as T
  } catch (error: any) {
    console.error("API Call Error:", error)
    if (!error.message.includes("No authentication token found") && !error.message.includes("Session expired")) {
      toast({
        title: "Network Error",
        description: error.message || "Could not connect to the server.",
        variant: "destructive",
      })
    }
    throw error
  }
}

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
