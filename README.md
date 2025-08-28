# Crypto Dashboard

AI-powered cryptocurrency dashboard and advisor built with modern TypeScript stack.

## 🏗️ Architecture

This is a TypeScript monorepo with the following structure:

```
crypto-dashboard/
├── frontend/          # Next.js 14 App Router + React 18
├── backend/           # Express.js + Node.js 20
├── shared/            # Shared TypeScript package with Zod schemas
└── package.json       # Root workspace configuration
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (UI state) + TanStack Query (server state)
- **Charts**: Recharts (planned)

### Backend
- **Runtime**: Node.js 20 + Express.js
- **Language**: TypeScript
- **Real-time**: Server-Sent Events (SSE)
- **Security**: Helmet, CORS, Rate limiting
- **Database**: PostgreSQL + Prisma (planned)

### Shared
- **Validation**: Zod schemas
- **Type Safety**: TypeScript with strict mode

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd crypto-dashboard

# Install dependencies
npm install

# Build shared package
cd shared && npm run build && cd ..

# Start development servers
npm run dev
```

### Development Scripts

```bash
# Start both frontend and backend
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Build all packages
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📡 API Endpoints

### Backend (http://localhost:5001)
- `GET /` - API info
- `GET /health` - Health check with Zod validation

### Frontend (http://localhost:3000)
- `GET /` - Main dashboard page

## 🔧 Development

### Project Structure
```
frontend/
├── src/
│   ├── app/           # Next.js App Router pages
│   └── components/    # React components
├── tailwind.config.js # Tailwind configuration
└── package.json

backend/
├── src/
│   └── index.ts       # Express server
├── tsconfig.json
└── package.json

shared/
├── src/
│   └── index.ts       # Shared schemas and types
├── dist/              # Built JavaScript
└── package.json
```

### Adding New Features
1. **Shared schemas**: Add Zod schemas in `shared/src/`
2. **Backend routes**: Add Express routes in `backend/src/`
3. **Frontend pages**: Add Next.js pages in `frontend/src/app/`

## 🎯 Next Steps

This is the foundation setup. Next planned features:
1. Authentication with JWT + bcrypt
2. Database integration with Prisma
3. Real-time data with SSE
4. External API integrations (CoinGecko, CryptoPanic)
5. AI insights with OpenRouter/HF Inference
6. Charts and data visualization
7. Deployment setup (Vercel + Railway)

## 📝 License

MIT
