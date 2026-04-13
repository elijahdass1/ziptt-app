import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

async function run() {
  const { rows: vendors } = await pool.query('SELECT id, "storeName" FROM "Vendor"')
  const { rows: categories } = await pool.query('SELECT id, name FROM "Category"')

  // Map category name -> id
  const catMap: Record<string, string> = {}
  for (const c of categories) {
    catMap[c.name] = c.id
  }

  const vendorCategories: Record<string, string> = {
    "Don Wvrldwide":     "Urban Fashion & Streetwear",
    "D'Best Toys":       "Toys, Games & Kids",
    "Trini Tech Hub":    "Electronics",
    "iWorld TT":         "Electronics",
    "D'Mas Camp":        "Carnival & Mas",
    "Trini Necessities": "Groceries & Food",
    "Sasha's Gourmet":   "Groceries & Food",
    "Elite Home Decor":  "Home & Garden",
  }

  for (const vendor of vendors) {
    const catName = vendorCategories[vendor.storeName]
    if (!catName) continue
    const catId = catMap[catName]
    if (!catId) {
      console.log(`⚠️  Category "${catName}" not found in DB`)
      continue
    }
    const res = await pool.query(
      'UPDATE "Product" SET "categoryId" = $1 WHERE "vendorId" = $2',
      [catId, vendor.id]
    )
    console.log(`✅ "${vendor.storeName}" → ${catName}: ${res.rowCount} products`)
  }

  await pool.end()
  console.log('\n✅ Categories fixed')
}

run().catch(console.error)
