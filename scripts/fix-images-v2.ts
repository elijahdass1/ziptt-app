import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

// Default image per vendor (all products from that vendor get this if no specific match)
const VENDOR_DEFAULTS: Record<string, string> = {
  "Don Wvrldwide":    "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600",
  "D'Best Toys":      "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600",
  "Trini Tech Hub":   "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600",
  "D'Mas Camp":       "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600",
  "Trini Necessities":"https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600",
  "Sasha's Gourmet":  "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600",
  "Elite Home Decor": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
  "iWorld TT":        "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600",
}

// Specific product name overrides (case-insensitive ILIKE match)
const NAME_OVERRIDES: Array<{ pattern: string; img: string }> = [
  // Don Wvrldwide
  { pattern: '%hoodie%',          img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600' },
  { pattern: '%tee%',             img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600' },
  { pattern: '%t-shirt%',         img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600' },
  { pattern: '%bucket hat%',      img: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600' },
  { pattern: '%cap%',             img: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600' },
  { pattern: '%socks%',           img: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600' },
  { pattern: '%shorts%',          img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600' },
  // D'Best Toys
  { pattern: '%lego%',            img: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600' },
  { pattern: '%barbie%',          img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  { pattern: '%hot wheels%',      img: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600' },
  { pattern: '%nerf%',            img: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600' },
  { pattern: '%board game%',      img: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600' },
  { pattern: '%plush%',           img: 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=600' },
  { pattern: '%stuffed%',         img: 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=600' },
  { pattern: '%teddy%',           img: 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=600' },
  { pattern: '%puzzle%',          img: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600' },
  { pattern: '%ride-on%',         img: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600' },
  { pattern: '%ride on%',         img: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600' },
  { pattern: '%power wheels%',    img: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600' },
  { pattern: '%scooter%',         img: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600' },
  { pattern: '%bicycle%',         img: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600' },
  { pattern: '%bike%',            img: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600' },
  // Trini Tech Hub / iWorld TT
  { pattern: '%samsung%',         img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600' },
  { pattern: '%airpod%',          img: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600' },
  { pattern: '%macbook%',         img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600' },
  { pattern: '%ps5%',             img: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600' },
  { pattern: '%playstation%',     img: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600' },
  { pattern: '%ipad%',            img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600' },
  { pattern: '%iphone%',          img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600' },
  { pattern: '%headphone%',       img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
  { pattern: '%earphone%',        img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
  { pattern: '%laptop%',          img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600' },
  { pattern: '%xbox%',            img: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600' },
  // D'Mas Camp carnival
  { pattern: '%costume%',         img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600' },
  { pattern: '%carnival%',        img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600' },
  { pattern: '%fete%',            img: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600' },
  // Rum & food
  { pattern: '%rum%',             img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
  { pattern: '%bitters%',         img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
  { pattern: '%angostura%',       img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
  { pattern: '%seasoning%',       img: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600' },
  { pattern: '%sauce%',           img: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600' },
  { pattern: '%cleaning%',        img: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600' },
  // Home decor
  { pattern: '%sofa%',            img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600' },
  { pattern: '%couch%',           img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600' },
  { pattern: '%chair%',           img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600' },
  { pattern: '%table%',           img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600' },
  { pattern: '%bed%',             img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600' },
  { pattern: '%mattress%',        img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600' },
]

async function run() {
  // Step 1: Set vendor-level default images
  const { rows: vendors } = await pool.query('SELECT id, "storeName" FROM "Vendor"')
  let vendorTotal = 0
  for (const vendor of vendors) {
    const defaultImg = VENDOR_DEFAULTS[vendor.storeName]
    if (!defaultImg) continue
    const res = await pool.query(
      'UPDATE "Product" SET images = $1 WHERE "vendorId" = $2',
      [JSON.stringify([defaultImg]), vendor.id]
    )
    console.log(`✅ Vendor "${vendor.storeName}": set default on ${res.rowCount} products`)
    vendorTotal += res.rowCount ?? 0
  }
  console.log(`\nVendor defaults applied: ${vendorTotal} products`)

  // Step 2: Apply name-specific overrides (more specific wins since we run after vendor defaults)
  let overrideTotal = 0
  for (const { pattern, img } of NAME_OVERRIDES) {
    const res = await pool.query(
      'UPDATE "Product" SET images = $1 WHERE LOWER(name) LIKE LOWER($2)',
      [JSON.stringify([img]), pattern]
    )
    if (res.rowCount && res.rowCount > 0) {
      console.log(`  Override "${pattern}": ${res.rowCount} products`)
      overrideTotal += res.rowCount
    }
  }
  console.log(`\nName overrides applied: ${overrideTotal} products`)

  await pool.end()
  console.log('\n✅ Done')
}

run().catch(console.error)
