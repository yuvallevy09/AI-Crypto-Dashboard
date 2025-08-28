"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  TrendingUp,
  Eye,
  Newspaper,
  Settings,
  Plus,
  Wallet,
  BarChart3,
} from "lucide-react"

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-2 px-4">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Overview
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Markets
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Wallet className="mr-2 h-4 w-4" />
            Portfolio
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Watchlist
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Newspaper className="mr-2 h-4 w-4" />
            News
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </nav>
        
        <Separator className="my-4" />
        
        <div className="px-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add to Watchlist
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Wallet className="mr-2 h-4 w-4" />
              New Portfolio
            </Button>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="px-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Market Status
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>BTC</span>
              <Badge variant="secondary" className="text-xs">
                +2.5%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>ETH</span>
              <Badge variant="secondary" className="text-xs">
                +1.8%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>SOL</span>
              <Badge variant="destructive" className="text-xs">
                -0.5%
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  )
}
