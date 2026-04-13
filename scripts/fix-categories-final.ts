import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

// Category IDs from the DB (verified via audit)
const CATEGORY_IDS = {
  TOYS:        'cmnwbk03s000bx0cnmu6jeirx',  // Toys, Games & Kids
  GROCERIES:   'cmnwbjzxc0006x0cn0jhj9nfd',  // Groceries & Food
  ELECTRONICS: 'cmnwbjzvj0005x0cnbnlyhdaq',  // Electronics
  STREETWEAR:  'cmnwbk02g000ax0cny4v6p4dd',  // Urban Fashion & Streetwear
  APPLIANCES:  'cmnwbk04m000cx0cnqr7d085v',  // Appliances & Home
  CARNIVAL:    'cmnwbjzxe0009x0cnzyl1tmzd',  // Carnival & Mas
  HOME_GARDEN: 'cmnwbjzxd0008x0cnhhvk81yc',  // Home & Garden
}

// Vendor IDs from the DB (verified via audit)
const VENDOR_MAP: { [vendorId: string]: { name: string; correctCategoryId: string } } = {
  'cmnwbk3p0000ox0cnmho5oh3q': { name: "D'Best Toys",        correctCategoryId: CATEGORY_IDS.TOYS        },
  'cmnwbk2xd000lx0cns6x4gs4n': { name: "D'Mas Camp",         correctCategoryId: CATEGORY_IDS.CARNIVAL    },
  'cmnwbk3h7000nx0cnuquug9u8': { name: "Don Wvrldwide",       correctCategoryId: CATEGORY_IDS.STREETWEAR  },
  'cmnwbk3up000px0cnspizxuk5': { name: "Elite Home Decor",    correctCategoryId: CATEGORY_IDS.APPLIANCES  },
  'cmnwbk36o000mx0cn3juv7lml': { name: "Sasha's Gourmet",     correctCategoryId: CATEGORY_IDS.GROCERIES   },
  'c77eb95b6eef1027c4fe047':   { name: "Trini Necessities",   correctCategoryId: CATEGORY_IDS.HOME_GARDEN }, // was wrongly Groceries
  'cmnwbk2l0000kx0cnmprzxsp6': { name: "Trini Tech Hub",      correctCategoryId: CATEGORY_IDS.ELECTRONICS },
  'c88ddde5022b7cfa739a520':   { name: "iWorld TT",           correctCategoryId: CATEGORY_IDS.ELECTRONICS },
}

async function run() {
  console.log('=== FIX CATEGORIES (by vendor FK) ===\n')

  for (const [vendorId, info] of Object.entries(VENDOR_MAP)) {
    // Check current state
    const { rows: current } = await pool.query(
      `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE "categoryId" = $1) as correct
       FROM "Product" WHERE "vendorId" = $2`,
      [info.correctCategoryId, vendorId]
    )
    const total = parseInt(current[0].total)
    const alreadyCorrect = parseInt(current[0].correct)
    const needsUpdate = total - alreadyCorrect

    if (needsUpdate === 0) {
      console.log(`[SKIP] ${info.name}: all ${total} products already have correct category`)
      continue
    }

    console.log(`[UPDATE] ${info.name}: updating ${needsUpdate} of ${total} products to categoryId=${info.correctCategoryId}`)

    const result = await pool.query(
      `UPDATE "Product" SET "categoryId" = $1 WHERE "vendorId" = $2 AND "categoryId" != $1`,
      [info.correctCategoryId, vendorId]
    )
    console.log(`  -> Updated ${result.rowCount} rows`)
  }

  // Verify final state
  console.log('\n=== FINAL CATEGORY COUNTS ===')
  const { rows } = await pool.query(`
    SELECT c.name as cat_name, v."storeName", COUNT(*) as count
    FROM "Product" p
    JOIN "Category" c ON c.id = p."categoryId"
    JOIN "Vendor" v ON v.id = p."vendorId"
    GROUP BY c.name, v."storeName"
    ORDER BY v."storeName", c.name
  `)
  rows.forEach(r => console.log(`  ${r.storeName}: ${r.cat_name} (${r.count} products)`))

  await pool.end()
  console.log('\nDone.')
}

run().catch(console.error)
