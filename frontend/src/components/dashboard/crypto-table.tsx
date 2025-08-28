"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, TrendingUp, TrendingDown } from "lucide-react"

interface CryptoData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
}

interface CryptoTableProps {
  data: CryptoData[]
  onAddToWatchlist?: (symbol: string) => void
}

export function CryptoTable({ data, onAddToWatchlist }: CryptoTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    } else {
      return `$${marketCap.toLocaleString()}`
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`
    } else {
      return `$${volume.toLocaleString()}`
    }
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">24h Change</TableHead>
            <TableHead className="text-right">Market Cap</TableHead>
            <TableHead className="text-right">Volume (24h)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((crypto) => (
            <TableRow key={crypto.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                    {crypto.symbol}
                  </div>
                  <div>
                    <div className="font-medium">{crypto.name}</div>
                    <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatPrice(crypto.price)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  {getChangeIcon(crypto.change24h)}
                  <Badge 
                    variant={crypto.change24h >= 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatMarketCap(crypto.marketCap)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatVolume(crypto.volume24h)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddToWatchlist?.(crypto.symbol)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
