"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      try {
        // Check if user is authenticated
        const authResponse = await apiClient.getCurrentUser()

        if (authResponse.success && authResponse.user) {
          // User is authenticated, check onboarding status
          const onboardingResponse = await apiClient.getOnboardingStatus()

          if (onboardingResponse.success) {
            if (onboardingResponse.onboardingCompleted) {
              router.push('/dashboard')
            } else {
              router.push('/onboarding')
            }
          } else {
            router.push('/auth')
          }
        } else {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndOnboarding()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}
