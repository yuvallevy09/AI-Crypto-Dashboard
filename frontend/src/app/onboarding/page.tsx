"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"
import { TrendingUp } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    interestedAssets: [] as string[],
    investorType: "" as string,
    contentPreferences: [] as string[],
  })

  const handleStepComplete = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }))
    setCurrentStep(prev => prev + 1)
  }

  const handleComplete = async (finalData: any) => {
    const completeData = { ...formData, ...finalData }
    
    try {
      const response = await apiClient.completeOnboarding(completeData)

      if (response.success) {
        router.push('/dashboard')
      } else {
        console.error('Onboarding failed:', response.error)
        // You could show an error message to the user here
      }
    } catch (error) {
      console.error('Onboarding error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Welcome to Crypto Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Let's personalize your experience with a few quick questions
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${
                step <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Onboarding form */}
        <OnboardingForm
          currentStep={currentStep}
          formData={formData}
          onStepComplete={handleStepComplete}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
