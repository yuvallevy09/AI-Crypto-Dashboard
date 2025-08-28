# Frontend Components

This directory contains all the React components for the Crypto Dashboard frontend.

## Structure

```
components/
├── layout/           # Layout components (Header, Sidebar, DashboardLayout)
├── dashboard/        # Dashboard-specific components
├── ui/              # Reusable UI components (shadcn/ui + custom)
└── index.ts         # Component exports
```

## Layout Components

- **DashboardLayout**: Main layout wrapper with header and sidebar
- **Header**: Top navigation bar with user menu and status
- **Sidebar**: Left navigation with quick actions and market status

## Dashboard Components

- **StatsCard**: Reusable card for displaying key metrics
- **CryptoTable**: Table component for displaying cryptocurrency data
- **PortfolioOverview**: Portfolio summary with asset allocation

## UI Components

### shadcn/ui Components
All shadcn/ui components are available in the `ui/` directory:
- Button, Card, Input, Table
- Badge, Avatar, DropdownMenu
- Dialog, Sheet, Tabs
- Form, Label, Select
- Progress, Alert, Skeleton

### Custom Components
- **LoadingSpinner**: Simple loading spinner
- **LoadingCard**: Skeleton card for loading states
- **LoadingTable**: Skeleton table for loading states
- **ErrorBoundary**: Error boundary for graceful error handling

## Usage

```tsx
import { DashboardLayout, StatsCard, CryptoTable } from "@/components"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <StatsCard 
        title="Total Value"
        value="$10,000"
        change="+5.2%"
        changeType="positive"
        icon={Wallet}
      />
      <CryptoTable data={cryptoData} />
    </DashboardLayout>
  )
}
```

## Styling

All components use Tailwind CSS classes and follow the design system defined in the shadcn/ui configuration. The theme is based on the "stone" color palette with dark mode support.

## Icons

Icons are provided by Lucide React. Import them directly:

```tsx
import { Wallet, TrendingUp, Eye } from "lucide-react"
```

## Next Steps

1. Add more dashboard components (charts, news feed, etc.)
2. Implement responsive design for mobile devices
3. Add animations and transitions
4. Create form components for user interactions
5. Add accessibility features (ARIA labels, keyboard navigation)
