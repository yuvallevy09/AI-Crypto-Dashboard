import { HealthCheckSchema } from '@crypto-dashboard/shared'

async function getBackendStatus() {
  try {
    const response = await fetch('http://localhost:5001/health', { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      return { status: 'connected', data }
    } else {
      return { status: 'error', error: `HTTP ${response.status}` }
    }
  } catch (error) {
    return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export default async function HomePage() {
  const backendStatus = await getBackendStatus()

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'connected': return { text: '✅ Connected', className: 'text-green-600' }
      case 'error': return { text: '❌ Error', className: 'text-red-600' }
      default: return { text: '⏳ Checking...', className: 'text-yellow-600' }
    }
  }

  const statusDisplay = getStatusDisplay(backendStatus.status)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Crypto Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            AI-powered cryptocurrency dashboard and advisor
          </p>
          
          <div className="bg-card border rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Frontend:</span>
                <span className="text-green-600">✅ Running</span>
              </div>
              <div className="flex justify-between">
                <span>Backend API:</span>
                <span className={statusDisplay.className}>{statusDisplay.text}</span>
              </div>
              <div className="flex justify-between">
                <span>Shared Package:</span>
                <span className="text-green-600">✅ Available</span>
              </div>
            </div>
          </div>
          
                      <div className="mt-8 text-sm text-muted-foreground">
            <p>Shared package exports: {Object.keys(HealthCheckSchema.shape).join(', ')}</p>
            <p className="mt-2">Backend URL: http://localhost:5001</p>
            <p>Frontend URL: http://localhost:3000</p>
          </div>
        </div>
      </div>
    </div>
  )
}
