"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { CryptoTable } from "@/components/dashboard/crypto-table"
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview"
import { NewsFeed } from "@/components/dashboard/news-feed"
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  Wallet,
  Eye,
  Loader2
} from "lucide-react"
import { apiClient } from "@/lib/api"

interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
}

interface PortfolioAsset {
  symbol: string
  name: string
  amount: number
  currentPrice: number
  buyPrice: number
  allocation: number
}

export default function DashboardPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [portfolioData, setPortfolioData] = useState<PortfolioAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch top cryptocurrencies
        const cryptoResponse = await apiClient.getTopCoins(10)
        if (cryptoResponse.success) {
          setCryptoData(cryptoResponse.data)
        }

        // For now, use sample portfolio data
        // In a real app, this would come from the user's portfolio
        const samplePortfolioData: PortfolioAsset[] = [
          {
            symbol: "BTC",
            name: "Bitcoin",
            amount: 0.5,
            currentPrice: cryptoData.find(c => c.symbol === 'BTC')?.current_price || 43000,
            buyPrice: 41000,
            allocation: 45.2,
          },
          {
            symbol: "ETH",
            name: "Ethereum",
            amount: 3.2,
            currentPrice: cryptoData.find(c => c.symbol === 'ETH')?.current_price || 2600,
            buyPrice: 2400,
            allocation: 32.1,
          },
          {
            symbol: "SOL",
            name: "Solana",
            amount: 25.0,
            currentPrice: cryptoData.find(c => c.symbol === 'SOL')?.current_price || 98,
            buyPrice: 85,
            allocation: 22.7,
          },
        ]

        setPortfolioData(samplePortfolioData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalPortfolioValue = portfolioData.reduce(
    (total, asset) => total + (asset.currentPrice * asset.amount),
    0
  )

  const handleAddToWatchlist = (symbol: string) => {
    console.log(`Adding ${symbol} to watchlist`)
    // TODO: Implement watchlist functionality
  }

  const handleAddAsset = () => {
    console.log("Opening add asset dialog")
    // TODO: Implement add asset functionality
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your crypto dashboard. Track your portfolio and market trends.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Market Cap"
            value={`$${(cryptoData.reduce((sum, coin) => sum + coin.market_cap, 0) / 1e12).toFixed(1)}T`}
            change="+2.3%"
            changeType="positive"
            icon={DollarSign}
            description="Global crypto market cap"
          />
          <StatsCard
            title="24h Volume"
            value={`$${(cryptoData.reduce((sum, coin) => sum + coin.total_volume, 0) / 1e9).toFixed(1)}B`}
            change="+5.1%"
            changeType="positive"
            icon={Activity}
            description="Total trading volume"
          />
          <StatsCard
            title="Active Users"
            value="2.4M"
            change="+12.5%"
            changeType="positive"
            icon={Users}
            description="Active traders today"
          />
          <StatsCard
            title="Your Portfolio"
            value={`$${totalPortfolioValue.toLocaleString()}`}
            change="+8.2%"
            changeType="positive"
            icon={Wallet}
            description="Total portfolio value"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Portfolio Overview - Takes 2 columns */}
          <div className="lg:col-span-2">
            <PortfolioOverview
              totalValue={totalPortfolioValue}
              totalChange={8.2}
              assets={portfolioData}
              onAddAsset={handleAddAsset}
            />
          </div>

          {/* News Feed - Takes 1 column */}
          <div className="lg:col-span-1">
            <NewsFeed />
          </div>
        </div>

        {/* Crypto Market Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Market Overview</h2>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Top {cryptoData.length} by market cap
              </span>
            </div>
          </div>
          <CryptoTable 
            data={cryptoData.map(coin => ({
              id: coin.id,
              symbol: coin.symbol,
              name: coin.name,
              price: coin.current_price,
              change24h: coin.price_change_percentage_24h,
              marketCap: coin.market_cap,
              volume24h: coin.total_volume,
            }))} 
            onAddToWatchlist={handleAddToWatchlist}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
