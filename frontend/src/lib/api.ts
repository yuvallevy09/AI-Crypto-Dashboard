

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface AuthResponse {
  success: boolean
  user?: any
  error?: string
  message?: string
}

interface OnboardingStatusResponse {
  success: boolean
  onboardingCompleted: boolean
  preferences: {
    interestedAssets: string[]
    investorType: string | null
    contentPreferences: string[]
  }
}

interface CryptoResponse<T = any> {
  success: boolean
  data: T
  error?: string
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error')
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    })
  }

  async logout(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/me')
  }

  // Onboarding endpoints
  async completeOnboarding(data: {
    interestedAssets: string[]
    investorType: string
    contentPreferences: string[]
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getOnboardingStatus(): Promise<OnboardingStatusResponse> {
    return this.request<OnboardingStatusResponse>('/onboarding/status')
  }

  // Crypto endpoints
  async getTopCoins(limit: number = 20): Promise<CryptoResponse<any[]>> {
    return this.request<CryptoResponse<any[]>>(`/crypto/top-coins?limit=${limit}`)
  }

  async getCoinPrices(coinIds: string[]): Promise<CryptoResponse<any[]>> {
    const ids = coinIds.join(',')
    return this.request<CryptoResponse<any[]>>(`/crypto/prices?ids=${ids}`)
  }

  async getPriceHistory(coinId: string, days: number = 7): Promise<CryptoResponse<any>> {
    return this.request<CryptoResponse<any>>(`/crypto/price-history/${coinId}?days=${days}`)
  }

  async getTrendingCoins(): Promise<CryptoResponse<any[]>> {
    return this.request<CryptoResponse<any[]>>('/crypto/trending')
  }

  async searchCoins(query: string): Promise<CryptoResponse<any>> {
    return this.request<CryptoResponse<any>>(`/crypto/search?q=${encodeURIComponent(query)}`)
  }

  // News endpoints
  async getLatestNews(limit: number = 20): Promise<CryptoResponse<any[]>> {
    return this.request<CryptoResponse<any[]>>(`/crypto/news?limit=${limit}`)
  }

  async getNewsForCurrencies(currencies: string[], limit: number = 20): Promise<CryptoResponse<any[]>> {
    const currenciesParam = currencies.join(',')
    return this.request<CryptoResponse<any[]>>(`/crypto/news/currencies?currencies=${currenciesParam}&limit=${limit}`)
  }

  async getNewsBySentiment(sentiment: 'positive' | 'negative' | 'important', limit: number = 20): Promise<CryptoResponse<any[]>> {
    return this.request<CryptoResponse<any[]>>(`/crypto/news/sentiment/${sentiment}?limit=${limit}`)
  }

  // AI endpoints
  async getMarketAnalysis(data: {
    symbol: string
    currentPrice: number
    priceChange24h: number
    marketCap: number
    volume24h: number
  }): Promise<CryptoResponse<{ analysis: string }>> {
    return this.request<CryptoResponse<{ analysis: string }>>('/crypto/ai/analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPortfolioInsights(portfolioData: Array<{
    symbol: string
    amount: number
    currentPrice: number
    buyPrice: number
    allocation: number
  }>): Promise<CryptoResponse<{ insights: string }>> {
    return this.request<CryptoResponse<{ insights: string }>>('/crypto/ai/portfolio-insights', {
      method: 'POST',
      body: JSON.stringify({ portfolioData }),
    })
  }

  async analyzeNewsSentiment(title: string, content?: string): Promise<CryptoResponse<{
    sentiment: 'positive' | 'negative' | 'neutral'
    confidence: number
    summary: string
  }>> {
    return this.request<CryptoResponse<any>>('/crypto/ai/news-sentiment', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    })
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/health')
  }
}

export const apiClient = new ApiClient()
