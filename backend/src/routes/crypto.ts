import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { coinGeckoService } from '../services/coingecko.js'
import { cryptoPanicService } from '../services/cryptopanic.js'
import { openRouterService } from '../services/openrouter.js'

const router = Router()

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: any) => {
  const token = req.cookies.auth_token

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No authentication token'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    })
  }
}

// Get top cryptocurrencies
router.get('/top-coins', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20
    const coins = await coinGeckoService.getTopCoins(limit)
    
    res.json({
      success: true,
      data: coins
    })
  } catch (error) {
    console.error('Error fetching top coins:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cryptocurrency data'
    })
  }
})

// Get prices for specific coins
router.get('/prices', authenticateToken, async (req: Request, res: Response) => {
  try {
    const coinIds = (req.query.ids as string)?.split(',') || []
    
    if (coinIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No coin IDs provided'
      })
    }

    const coins = await coinGeckoService.getPrices(coinIds)
    
    res.json({
      success: true,
      data: coins
    })
  } catch (error) {
    console.error('Error fetching coin prices:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price data'
    })
  }
})

// Get price history for a specific coin
router.get('/price-history/:coinId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { coinId } = req.params
    const days = parseInt(req.query.days as string) || 7
    
    const history = await coinGeckoService.getPriceHistory(coinId, days)
    
    res.json({
      success: true,
      data: history
    })
  } catch (error) {
    console.error('Error fetching price history:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price history'
    })
  }
})

// Get trending coins
router.get('/trending', authenticateToken, async (req: Request, res: Response) => {
  try {
    const trending = await coinGeckoService.getTrendingCoins()
    
    res.json({
      success: true,
      data: trending
    })
  } catch (error) {
    console.error('Error fetching trending coins:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending data'
    })
  }
})

// Search coins
router.get('/search', authenticateToken, async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query required'
      })
    }

    const results = await coinGeckoService.searchCoins(query)
    
    res.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Error searching coins:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to search coins'
    })
  }
})

// Get latest news
router.get('/news', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20
    const news = await cryptoPanicService.getLatestNews(limit)
    
    res.json({
      success: true,
      data: news
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news'
    })
  }
})

// Get news for specific currencies
router.get('/news/currencies', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currencies = (req.query.currencies as string)?.split(',') || []
    const limit = parseInt(req.query.limit as string) || 20
    
    if (currencies.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No currencies specified'
      })
    }

    const news = await cryptoPanicService.getNewsForCurrencies(currencies, limit)
    
    res.json({
      success: true,
      data: news
    })
  } catch (error) {
    console.error('Error fetching currency news:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch currency news'
    })
  }
})

// Get news by sentiment
router.get('/news/sentiment/:sentiment', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { sentiment } = req.params
    const limit = parseInt(req.query.limit as string) || 20
    
    if (!['positive', 'negative', 'important'].includes(sentiment)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sentiment. Must be positive, negative, or important'
      })
    }

    const news = await cryptoPanicService.getNewsBySentiment(sentiment as any, limit)
    
    res.json({
      success: true,
      data: news
    })
  } catch (error) {
    console.error('Error fetching sentiment news:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sentiment news'
    })
  }
})

// Get AI market analysis
router.post('/ai/analysis', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { symbol, currentPrice, priceChange24h, marketCap, volume24h } = req.body
    
    if (!symbol || !currentPrice || !marketCap || !volume24h) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }

    const analysis = await openRouterService.generateMarketAnalysis(
      symbol,
      currentPrice,
      priceChange24h || 0,
      marketCap,
      volume24h
    )
    
    res.json({
      success: true,
      data: { analysis }
    })
  } catch (error) {
    console.error('Error generating AI analysis:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate analysis'
    })
  }
})

// Get AI portfolio insights
router.post('/ai/portfolio-insights', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { portfolioData } = req.body
    
    if (!portfolioData || !Array.isArray(portfolioData)) {
      return res.status(400).json({
        success: false,
        error: 'Portfolio data is required'
      })
    }

    const insights = await openRouterService.generatePortfolioInsights(portfolioData)
    
    res.json({
      success: true,
      data: { insights }
    })
  } catch (error) {
    console.error('Error generating portfolio insights:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate portfolio insights'
    })
  }
})

// Analyze news sentiment with AI
router.post('/ai/news-sentiment', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'News title is required'
      })
    }

    const sentiment = await openRouterService.analyzeNewsSentiment(title, content)
    
    res.json({
      success: true,
      data: sentiment
    })
  } catch (error) {
    console.error('Error analyzing news sentiment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to analyze sentiment'
    })
  }
})

// Get API usage statistics
router.get('/api-usage', authenticateToken, async (req: Request, res: Response) => {
  try {
    const usageStats = cryptoPanicService.getUsageStats()
    
    res.json({
      success: true,
      data: usageStats
    })
  } catch (error) {
    console.error('Error getting API usage stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get usage stats'
    })
  }
})

export default router
