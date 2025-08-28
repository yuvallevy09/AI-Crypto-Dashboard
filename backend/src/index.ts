import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import process from 'node:process';
import { HealthCheckSchema } from '@crypto-dashboard/shared';
import { prisma } from './lib/db.js';

const app = express();

/* ---------- Core server config ---------- */
app.set('trust proxy', 1);

/* ---------- Security & parsers ---------- */
// In dev, relax CSP so Next.js dev features/React refresh work smoothly
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

/* ---------- CORS ---------- */
const defaultFrontend = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = new Set<string>([
  defaultFrontend,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
]);

app.use(
  cors({
    credentials: true,
    origin(origin, cb) {
      // allow non-browser tools (curl/postman) with no Origin
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);

/* ---------- Rate limiting ---------- */
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ---------- Routes ---------- */
app.get('/health', (_req: Request, res: Response) => {
  const payload = { ok: true, ts: new Date().toISOString() };
  const parsed = HealthCheckSchema.safeParse(payload);
  if (!parsed.success) return res.status(500).json({ ok: false });
  res.json(parsed.data);
});

app.get('/db-health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ok: true,
      message: 'Database connection successful',
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      ok: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Crypto Dashboard API',
    version: '1.0.0',
    status: 'running',
    database: 'PostgreSQL + Prisma',
  });
});

/* ---------- Not found handler (optional) ---------- */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ ok: false, error: 'Not Found' });
});

/* ---------- Error handler (CORS, etc.) ---------- */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.message?.startsWith('CORS blocked for origin')) {
    return res.status(403).json({ ok: false, error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ ok: false, error: 'Internal Server Error' });
});

/* ---------- Startup & graceful shutdown ---------- */
const PORT = Number(process.env.PORT) || 5001;

const server = app.listen(PORT, () => {
  console.log(`✅ API listening on :${PORT}`);
  console.log(`📊 Database: PostgreSQL + Prisma`);
  console.log(`🔗 Frontend URL: ${defaultFrontend}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err: any) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try: PORT=${PORT + 1} npm -w backend run dev`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Closing gracefully...`);
  try {
    await prisma.$disconnect();
  } catch (e) {
    console.error('Error disconnecting Prisma:', e);
  }
  server.close(() => process.exit(0));
};

['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => void shutdown(sig)));
