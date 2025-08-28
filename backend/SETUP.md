# Database Setup Guide

## Quick Setup

1. **Install PostgreSQL** (if not already installed):
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create Database**:
   ```bash
   createdb crypto_dashboard
   ```

3. **Update .env file** with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/crypto_dashboard"
   JWT_SECRET="your-super-secret-jwt-key"
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Setup Database**:
   ```bash
   npm run prisma:push
   npm run db:seed
   ```

5. **Start the server**:
   ```bash
   npm run dev
   ```

## Test Credentials
- Email: test@example.com
- Password: password123

## Available Commands
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
