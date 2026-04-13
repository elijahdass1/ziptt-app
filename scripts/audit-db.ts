import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

async function run() {
  // 1. Show all categories in DB
  console.log('\n=== CATEGORIES TABLE ===')
  try {
    const cats = await pool.query('SELECT id, name, slug FROM "Category" ORDER BY name')
    cats.rows.forEach(c => console.log(`  [${c.id}] ${c.name} (${c.slug})`))
  } catch (e: any) {
    console.log('No Category table:', e.message)
  }

  // 2. Show Product columns
  console.log('\n=== PRODUCT COLUMNS ===')
  const cols = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'Product'
    ORDER BY ordinal_position
  `)
  cols.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`))

  // 3. Sample products from each vendor with current category/image
  console.log('\n=== SAMPLE PRODUCTS PER VENDOR ===')
  const vendors = await pool.query('SELECT id, "storeName" FROM "Vendor" ORDER BY "storeName"')
  for (const v of vendors.rows) {
    const prods = await pool.query(
      `SELECT p.name, p."categoryId", p.images FROM "Product" p WHERE p."vendorId" = $1 LIMIT 5`,
      [v.id]
    )
    console.log(`\n--- ${v.storeName} (id=${v.id}) ---`)
    prods.rows.forEach(p => {
      const imgVal = typeof p.images === 'string' ? p.images.substring(0, 100) : JSON.stringify(p.images).substring(0, 100)
      console.log(`  "${p.name}" | catId=${p.categoryId} | img=${imgVal}`)
    })
  }

  // 4. Count products per category
  console.log('\n=== PRODUCT COUNTS BY CATEGORY ===')
  const catCounts = await pool.query(`
    SELECT c.name as cat_name, p."categoryId", COUNT(*) as count
    FROM "Product" p
    LEFT JOIN "Category" c ON c.id = p."categoryId"
    GROUP BY c.name, p."categoryId"
    ORDER BY count DESC
  `)
  catCounts.rows.forEach(r => console.log(`  cat="${r.cat_name}" catId="${r.categoryId}": ${r.count} products`))

  // 5. Count products per vendor
  console.log('\n=== PRODUCT COUNTS BY VENDOR ===')
  const vendCounts = await pool.query(`
    SELECT v."storeName", COUNT(*) as count
    FROM "Product" p
    JOIN "Vendor" v ON v.id = p."vendorId"
    GROUP BY v."storeName"
    ORDER BY count DESC
  `)
  vendCounts.rows.forEach(r => console.log(`  vendor="${r.storeName}": ${r.count} products`))

  // 6. Check image format samples across all vendors
  console.log('\n=== IMAGE FORMAT SAMPLES (5 random products) ===')
  const imgSamples = await pool.query(`SELECT name, images FROM "Product" WHERE images != '[]' AND images != '' LIMIT 10`)
  imgSamples.rows.forEach(p => {
    console.log(`  "${p.name}": ${p.images.substring(0, 120)}`)
  })

  await pool.end()
}

run().catch(console.error)
