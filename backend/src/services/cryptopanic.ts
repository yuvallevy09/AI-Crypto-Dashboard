import { z } from 'zod'

// CryptoPanic API v2 response schemas
const CryptoPanicNewsSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  published_at: z.string(),
  created_at: z.string(),
  kind: z.string(),
  // Note: v2 API doesn't include source, currencies, votes, or metadata in the basic response
  // We'll handle these as optional fields for backward compatibility
  source: z.object({
    title: z.string(),
    region: z.string(),
    domain: z.string(),
    path: z.string().nullable(),
  }).optional(),
  currencies: z.array(z.object({
    code: z.string(),
    title: z.string(),
    slug: z.string(),
    url: z.string(),
  })).optional(),
  votes: z.object({
    negative: z.number(),
    positive: z.number(),
    important: z.number(),
    liked: z.number(),
    disliked: z.number(),
    lol: z.number(),
    toxic: z.number(),
    saved: z.number(),
    comments: z.number(),
  }).optional(),
  metadata: z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
    image: z.object({
      url: z.string().nullable(),
      original_url: z.string().nullable(),
      width: z.number().nullable(),
      height: z.number().nullable(),
    }).nullable(),
  }).optional(),
})

const CryptoPanicResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(CryptoPanicNewsSchema),
})

export type CryptoPanicNews = z.infer<typeof CryptoPanicNewsSchema>

// Fallback news data when API is unavailable
const fallbackNews: CryptoPanicNews[] = [
  {
    id: 1,
    slug: "bitcoin-surges-past-45000",
    title: "Bitcoin Surges Past $45,000 as Institutional Adoption Grows",
    description: "Bitcoin continues its upward momentum as institutional investors show increasing interest in the cryptocurrency market.",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    kind: "news",
    source: {
      title: "Crypto News",
      region: "US",
      domain: "example.com",
      path: null,
    },
    currencies: [
      { code: "BTC", title: "Bitcoin", slug: "bitcoin", url: "https://cryptopanic.com/currencies/bitcoin/" }
    ],
    votes: {
      negative: 5,
      positive: 45,
      important: 2,
      liked: 45,
      disliked: 5,
      lol: 0,
      toxic: 0,
      saved: 12,
      comments: 8,
    },
    metadata: undefined,
  },
  {
    id: 2,
    slug: "ethereum-20-upgrade-promising",
    title: "Ethereum 2.0 Upgrade Shows Promising Results",
    description: "The latest Ethereum upgrade demonstrates significant improvements in scalability and efficiency.",
    published_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
    kind: "news",
    source: {
      title: "Blockchain Daily",
      region: "US",
      domain: "example.com",
      path: null,
    },
    currencies: [
      { code: "ETH", title: "Ethereum", slug: "ethereum", url: "https://cryptopanic.com/currencies/ethereum/" }
    ],
    votes: {
      negative: 3,
      positive: 38,
      important: 1,
      liked: 38,
      disliked: 3,
      lol: 0,
      toxic: 0,
      saved: 9,
      comments: 6,
    },
    metadata: undefined,
  },
  {
    id: 3,
    title: "Solana Network Achieves New Transaction Milestone",
    published_at: new Date(Date.now() - 7200000).toISOString(),
    url: "https://example.com/solana-milestone",
    domain: "example.com",
    source: {
      title: "Crypto Insights",
      region: "US",
      domain: "example.com",
      path: null,
    },
    currencies: [
      { code: "SOL", title: "Solana", slug: "solana", url: "https://cryptopanic.com/currencies/solana/" }
    ],
    votes: {
      negative: 2,
      positive: 32,
      important: 0,
      liked: 32,
      disliked: 2,
      lol: 0,
      toxic: 0,
      saved: 7,
      comments: 4,
    },
    metadata: undefined,
  },
  {
    id: 4,
    title: "DeFi Protocols See Record TVL Growth in Q4",
    published_at: new Date(Date.now() - 10800000).toISOString(),
    url: "https://example.com/defi-growth",
    domain: "example.com",
    source: {
      title: "DeFi Weekly",
      region: "US",
      domain: "example.com",
      path: null,
    },
    currencies: [
      { code: "UNI", title: "Uniswap", slug: "uniswap", url: "https://cryptopanic.com/currencies/uniswap/" },
      { code: "AAVE", title: "Aave", slug: "aave", url: "https://cryptopanic.com/currencies/aave/" }
    ],
    votes: {
      negative: 1,
      positive: 28,
      important: 1,
      liked: 28,
      disliked: 1,
      lol: 0,
      toxic: 0,
      saved: 6,
      comments: 3,
    },
    metadata: undefined,
  },
  {
    id: 5,
    title: "NFT Market Shows Signs of Recovery",
    published_at: new Date(Date.now() - 14400000).toISOString(),
    url: "https://example.com/nft-recovery",
    domain: "example.com",
    source: {
      title: "NFT Daily",
      region: "US",
      domain: "example.com",
      path: null,
    },
    currencies: [
      { code: "AXS", title: "Axie Infinity", slug: "axie-infinity", url: "https://cryptopanic.com/currencies/axie-infinity/" }
    ],
    votes: {
      negative: 4,
      positive: 25,
      important: 0,
      liked: 25,
      disliked: 4,
      lol: 0,
      toxic: 0,
      saved: 5,
      comments: 2,
    },
    metadata: undefined,
  },
]

