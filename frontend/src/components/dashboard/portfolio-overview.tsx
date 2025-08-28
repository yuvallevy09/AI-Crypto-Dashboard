"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Wallet, TrendingUp, TrendingDown, Plus } from "lucide-react"

interface PortfolioAsset {
  symbol: string
  name: string
  amount: number
  currentPrice: number
  buyPrice: number
  allocation: number
}

interface PortfolioOverviewProps {
  totalValue: number
  totalChange: number
  assets: PortfolioAsset[]
  onAddAsset?: () => void
}

export function PortfolioOverview({ 
  totalValue, 
  totalChange, 
  assets, 
  onAddAsset 
}: PortfolioOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const calculateProfitLoss = (currentPrice: number, buyPrice: number, amount: number) => {
    return (currentPrice - buyPrice) * amount
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Portfolio Overview</h2>
        <Button onClick={onAddAsset}>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getChangeIcon(totalChange)}
              <Badge 
                variant={totalChange >= 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                assets.reduce((total, asset) => {
                  return total + calculateProfitLoss(asset.currentPrice, asset.buyPrice, asset.amount)
                }, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <p className="text-xs text-muted-foreground">Different cryptocurrencies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assets.length > 0 ? assets[0].symbol : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Highest allocation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assets.map((asset) => {
              const profitLoss = calculateProfitLoss(asset.currentPrice, asset.buyPrice, asset.amount)
              const profitLossPercent = ((asset.currentPrice - asset.buyPrice) / asset.buyPrice) * 100
              
              return (
                <div key={asset.symbol} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                        {asset.symbol}
                      </div>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.amount.toFixed(4)} {asset.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(asset.currentPrice * asset.amount)}</div>
                      <div className="flex items-center space-x-1 text-xs">
                        {getChangeIcon(profitLossPercent)}
                        <Badge 
                          variant={profitLossPercent >= 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Progress value={asset.allocation} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {asset.allocation.toFixed(1)}% of portfolio
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
