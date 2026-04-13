import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

async function run() {
  // List all categories
  const { rows: categories } = await pool.query('SELECT id, name, slug FROM "Category" ORDER BY name')
  console.log('Available categories:')
  for (const c of categories) {
    console.log(`  id=${c.id}  name="${c.name}"  slug="${c.slug}"`)
  }

  // Map store names to category names (or slugs) we want to match
  const categoryByStore: Record<string, string> = {
    "Don Wvrldwide":     "Urban Fashion & Streetwear",
    "D'Best Toys":       "Toys, Games & Kids",
    "Trini Tech Hub":    "Electronics",
    "iWorld TT":         "Electronics",
    "D'Mas Camp":        "Carnival & Mas",
    "Trini Necessities": "Groceries & Food",
    "Sasha's Gourmet":   "Groceries & Food",
    "Elite Home Decor":  "Appliances & Home",
  }

  // Build a name -> id map from existing categories
  const catMap: Record<string, string> = {}
  for (const c of categories) {
    catMap[c.name] = c.id
  }

  // For any desired category that doesn't exist yet, create it
  const desiredCategories: Record<string, string> = {
    "Urban Fashion & Streetwear": "urban-fashion-streetwear",
    "Toys, Games & Kids":         "toys-games-kids",
    "Electronics":                "electronics",
    "Carnival & Mas":             "carnival-mas",
    "Groceries & Food":           "groceries-food",
    "Appliances & Home":          "appliances-home",
  }

  for (const [name, slug] of Object.entries(desiredCategories)) {
    if (!catMap[name]) {
      const r = await pool.query(
        'INSERT INTO "Category" (id, name, slug, "createdAt") VALUES (gen_random_uuid(), $1, $2, NOW()) ON CONFLICT (name) DO NOTHING RETURNING id, name',
        [name, slug]
      )
      if (r.rows.length > 0) {
        catMap[name] = r.rows[0].id
        console.log(`Created category: "${name}" (id=${r.rows[0].id})`)
      } else {
        // Fetch if already exists with that name
        const existing = await pool.query('SELECT id FROM "Category" WHERE name = $1', [name])
        if (existing.rows.length > 0) {
          catMap[name] = existing.rows[0].id
        }
      }
    }
  }

  // Now update products by vendor
  const { rows: vendors } = await pool.query('SELECT id, "storeName" FROM "Vendor"')
  let totalUpdated = 0

  for (const v of vendors) {
    const catName = categoryByStore[v.storeName]
    if (!catName) continue
    const catId = catMap[catName]
    if (!catId) {
      console.log(`WARNING: No category found for "${catName}" (store: "${v.storeName}")`)
      continue
    }
    const r = await pool.query(
      'UPDATE "Product" SET "categoryId" = $1 WHERE "vendorId" = $2',
      [catId, v.id]
    )
    console.log(`"${v.storeName}" -> "${catName}" (${catId}): ${r.rowCount} products updated`)
    totalUpdated += r.rowCount ?? 0
  }

  console.log(`\nDone! Total products updated: ${totalUpdated}`)
  await pool.end()
}

run().catch(console.error)
