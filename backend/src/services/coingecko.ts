import { z } from 'zod'

// CoinGecko API response schemas
const CoinGeckoCoinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  current_price: z.number(),
  market_cap: z.number(),
  market_cap_rank: z.number(),
  fully_diluted_valuation: z.number().nullable(),
  total_volume: z.number(),
  high_24h: z.number(),
  low_24h: z.number(),
  price_change_24h: z.number(),
  price_change_percentage_24h: z.number(),
  market_cap_change_24h: z.number(),
  market_cap_change_percentage_24h: z.number(),
  circulating_supply: z.number(),
  total_supply: z.number().nullable(),
  max_supply: z.number().nullable(),
  ath: z.number(),
  ath_change_percentage: z.number(),
  ath_date: z.string(),
  atl: z.number(),
  atl_change_percentage: z.number(),
  atl_date: z.string(),
  roi: z.any().nullable(),
  last_updated: z.string(),
})

const CoinGeckoResponseSchema = z.array(CoinGeckoCoinSchema)

export type CoinGeckoCoin = z.infer<typeof CoinGeckoCoinSchema>

class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3'
  private apiKey = process.env.COINGECKO_API_KEY
  private lastRequestTime = 0
  // Conservative rate limiting: 1 request per 1.2 seconds (50 requests per minute)
  private readonly rateLimitDelay = 1200 // 1.2 seconds between requests
  
  // Simple in-memory cache with TTL
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly cacheTTL = 5 * 60 * 1000 // 5 minutes cache for price data

  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    return `${endpoint}?${sortedParams}`
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // Check cache first
    const cacheKey = this.getCacheKey(endpoint, params)
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      console.log('Using cached CoinGecko data for:', cacheKey)
      return cachedData as T
    }

    // Rate limiting
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest))
    }
    
    this.lastRequestTime = Date.now()
    console.log('CoinGecko API request:', endpoint)
    const url = new URL(`${this.baseUrl}${endpoint}`)
    
    // Add API key if available
    if (this.apiKey) {
      params.x_cg_demo_api_key = this.apiKey
    }

    // Add parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (response.status === 429) {
        console.warn('CoinGecko rate limit hit, using cached data if available')
        throw new Error('Rate limit exceeded')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`CoinGecko API error ${response.status}:`, errorText)
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Cache the successful response
      this.setCachedData(cacheKey, data)
      
      return data
    } catch (error) {
      console.error('CoinGecko API request failed:', error)
      throw error
    }
  }

  /**
   * Get current prices for specific coins
   */
  async getPrices(coinIds: string[]): Promise<CoinGeckoCoin[]> {
    const ids = coinIds.join(',')
    const data = await this.request<any[]>('/coins/markets', {
      vs_currency: 'usd',
      ids,
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: false,
      locale: 'en',
    })

    return CoinGeckoResponseSchema.parse(data)
  }

  /**
   * Get top coins by market cap
   */
  async getTopCoins(limit: number = 20): Promise<CoinGeckoCoin[]> {
    const data = await this.request<any[]>('/coins/markets', {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: limit,
      page: 1,
      sparkline: false,
      locale: 'en',
    })

    return CoinGeckoResponseSchema.parse(data)
  }

  /**
   * Get price history for a specific coin
   */
  async getPriceHistory(coinId: string, days: number = 7): Promise<any> {
    return this.request(`/coins/${coinId}/market_chart`, {
      vs_currency: 'usd',
      days,
    })
  }

  /**
   * Search for coins
   */
  async searchCoins(query: string): Promise<any> {
    return this.request('/search', { query })
  }

  /**
   * Get trending coins
   */
  async getTrendingCoins(): Promise<any> {
    const data = await this.request<any>('/search/trending')
    return (data as any).coins
  }

  /**
   * Get current API usage statistics
   */
  getUsageStats() {
    return {
      lastRequestTime: this.lastRequestTime,
      cacheSize: this.cache.size,
      rateLimitDelay: this.rateLimitDelay,
      cacheTTL: this.cacheTTL,
    }
  }
}

export const coinGeckoService = new CoinGeckoService()
