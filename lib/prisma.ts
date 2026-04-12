import { PrismaClient } from '@prisma/client'
import path from 'path'

// Handles both SQLite JSON strings and PostgreSQL native arrays
function parseJsonArray(val: string | string[]): string[] {
  if (Array.isArray(val)) return val
  try { return JSON.parse(val) } catch { return val ? [val] : [] }
}

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? ''

  let base: PrismaClient
  if (!dbUrl || dbUrl.startsWith('file:')) {
    // SQLite (development) — use the BetterSqlite3 adapter
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
    base = new PrismaClient({ adapter })
  } else {
    // PostgreSQL / Neon (production)
    base = new PrismaClient()
  }

  // Always apply $extends so ExtendedPrismaClient has a single consistent type
  // with images/tags as string[] regardless of DB backend
  return base.$extends({
    result: {
      product: {
        images: {
          needs: { images: true },
          compute(p: { images: string | string[] }) {
            return parseJsonArray(p.images)
          },
        },
        tags: {
          needs: { tags: true },
          compute(p: { tags: string | string[] }) {
            return parseJsonArray(p.tags)
          },
        },
      },
      review: {
        images: {
          needs: { images: true },
          compute(r: { images: string | string[] }) {
            return parseJsonArray(r.images)
          },
        },
      },
    },
  })
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
