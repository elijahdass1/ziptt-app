// migrate-products.js - Migrate products from SQLite to Neon PostgreSQL
const Database = require('better-sqlite3')
const { Pool } = require('pg')
const path = require('path')

const NEON_URL = 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'

const sqlite = new Database(path.join(__dirname, '..', 'prisma', 'dev.db'), { readonly: true })
const pool = new Pool({
  connectionString: NEON_URL,
  ssl: { rejectUnauthorized: false }
})

async function migrate() {
  console.log('Starting migration...')

  // Get Neon vendors
  const { rows: neonVendors } = await pool.query('SELECT id, "storeName" FROM "Vendor"')
  const neonVendorMap = new Map() // storeName -> neon id
  for (const v of neonVendors) {
    neonVendorMap.set(v.storeName, v.id)
  }
  console.log('Neon vendors:', neonVendors.map(v => v.storeName).join(', '))

  // Get Neon categories
  const { rows: neonCats } = await pool.query('SELECT id, slug FROM "Category"')
  const neonCatMap = new Map() // slug -> neon id
  for (const c of neonCats) {
    neonCatMap.set(c.slug, c.id)
  }

  // Get SQLite data
  const sqliteVendors = sqlite.prepare('SELECT * FROM Vendor').all()
  const sqliteProducts = sqlite.prepare('SELECT * FROM Product').all()
  const sqliteCategories = sqlite.prepare('SELECT * FROM Category').all()

  console.log(`SQLite: ${sqliteProducts.length} products, ${sqliteVendors.length} vendors`)

  // Build SQLite category slug -> neon category id map
  const sqliteCatIdToSlug = new Map()
  for (const c of sqliteCategories) {
    sqliteCatIdToSlug.set(c.id, c.slug)
  }

  // Build SQLite vendor id -> neon vendor id map (by storeName)
  const sqliteVendorIdToNeonId = new Map()
  for (const sv of sqliteVendors) {
    const neonId = neonVendorMap.get(sv.storeName)
    if (neonId) {
      sqliteVendorIdToNeonId.set(sv.id, neonId)
    } else {
      console.log(`Vendor not found in Neon: "${sv.storeName}" - will create`)
    }
  }

  // Create missing vendors in Neon (Trini Necessities, iWorld TT)
  for (const sv of sqliteVendors) {
    if (!neonVendorMap.has(sv.storeName)) {
      console.log(`Creating vendor: ${sv.storeName}`)
      try {
        // Need a user first - create a placeholder user
        const userId = sv.id + '_user'

        // Try to insert user (ignore if exists)
        await pool.query(`
          INSERT INTO "User" (id, name, email, role, status, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, 'VENDOR', 'ACTIVE', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, [userId, sv.storeName + ' (Vendor)', sv.storeName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@zip.tt'])

        const { rows } = await pool.query(`
          INSERT INTO "Vendor" (id, "userId", "storeName", slug, description, logo, banner, phone, address, region,
            status, rating, "totalSales", commission, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
          ON CONFLICT (slug) DO UPDATE SET "storeName" = EXCLUDED."storeName"
          RETURNING id
        `, [
          sv.id,
          userId,
          sv.storeName,
          sv.slug,
          sv.description || null,
          sv.logo || null,
          sv.banner || null,
          sv.phone || null,
          sv.address || null,
          sv.region || null,
          sv.status || 'APPROVED',
          sv.rating || 0,
          sv.totalSales || 0,
          sv.commission || 10
        ])
        const neonId = rows[0].id
        neonVendorMap.set(sv.storeName, neonId)
        sqliteVendorIdToNeonId.set(sv.id, neonId)
        console.log(`Created vendor ${sv.storeName} with id ${neonId}`)
      } catch (err) {
        console.error(`Failed to create vendor ${sv.storeName}:`, err.message)
      }
    }
  }

  // Now migrate products
  let inserted = 0
  let skipped = 0
  let failed = 0

  // Process in batches of 50
  const batchSize = 50
  for (let i = 0; i < sqliteProducts.length; i += batchSize) {
    const batch = sqliteProducts.slice(i, i + batchSize)

    for (const p of batch) {
      const neonVendorId = sqliteVendorIdToNeonId.get(p.vendorId)
      if (!neonVendorId) {
        skipped++
        continue
      }

      // Map category
      const catSlug = sqliteCatIdToSlug.get(p.categoryId)
      const neonCatId = catSlug ? neonCatMap.get(catSlug) : null
      if (!neonCatId) {
        // Use first available category
        const fallbackCat = neonCats[0]
        if (!fallbackCat) { skipped++; continue }
      }
      const categoryId = neonCatId || neonCats[0]?.id

      try {
        await pool.query(`
          INSERT INTO "Product" (id, "vendorId", "categoryId", name, slug, description, price, "comparePrice",
            images, stock, sku, tags, status, featured, rating, "reviewCount", "soldCount", weight, "createdAt", "updatedAt")
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
          ON CONFLICT (slug) DO NOTHING
        `, [
          p.id,
          neonVendorId,
          categoryId,
          p.name,
          p.slug,
          p.description || '',
          p.price,
          p.comparePrice || null,
          p.images || '[]',
          p.stock || 0,
          p.sku || null,
          p.tags || '[]',
          p.status || 'ACTIVE',
          p.featured ? true : false,
          p.rating || 0,
          p.reviewCount || 0,
          p.soldCount || 0,
          p.weight || null,
          p.createdAt ? new Date(p.createdAt) : new Date(),
          p.updatedAt ? new Date(p.updatedAt) : new Date()
        ])
        inserted++
      } catch (err) {
        if (!err.message.includes('duplicate') && !err.message.includes('unique')) {
          console.error(`Failed ${p.name}:`, err.message)
          failed++
        } else {
          skipped++
        }
      }
    }

    if (i % 500 === 0) {
      console.log(`Progress: ${i}/${sqliteProducts.length} (inserted: ${inserted}, skipped: ${skipped})`)
    }
  }

  console.log(`\nMigration complete!`)
  console.log(`Inserted: ${inserted}`)
  console.log(`Skipped (conflicts/no vendor): ${skipped}`)
  console.log(`Failed: ${failed}`)

  // Final count
  const { rows: finalCount } = await pool.query('SELECT COUNT(*) FROM "Product"')
  console.log(`Total products in Neon now: ${finalCount[0].count}`)

  await pool.end()
  sqlite.close()
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
