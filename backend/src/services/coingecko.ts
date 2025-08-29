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

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
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

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
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
    const data = await this.request('/search/trending')
    return data.coins
  }
}

export const coinGeckoService = new CoinGeckoService()
