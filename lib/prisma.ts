import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // On Vercel, each warm Lambda keeps its own pg Pool. Left unbounded (pg's
  // default max is 10) a burst of concurrent invocations opens far more
  // connections than Neon allows, and new connects time out with ETIMEDOUT —
  // the failure seen on /vendors. Two mitigations, both needed:
  //   1. Cap the per-instance pool small (PG_POOL_MAX, default 3).
  //   2. Point DATABASE_URL at Neon's POOLED endpoint (the "-pooler" host), so
  //      PgBouncer multiplexes these connections instead of each one holding a
  //      real Postgres backend. That change is an env var the owner sets in
  //      Vercel — see DEPLOY-TUESDAY.md.
  // connectionTimeoutMillis makes a stuck connect fail fast with a clear error
  // instead of hanging the request until the platform kills it.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.PG_POOL_MAX ?? 3),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  })
  const adapter = new PrismaPg(pool as any)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma: PrismaClient =
  global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