class CryptoPanicService {
  private baseUrl = 'https://cryptopanic.com/api/developer/v2'
  private apiKey = process.env.CRYPTOPANIC_API_KEY
  private requestCount = 0
  private lastRequestTime = 0
  private readonly rateLimitDelay = 500 // 500ms between requests (2 req/sec)
  private monthlyRequestCount = 0
  private lastMonthReset = new Date().getMonth()
  
  // Simple in-memory cache with longer TTL for developer plan
  private cache = new Map<string, { data: CryptoPanicNews[]; timestamp: number }>()
  private readonly cacheTTL = 60 * 60 * 1000 // 1 hour cache (since news is 24h delayed anyway)

  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    return `${endpoint}?${sortedParams}`
  }

  private getCachedData(key: string): CryptoPanicNews[] | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: CryptoPanicNews[]): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // Check cache first
    const cacheKey = this.getCacheKey(endpoint, params)
    const cachedData = this.getCachedData(cacheKey)
    if (cachedData) {
      console.log('Using cached data for:', cacheKey)
      return cachedData as T
    }

    // Check monthly quota (100 requests per month for developer plan)
    const currentMonth = new Date().getMonth()
    if (currentMonth !== this.lastMonthReset) {
      this.monthlyRequestCount = 0
      this.lastMonthReset = currentMonth
    }

    if (this.monthlyRequestCount >= 100) {
      console.warn('Monthly quota exceeded (100 requests), using fallback data')
      throw new Error('Monthly quota exceeded')
    }

    // Rate limiting (2 requests per second)
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest))
    }
    
    this.lastRequestTime = Date.now()
    this.requestCount++
    this.monthlyRequestCount++
    
    console.log(`CryptoPanic API request #${this.monthlyRequestCount}/100 this month`)

    const url = new URL(`${this.baseUrl}${endpoint}`)
    
    // Add API key if available
    if (this.apiKey) {
      params.auth_token = this.apiKey
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
          'User-Agent': 'CryptoDashboard/1.0',
        },
      })

      if (response.status === 429) {
        console.warn('CryptoPanic rate limit hit, using fallback data')
        throw new Error('Rate limit exceeded')
      }

      if (!response.ok) {
        throw new Error(`CryptoPanic API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('CryptoPanic API request failed:', error)
      throw error
    }
  }

  /**
   * Get latest news with fallback
   */
  async getLatestNews(limit: number = 20): Promise<CryptoPanicNews[]> {
    try {
      const data = await this.request<any>('/posts/', {
        filter: 'hot',
        limit,
      })

      const results = CryptoPanicResponseSchema.parse(data).results
      
      // Cache the results
      const cacheKey = this.getCacheKey('/posts/', { filter: 'hot', limit })
      this.setCachedData(cacheKey, results)
      
      return results
    } catch (error) {
      console.warn('Using fallback news data due to API error:', error)
      return fallbackNews.slice(0, limit)
    }
  }

  /**
   * Get news for specific currencies with fallback
   */
  async getNewsForCurrencies(currencies: string[], limit: number = 20): Promise<CryptoPanicNews[]> {
    try {
      const currenciesParam = currencies.join(',')
      const data = await this.request<any>('/posts/', {
        currencies: currenciesParam,
        filter: 'hot',
        limit,
      })

      const results = CryptoPanicResponseSchema.parse(data).results
      
      // Cache the results
      const cacheKey = this.getCacheKey('/posts/', { currencies: currenciesParam, filter: 'hot', limit })
      this.setCachedData(cacheKey, results)
      
      return results
    } catch (error) {
      console.warn('Using fallback news data for currencies due to API error:', error)
      // Filter fallback news by requested currencies
      return fallbackNews
        .filter(news => 
          news.currencies?.some((currency: { code: string }) => 
            currencies.includes(currency.code)
          )
        )
        .slice(0, limit)
    }
  }

  /**
   * Get news by sentiment with fallback
   */
  async getNewsBySentiment(sentiment: 'positive' | 'negative' | 'important', limit: number = 20): Promise<CryptoPanicNews[]> {
    try {
      const data = await this.request<any>('/posts/', {
        filter: sentiment,
        limit,
      })

      const results = CryptoPanicResponseSchema.parse(data).results
      
      // Cache the results
      const cacheKey = this.getCacheKey('/posts/', { filter: sentiment, limit })
      this.setCachedData(cacheKey, results)
      
      return results
    } catch (error) {
      console.warn('Using fallback news data for sentiment due to API error:', error)
      // Filter fallback news by sentiment
      return fallbackNews
        .filter(news => {
          const votes = news.votes
          if (!votes) return true // If no votes data, include the news
          switch (sentiment) {
            case 'positive':
              return votes.positive > votes.negative
            case 'negative':
              return votes.negative > votes.positive
            case 'important':
              return votes.important > 0
            default:
              return true
          }
        })
        .slice(0, limit)
    }
  }

  /**
   * Search news with fallback
   */
  async searchNews(query: string, limit: number = 20): Promise<CryptoPanicNews[]> {
    try {
      const data = await this.request<any>('/posts/', {
        q: query,
        limit,
      })

      const results = CryptoPanicResponseSchema.parse(data).results
      
      // Cache the results
      const cacheKey = this.getCacheKey('/posts/', { q: query, limit })
      this.setCachedData(cacheKey, results)
      
      return results
    } catch (error) {
      console.warn('Using fallback news data for search due to API error:', error)
      // Simple search in fallback data
      const searchTerm = query.toLowerCase()
      return fallbackNews
        .filter(news => 
          news.title.toLowerCase().includes(searchTerm) ||
          news.currencies?.some((currency: { title: string; code: string }) => 
            currency.title.toLowerCase().includes(searchTerm) ||
            currency.code.toLowerCase().includes(searchTerm)
          )
        )
        .slice(0, limit)
    }
  }

  /**
   * Get trending news with fallback
   */
  async getTrendingNews(limit: number = 20): Promise<CryptoPanicNews[]> {
    try {
      const data = await this.request<any>('/posts/', {
        filter: 'rising',
        limit,
      })

      const results = CryptoPanicResponseSchema.parse(data).results
      
      // Cache the results
      const cacheKey = this.getCacheKey('/posts/', { filter: 'rising', limit })
      this.setCachedData(cacheKey, results)
      
      return results
    } catch (error) {
      console.warn('Using fallback news data for trending due to API error:', error)
      // Return fallback news sorted by positive votes (trending)
      return fallbackNews
        .sort((a, b) => (b.votes?.positive || 0) - (a.votes?.positive || 0))
        .slice(0, limit)
    }
  }

  /**
   * Get current API usage statistics
   */
  getUsageStats() {
    return {
      monthlyRequests: this.monthlyRequestCount,
      monthlyLimit: 100,
      requestsRemaining: 100 - this.monthlyRequestCount,
      lastRequestTime: this.lastRequestTime,
      cacheSize: this.cache.size,
    }
  }
}

export const cryptoPanicService = new CryptoPanicService()
