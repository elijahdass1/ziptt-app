// Clears fabricated demo "trust" metrics so the live store shows honest
// numbers before launch. Zeroes:
//
//   Product.soldCount, Product.reviewCount, Product.rating
//   Vendor.rating, Vendor.totalSales   (same demo-seeded fabrications)
//
// Does NOT touch real orders, real users, real reviews, or product
// listings/prices — only the cached aggregate counters that were seeded
// with made-up values.
//
// Run with:  npm run clear:fake-trust   (needs DATABASE_URL in env)
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set — cannot clear fake trust data.')
  }

  const products = await prisma.product.updateMany({
    data: { soldCount: 0, reviewCount: 0, rating: 0 },
  })
  console.log(`✅ Cleared trust metrics on ${products.count} products (soldCount, reviewCount, rating → 0)`)

  const vendors = await prisma.vendor.updateMany({
    data: { rating: 0, totalSales: 0 },
  })
  console.log(`✅ Cleared trust metrics on ${vendors.count} vendors (rating, totalSales → 0)`)
}

main()
  .catch((e) => {
    console.error('❌ clear-fake-trust failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
