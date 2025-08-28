import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create a test user
  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      username: "testuser",
      password: hashedPassword,
    },
  });

  console.log("✅ Created test user:", user.email);

  // Create a test portfolio
  const portfolio = await prisma.portfolio.upsert({
    where: {
      id: "test-portfolio-1",
    },
    update: {},
    create: {
      id: "test-portfolio-1",
      name: "My First Portfolio",
      description: "A test portfolio for development",
      userId: user.id,
    },
  });

  console.log("✅ Created test portfolio:", portfolio.name);

  // Add some test holdings
  const holdings = await Promise.all([
    prisma.portfolioHolding.upsert({
      where: {
        portfolioId_symbol: {
          portfolioId: portfolio.id,
          symbol: "BTC",
        },
      },
      update: {},
      create: {
        portfolioId: portfolio.id,
        symbol: "BTC",
        amount: 0.5,
        buyPrice: 45000,
        buyDate: new Date("2024-01-01"),
      },
    }),
    prisma.portfolioHolding.upsert({
      where: {
        portfolioId_symbol: {
          portfolioId: portfolio.id,
          symbol: "ETH",
        },
      },
      update: {},
      create: {
        portfolioId: portfolio.id,
        symbol: "ETH",
        amount: 2.0,
        buyPrice: 3000,
        buyDate: new Date("2024-01-15"),
      },
    }),
  ]);

  console.log("✅ Created test holdings:", holdings.map((h) => `${h.symbol}: ${h.amount}`));

  // Add some test watchlist items
  const watchlistItems = await Promise.all([
    prisma.watchlist.upsert({
      where: {
        userId_symbol: {
          userId: user.id,
          symbol: "SOL",
        },
      },
      update: {},
      create: {
        userId: user.id,
        symbol: "SOL",
      },
    }),
    prisma.watchlist.upsert({
      where: {
        userId_symbol: {
          userId: user.id,
          symbol: "ADA",
        },
      },
      update: {},
      create: {
        userId: user.id,
        symbol: "ADA",
      },
    }),
  ]);

  console.log("✅ Created watchlist items:", watchlistItems.map((w) => w.symbol));

  // Add some sample crypto prices
  const cryptoPrices = await Promise.all([
    prisma.cryptoPrice.create({
      data: {
        symbol: "BTC",
        price: 45000.0,
        marketCap: 850000000000,
        volume24h: 25000000000,
        change24h: 2.5,
      },
    }),
    prisma.cryptoPrice.create({
      data: {
        symbol: "ETH",
        price: 3000.0,
        marketCap: 350000000000,
        volume24h: 15000000000,
        change24h: -1.2,
      },
    }),
    prisma.cryptoPrice.create({
      data: {
        symbol: "SOL",
        price: 100.0,
        marketCap: 45000000000,
        volume24h: 2000000000,
        change24h: 5.8,
      },
    }),
  ]);

  console.log("✅ Created sample crypto prices");

  // Add some sample news articles
  const newsArticles = await Promise.all([
    prisma.newsArticle.upsert({
      where: {
        url: "https://example.com/bitcoin-news-1",
      },
      update: {},
      create: {
        title: "Bitcoin Reaches New All-Time High",
        content: "Bitcoin has reached a new all-time high, surpassing previous records...",
        url: "https://example.com/bitcoin-news-1",
        source: "CryptoNews",
        publishedAt: new Date(),
        sentiment: "positive",
      },
    }),
    prisma.newsArticle.upsert({
      where: {
        url: "https://example.com/ethereum-news-1",
      },
      update: {},
      create: {
        title: "Ethereum 2.0 Update Progress",
        content: "The Ethereum network continues to make progress on its 2.0 upgrade...",
        url: "https://example.com/ethereum-news-1",
        source: "CryptoDaily",
        publishedAt: new Date(),
        sentiment: "neutral",
      },
    }),
  ]);

  console.log("✅ Created sample news articles");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
