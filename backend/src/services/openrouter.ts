import { z } from 'zod'

// OpenRouter API response schemas
const OpenRouterMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
})

const OpenRouterResponseSchema = z.object({
  id: z.string(),
  choices: z.array(z.object({
    index: z.number(),
    message: z.object({
      role: z.string(),
      content: z.string(),
    }),
    finish_reason: z.string(),
  })),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
})

export type OpenRouterMessage = z.infer<typeof OpenRouterMessageSchema>

class OpenRouterService {
  private baseUrl = 'https://openrouter.ai/api/v1'
  private apiKey = process.env.OPENROUTER_API_KEY

  private async request<T>(endpoint: string, body: any): Promise<T> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
          'X-Title': 'Crypto Dashboard',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('OpenRouter API request failed:', error)
      throw error
    }
  }

  /**
   * Generate market analysis for a specific cryptocurrency
   */
  async generateMarketAnalysis(
    symbol: string,
    currentPrice: number,
    priceChange24h: number,
    marketCap: number,
    volume24h: number
  ): Promise<string> {
    const prompt = `Analyze the current market situation for ${symbol}:

Current Price: $${currentPrice.toLocaleString()}
24h Change: ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%
Market Cap: $${marketCap.toLocaleString()}
24h Volume: $${volume24h.toLocaleString()}

Provide a brief, professional market analysis (2-3 sentences) focusing on:
1. Key technical indicators
2. Market sentiment
3. Potential outlook

Keep it concise and informative for crypto investors.`

    const response = await this.request<any>('/chat/completions', {
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: 'You are a professional crypto market analyst. Provide clear, concise analysis based on the data provided.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    const parsed = OpenRouterResponseSchema.parse(response)
    return parsed.choices[0]?.message?.content || 'Analysis unavailable'
  }

  /**
   * Generate portfolio insights
   */
  async generatePortfolioInsights(
    portfolioData: Array<{
      symbol: string
      amount: number
      currentPrice: number
      buyPrice: number
      allocation: number
    }>
  ): Promise<string> {
    const portfolioSummary = portfolioData
      .map(asset => `${asset.symbol}: ${asset.amount} @ $${asset.currentPrice} (${asset.allocation.toFixed(1)}% allocation)`)
      .join('\n')

    const totalValue = portfolioData.reduce((sum, asset) => sum + (asset.currentPrice * asset.amount), 0)
    const totalChange = portfolioData.reduce((sum, asset) => {
      const change = ((asset.currentPrice - asset.buyPrice) / asset.buyPrice) * 100
      return sum + (change * asset.allocation / 100)
    }, 0)

    const prompt = `Analyze this crypto portfolio:

Portfolio Value: $${totalValue.toLocaleString()}
Total Return: ${totalChange > 0 ? '+' : ''}${totalChange.toFixed(2)}%

Holdings:
${portfolioSummary}

Provide 2-3 insights about:
1. Portfolio diversification
2. Risk assessment
3. Potential optimization suggestions

Keep it practical and actionable.`

    const response = await this.request<any>('/chat/completions', {
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: 'You are a professional crypto portfolio advisor. Provide practical insights and recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const parsed = OpenRouterResponseSchema.parse(response)
    return parsed.choices[0]?.message?.content || 'Portfolio analysis unavailable'
  }

  /**
   * Generate news sentiment analysis
   */
  async analyzeNewsSentiment(newsTitle: string, newsContent?: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral'
    confidence: number
    summary: string
  }> {
    const content = newsContent ? `${newsTitle}\n\n${newsContent}` : newsTitle

    const prompt = `Analyze the sentiment of this crypto news:

"${content}"

Provide a JSON response with:
- sentiment: "positive", "negative", or "neutral"
- confidence: number between 0 and 1
- summary: brief explanation of the sentiment (1 sentence)

Format as valid JSON only.`

    const response = await this.request<any>('/chat/completions', {
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: 'You are a crypto news sentiment analyzer. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    })

    const parsed = OpenRouterResponseSchema.parse(response)
    const responseContent = parsed.choices[0]?.message?.content || '{}'
    
    try {
      return JSON.parse(responseContent)
    } catch {
      return {
        sentiment: 'neutral' as const,
        confidence: 0.5,
        summary: 'Unable to analyze sentiment',
      }
    }
  }

  /**
   * Generate trading insights
   */
  async generateTradingInsights(
    symbol: string,
    priceData: Array<{ price: number; timestamp: string }>,
    marketData: any
  ): Promise<string> {
    const priceChange = ((priceData[priceData.length - 1].price - priceData[0].price) / priceData[0].price) * 100

    const prompt = `Based on the recent price movement for ${symbol}:

Price Change: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%
Current Price: $${priceData[priceData.length - 1].price.toLocaleString()}
Market Cap: $${marketData.market_cap?.toLocaleString() || 'N/A'}
Volume: $${marketData.total_volume?.toLocaleString() || 'N/A'}

Provide 1-2 trading insights focusing on:
1. Key support/resistance levels
2. Volume analysis
3. Short-term outlook

Keep it concise and actionable.`

    const response = await this.request<any>('/chat/completions', {
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: 'You are a crypto trading analyst. Provide clear, actionable insights.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.6,
    })

    const parsed = OpenRouterResponseSchema.parse(response)
    return parsed.choices[0]?.message?.content || 'Trading analysis unavailable'
  }
}

export const openRouterService = new OpenRouterService()
