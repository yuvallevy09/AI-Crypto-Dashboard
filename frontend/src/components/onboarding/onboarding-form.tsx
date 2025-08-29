"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronRight, ChevronLeft } from "lucide-react"

interface OnboardingFormProps {
  currentStep: number
  formData: {
    interestedAssets: string[]
    investorType: string
    contentPreferences: string[]
  }
  onStepComplete: (data: any) => void
  onComplete: (data: any) => void
}

const cryptoAssets = [
  { symbol: "BTC", name: "Bitcoin", description: "The original cryptocurrency" },
  { symbol: "ETH", name: "Ethereum", description: "Smart contract platform" },
  { symbol: "SOL", name: "Solana", description: "High-performance blockchain" },
  { symbol: "ADA", name: "Cardano", description: "Research-driven blockchain" },
  { symbol: "DOT", name: "Polkadot", description: "Multi-chain network" },
  { symbol: "MATIC", name: "Polygon", description: "Layer 2 scaling solution" },
  { symbol: "LINK", name: "Chainlink", description: "Oracle network" },
  { symbol: "UNI", name: "Uniswap", description: "Decentralized exchange" },
]

const investorTypes = [
  {
    type: "HODLer",
    description: "Long-term holder who believes in the technology",
    icon: "💎"
  },
  {
    type: "Day Trader",
    description: "Active trader looking for short-term opportunities",
    icon: "📈"
  },
  {
    type: "NFT Collector",
    description: "Focused on digital art and collectibles",
    icon: "🎨"
  },
  {
    type: "DeFi User",
    description: "Interested in decentralized finance protocols",
    icon: "🏦"
  },
  {
    type: "Long-term Investor",
    description: "Strategic investor with diversified portfolio",
    icon: "📊"
  },
]

const contentTypes = [
  {
    type: "Market News",
    description: "Latest crypto market updates and analysis",
    icon: "📰"
  },
  {
    type: "Charts",
    description: "Technical analysis and price charts",
    icon: "📊"
  },
  {
    type: "Social",
    description: "Community discussions and social sentiment",
    icon: "💬"
  },
  {
    type: "Fun",
    description: "Memes, trends, and entertaining content",
    icon: "🎉"
  },
]

export function OnboardingForm({ currentStep, formData, onStepComplete, onComplete }: OnboardingFormProps) {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(formData.interestedAssets)
  const [selectedInvestorType, setSelectedInvestorType] = useState(formData.investorType)
  const [selectedContent, setSelectedContent] = useState<string[]>(formData.contentPreferences)

  const handleAssetToggle = (symbol: string) => {
    setSelectedAssets(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }

  const handleContentToggle = (type: string) => {
    setSelectedContent(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedAssets.length === 0) return
      onStepComplete({ interestedAssets: selectedAssets })
    } else if (currentStep === 2) {
      if (!selectedInvestorType) return
      onStepComplete({ investorType: selectedInvestorType })
    } else if (currentStep === 3) {
      if (selectedContent.length === 0) return
      onComplete({ contentPreferences: selectedContent })
    }
  }

  const handleBack = () => {
    // This would go back to previous step
    // For now, we'll keep it simple
  }

  const canProceed = () => {
    if (currentStep === 1) return selectedAssets.length > 0
    if (currentStep === 2) return selectedInvestorType !== ""
    if (currentStep === 3) return selectedContent.length > 0
    return false
  }

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">What crypto assets are you interested in?</CardTitle>
        <CardDescription>
          Select the cryptocurrencies you'd like to track and learn more about
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cryptoAssets.map((asset) => (
            <div
              key={asset.symbol}
              onClick={() => handleAssetToggle(asset.symbol)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedAssets.includes(asset.symbol)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{asset.symbol}</div>
                  <div className="text-sm text-muted-foreground">{asset.name}</div>
                  <div className="text-xs text-muted-foreground">{asset.description}</div>
                </div>
                {selectedAssets.includes(asset.symbol) && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedAssets.length} selected
          </div>
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">What type of investor are you?</CardTitle>
        <CardDescription>
          Help us customize your dashboard experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {investorTypes.map((investor) => (
            <div
              key={investor.type}
              onClick={() => setSelectedInvestorType(investor.type)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedInvestorType === investor.type
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{investor.icon}</span>
                <div>
                  <div className="font-semibold">{investor.type}</div>
                  <div className="text-sm text-muted-foreground">{investor.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">What kind of content would you like to see?</CardTitle>
        <CardDescription>
          Choose the types of content that interest you most
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contentTypes.map((content) => (
            <div
              key={content.type}
              onClick={() => handleContentToggle(content.type)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedContent.includes(content.type)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{content.icon}</span>
                <div>
                  <div className="font-semibold">{content.type}</div>
                  <div className="text-sm text-muted-foreground">{content.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()}>
            Complete Setup <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  )
}
