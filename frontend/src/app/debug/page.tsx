"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"

export default function DebugPage() {
  const [backendStatus, setBackendStatus] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null)
  const [cryptoStatus, setCryptoStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runTests = async () => {
      try {
        setLoading(true)
        console.log('Starting debug tests...')

        // Test 0: Backend connectivity
        console.log('Testing backend connectivity...')
        try {
          const healthResponse = await fetch('http://localhost:5001/health')
          const healthData = await healthResponse.json()
          console.log('Backend health response:', healthData)
          setBackendStatus({ success: healthResponse.ok, data: healthData })
        } catch (healthError) {
          console.error('Backend health check failed:', healthError)
          setBackendStatus({ success: false, error: healthError.message })
        }

        // Test 1: Authentication
        console.log('Testing authentication...')
        try {
          const authResponse = await apiClient.getCurrentUser()
          console.log('Auth response:', authResponse)
          setAuthStatus(authResponse)
        } catch (authError) {
          console.error('Auth test failed:', authError)
          setAuthStatus({ success: false, error: authError.message })
        }

        // Test 2: Onboarding (if authenticated)
        if (authStatus?.success && authStatus?.user) {
          console.log('Testing onboarding status...')
          try {
            const onboardingResponse = await apiClient.getOnboardingStatus()
            console.log('Onboarding response:', onboardingResponse)
            setOnboardingStatus(onboardingResponse)
          } catch (onboardingError) {
            console.error('Onboarding test failed:', onboardingError)
            setOnboardingStatus({ success: false, error: onboardingError.message })
          }
        }

        // Test 3: Crypto API (if authenticated)
        if (authStatus?.success && authStatus?.user) {
          console.log('Testing crypto API...')
          try {
            const cryptoResponse = await apiClient.getTopCoins(3)
            console.log('Crypto response:', cryptoResponse)
            setCryptoStatus(cryptoResponse)
          } catch (cryptoError) {
            console.error('Crypto test failed:', cryptoError)
            setCryptoStatus({ success: false, error: cryptoError.message })
          }
        }

      } catch (error) {
        console.error('Debug test error:', error)
        setAuthStatus({ success: false, error: error.message })
      } finally {
        console.log('Debug tests completed')
        setLoading(false)
      }
    }

    runTests()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
        <p>Running tests...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <div className="space-y-6">
        {/* Backend Status */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Backend Connectivity</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(backendStatus, null, 2)}
          </pre>
          {backendStatus?.success ? (
            <p className="text-green-600 mt-2">✅ Backend is reachable</p>
          ) : (
            <p className="text-red-600 mt-2">❌ Backend is not reachable</p>
          )}
        </div>

        {/* Authentication Status */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
          {authStatus?.success ? (
            <p className="text-green-600 mt-2">✅ User is authenticated</p>
          ) : (
            <p className="text-red-600 mt-2">❌ User is not authenticated</p>
          )}
        </div>

        {/* Onboarding Status */}
        {authStatus?.success && (
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Onboarding Status</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(onboardingStatus, null, 2)}
            </pre>
            {onboardingStatus?.onboardingCompleted ? (
              <p className="text-green-600 mt-2">✅ Onboarding completed</p>
            ) : (
              <p className="text-yellow-600 mt-2">⚠️ Onboarding not completed</p>
            )}
          </div>
        )}

        {/* Crypto API Status */}
        {authStatus?.success && (
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Crypto API Status</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(cryptoStatus, null, 2)}
            </pre>
            {cryptoStatus?.success ? (
              <p className="text-green-600 mt-2">✅ Crypto API working</p>
            ) : (
              <p className="text-red-600 mt-2">❌ Crypto API failed</p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h2 className="text-lg font-semibold mb-2">Next Steps</h2>
          {!authStatus?.success ? (
            <div>
              <p className="mb-2">You need to authenticate first:</p>
              <a 
                href="/auth" 
                className="text-blue-600 hover:underline"
              >
                Go to Login/Register →
              </a>
            </div>
          ) : !onboardingStatus?.onboardingCompleted ? (
            <div>
              <p className="mb-2">You need to complete onboarding:</p>
              <a 
                href="/onboarding" 
                className="text-blue-600 hover:underline"
              >
                Go to Onboarding →
              </a>
            </div>
          ) : (
            <div>
              <p className="mb-2">Everything looks good! You can now access the dashboard:</p>
              <a 
                href="/dashboard" 
                className="text-blue-600 hover:underline"
              >
                Go to Dashboard →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
