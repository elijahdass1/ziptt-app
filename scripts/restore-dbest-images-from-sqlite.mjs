// Restore real dbesttoys.com CDN images from dev.db → Neon
import Database from 'better-sqlite3'
import pg from 'pg'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
config({ path: join(root, '.env.local') })

const sqlite = new Database(join(root, 'prisma', 'dev.db'), { readonly: true })
const pool   = new pg.Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  console.log("📦 Reading dbesttoys.com images from dev.db...")

  // Get the vendor ID in SQLite for dbest-toys
  const sqliteVendor = sqlite.prepare("SELECT id FROM Vendor WHERE slug='dbest-toys'").get()
  if (!sqliteVendor) { console.error('No dbest-toys vendor in SQLite'); return }

  // Read all products with real images (not null/empty)
  const sqliteProducts = sqlite.prepare(`
    SELECT slug, images FROM Product
    WHERE vendorId = ? AND images IS NOT NULL AND images != '' AND images != '[]'
  `).all(sqliteVendor.id)

  console.log(`Found ${sqliteProducts.length} products with images in SQLite`)

  // Filter to only those with actual dbesttoys.com URLs (or other real CDN)
  const withRealImages = sqliteProducts.filter(p => {
    try {
      const imgs = JSON.parse(p.images)
      return Array.isArray(imgs) && imgs.length > 0 && imgs[0].startsWith('http')
    } catch { return false }
  })
  console.log(`${withRealImages.length} have real http image URLs`)

  // Batch update Neon by slug
  const BATCH = 200
  let updated = 0
  let notFound = 0

  for (let i = 0; i < withRealImages.length; i += BATCH) {
    const batch = withRealImages.slice(i, i + BATCH)
    for (const p of batch) {
      const result = await pool.query(
        'UPDATE "Product" SET images = $1 WHERE slug = $2 RETURNING id',
        [p.images, p.slug]
      )
      if (result.rows.length > 0) updated++
      else notFound++
    }
    process.stdout.write(`\r  ${Math.min(i + BATCH, withRealImages.length)}/${withRealImages.length}`)
  }

  console.log(`\n✅ Updated: ${updated}`)
  console.log(`⚠️  Not in Neon: ${notFound}`)

  sqlite.close()
  await pool.end()
}

main().catch(e => { console.error(e); process.exit(1) })
