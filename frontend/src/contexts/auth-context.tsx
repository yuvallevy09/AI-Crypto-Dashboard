"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User } from "@crypto-dashboard/shared"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo?: string }>
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; redirectTo?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkOnboardingStatus = async (): Promise<string> => {
    try {
      const response = await fetch("http://localhost:5001/onboarding/status", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          return data.onboardingCompleted ? '/dashboard' : '/onboarding'
        }
      }
      return '/onboarding'
    } catch (error) {
      console.error("Onboarding status check failed:", error)
      return '/onboarding'
    }
  }

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:5001/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; redirectTo?: string }> => {
    try {
      const response = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        setUser(data.user)
        const redirectTo = await checkOnboardingStatus()
        return { success: true, redirectTo }
      }
      return { success: false }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false }
    }
  }

  const register = async (email: string, username: string, password: string): Promise<{ success: boolean; redirectTo?: string }> => {
    try {
      const response = await fetch("http://localhost:5001/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, username, password }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        setUser(data.user)
        // New users should always go to onboarding
        return { success: true, redirectTo: '/onboarding' }
      }
      return { success: false }
    } catch (error) {
      console.error("Registration failed:", error)
      return { success: false }
    }
  }

  const logout = async () => {
    try {
      await fetch("http://localhost:5001/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
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
