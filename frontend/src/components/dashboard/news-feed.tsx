"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api"

interface NewsItem {
  id: number
  title: string
  published_at: string
  url: string
  domain: string
  source: {
    title: string
    region: string
    domain: string
  }
  currencies?: Array<{
    code: string
    title: string
  }>
  votes: {
    positive: number
    negative: number
    important: number
  }
  metadata?: {
    title?: string
    description?: string
    image?: {
      url?: string
    }
  }
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.getLatestNews(10)
        if (response.success) {
          setNews(response.data)
        } else {
          setError('Failed to load news')
        }
      } catch (err) {
        console.error('Error fetching news:', err)
        setError('Failed to load news')
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchNews()

    // Set up interval for refreshing news every 5 minutes (to respect 100 req/month quota)
    const interval = setInterval(fetchNews, 5 * 60 * 1000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  const getSentimentIcon = (votes: { positive: number; negative: number; important: number }) => {
    if (votes.important > 0) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
    if (votes.positive > votes.negative) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    }
    if (votes.negative > votes.positive) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getSentimentBadge = (votes: { positive: number; negative: number; important: number }) => {
    if (votes.important > 0) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Important</Badge>
    }
    if (votes.positive > votes.negative) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Positive</Badge>
    }
    if (votes.negative > votes.positive) {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Negative</Badge>
    }
    return <Badge variant="secondary">Neutral</Badge>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
          <CardDescription>Stay updated with crypto market news</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
          <CardDescription>Stay updated with crypto market news</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
        <CardDescription>Stay updated with crypto market news</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getSentimentIcon(item.votes)}
                    <h3 className="font-medium text-sm line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">
                      {item.source.title}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.published_at)}
                    </span>
                    {getSentimentBadge(item.votes)}
                  </div>

                  {item.currencies && item.currencies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.currencies.slice(0, 3).map((currency) => (
                        <Badge key={currency.code} variant="outline" className="text-xs">
                          {currency.code}
                        </Badge>
                      ))}
                      {item.currencies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.currencies.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(item.url, '_blank')}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
