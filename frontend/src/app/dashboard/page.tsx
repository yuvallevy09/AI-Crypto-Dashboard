"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { CryptoTable } from "@/components/dashboard/crypto-table"
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview"
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  Wallet,
  Eye
} from "lucide-react"

// Sample data - this will be replaced with real API calls
const sampleCryptoData = [
  {
    id: "1",
    symbol: "BTC",
    name: "Bitcoin",
    price: 43250.50,
    change24h: 2.5,
    marketCap: 850000000000,
    volume24h: 25000000000,
  },
  {
    id: "2",
    symbol: "ETH",
    name: "Ethereum",
    price: 2650.75,
    change24h: 1.8,
    marketCap: 320000000000,
    volume24h: 15000000000,
  },
  {
    id: "3",
    symbol: "SOL",
    name: "Solana",
    price: 98.25,
    change24h: -0.5,
    marketCap: 45000000000,
    volume24h: 2800000000,
  },
  {
    id: "4",
    symbol: "ADA",
    name: "Cardano",
    price: 0.485,
    change24h: 3.2,
    marketCap: 17000000000,
    volume24h: 850000000,
  },
  {
    id: "5",
    symbol: "DOT",
    name: "Polkadot",
    price: 7.85,
    change24h: 1.1,
    marketCap: 9500000000,
    volume24h: 420000000,
  },
]

const samplePortfolioData = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.5,
    currentPrice: 43250.50,
    buyPrice: 41000.00,
    allocation: 45.2,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    amount: 3.2,
    currentPrice: 2650.75,
    buyPrice: 2400.00,
    allocation: 32.1,
  },
  {
    symbol: "SOL",
    name: "Solana",
    amount: 25.0,
    currentPrice: 98.25,
    buyPrice: 85.00,
    allocation: 22.7,
  },
]

export default function DashboardPage() {
  const totalPortfolioValue = samplePortfolioData.reduce(
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
            value="$2.1T"
            change="+2.3%"
            changeType="positive"
            icon={DollarSign}
            description="Global crypto market cap"
          />
          <StatsCard
            title="24h Volume"
            value="$45.2B"
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

        {/* Portfolio Overview */}
        <PortfolioOverview
          totalValue={totalPortfolioValue}
          totalChange={8.2}
          assets={samplePortfolioData}
          onAddAsset={handleAddAsset}
        />

        {/* Crypto Market Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Market Overview</h2>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Top 5 by market cap
              </span>
            </div>
          </div>
          <CryptoTable 
            data={sampleCryptoData} 
            onAddToWatchlist={handleAddToWatchlist}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
