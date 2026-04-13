import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

function img(id: string) {
  return JSON.stringify([`https://images.unsplash.com/${id}?w=600&q=80`])
}

const DEFAULT_IMG = img('photo-1472851294608-ac763d01d56e')

// Vendor-wide defaults first
const VENDOR_DEFAULTS: Record<string, string> = {
  "Don Wvrldwide":     img('photo-1556821840-3a63f15732ce'),
  "D'Best Toys":       img('photo-1587654780291-39c9404d746b'),
  "Trini Tech Hub":    img('photo-1610945415295-d9bbf067e59c'),
  "iWorld TT":         img('photo-1610945415295-d9bbf067e59c'),
  "D'Mas Camp":        img('photo-1533174072545-7a4b6ad7a6c3'),
  "Trini Necessities": img('photo-1563453392212-326f5e854473'),
  "Sasha's Gourmet":   img('photo-1506368249639-73a05d6f6488'),
  "Elite Home Decor":  img('photo-1555041469-a586c61ea9bc'),
}

// Name-based overrides — applied after vendor defaults
const OVERRIDES: Array<[string, string]> = [
  // Streetwear
  ['%hoodie%',            img('photo-1556821840-3a63f15732ce')],
  ['%tee%',               img('photo-1583743814966-8936f5b7be1a')],
  ['%t-shirt%',           img('photo-1583743814966-8936f5b7be1a')],
  ['%bucket hat%',        img('photo-1521369909029-2afed882baee')],
  ['%snapback%',          img('photo-1588850561407-ed78c282e89b')],
  ['% cap%',              img('photo-1588850561407-ed78c282e89b')],
  ['%socks%',             img('photo-1586350977771-b3b0abd50c82')],
  ['%shorts%',            img('photo-1624378439575-d8705ad7ae80')],
  // Toys
  ['%lego%',              img('photo-1587654780291-39c9404d746b')],
  ['%barbie%',            img('photo-1515488042361-ee00e0ddd4e4')],
  ['%dreamhouse%',        img('photo-1515488042361-ee00e0ddd4e4')],
  ['%hot wheels%',        img('photo-1594736797933-d0501ba2fe65')],
  ['%power wheels%',      img('photo-1558981806-ec527fa84c39')],
  ['%jeep%',              img('photo-1558981806-ec527fa84c39')],
  ['%ride-on%',           img('photo-1558981806-ec527fa84c39')],
  ['%ride on%',           img('photo-1558981806-ec527fa84c39')],
  ['%nerf%',              img('photo-1585366119957-e9730b6d0f60')],
  ['%board game%',        img('photo-1611996575749-79a3a250f948')],
  ['% uno%',              img('photo-1611996575749-79a3a250f948')],
  ['%monopoly%',          img('photo-1611996575749-79a3a250f948')],
  ['%stacko%',            img('photo-1611996575749-79a3a250f948')],
  ['%plush%',             img('photo-1559715541-5daf8a0296d0')],
  ['%stuffed%',           img('photo-1559715541-5daf8a0296d0')],
  ['%teddy%',             img('photo-1559715541-5daf8a0296d0')],
  ['%bicycle%',           img('photo-1558618666-fcd25c85cd64')],
  ['%kids bike%',         img('photo-1558618666-fcd25c85cd64')],
  // Electronics
  ['%samsung galaxy%',    img('photo-1610945415295-d9bbf067e59c')],
  ['%iphone%',            img('photo-1510557880182-3d4d3cba35a5')],
  ['%airpod%',            img('photo-1606220588913-b3aacb4d2f46')],
  ['%macbook%',           img('photo-1541807084-5c52b6b3adef')],
  ['%laptop%',            img('photo-1541807084-5c52b6b3adef')],
  ['%ps5%',               img('photo-1607853202273-797f1c22a38e')],
  ['%playstation%',       img('photo-1607853202273-797f1c22a38e')],
  ['%ipad%',              img('photo-1544244015-0df4b3ffc6b0')],
  ['%headphone%',         img('photo-1505740420928-5e560c06d30e')],
  ['%earphone%',          img('photo-1505740420928-5e560c06d30e')],
  ['%xm5%',               img('photo-1505740420928-5e560c06d30e')],
  ['%apple watch%',       img('photo-1579586337278-3befd40fd17a')],
  ['%charger%',           img('photo-1583863788434-e58a36330cf0')],
  ['%usb%',               img('photo-1583863788434-e58a36330cf0')],
  ['%xbox%',              img('photo-1605901309584-818e25960a8f')],
  // Carnival
  ['%costume%',           img('photo-1533174072545-7a4b6ad7a6c3')],
  ['%carnival%',          img('photo-1533174072545-7a4b6ad7a6c3')],
  ['%fete%',              img('photo-1429962714451-bb934ecdc4ec')],
  ['%wristband%',         img('photo-1429962714451-bb934ecdc4ec')],
  ['%mas boots%',         img('photo-1542291026-7eec264c27ff')],
  ['%body glitter%',      img('photo-1596462502278-27bfdc403348')],
  // Food/household
  ['%rum%',               img('photo-1569529465841-dfecdab7503b')],
  ['%1919%',              img('photo-1569529465841-dfecdab7503b')],
  ['%bitters%',           img('photo-1470338745628-171cf53de3a8')],
  ['%angostura%',         img('photo-1470338745628-171cf53de3a8')],
  ['%dove%',              img('photo-1556228578-8c89e6adf883')],
  ['%body wash%',         img('photo-1556228578-8c89e6adf883')],
  ['%fabuloso%',          img('photo-1563453392212-326f5e854473')],
  ['%cleaner%',           img('photo-1563453392212-326f5e854473')],
  ['%dettol%',            img('photo-1584308666744-24d5c474f2ae')],
  ['%antiseptic%',        img('photo-1584308666744-24d5c474f2ae')],
  ['%paper towel%',       img('photo-1585664811087-47f65abbad64')],
  ['%gillette%',          img('photo-1585747860715-2ba37e788b70')],
  ['%razor%',             img('photo-1585747860715-2ba37e788b70')],
  ['%green seasoning%',   img('photo-1506368249639-73a05d6f6488')],
  ['%seasoning%',         img('photo-1506368249639-73a05d6f6488')],
  ['%pepper sauce%',      img('photo-1565299507177-b0ac66763828')],
  ['%gourmet%',           img('photo-1565299507177-b0ac66763828')],
  // Home appliances
  ['%fridge%',            img('photo-1571175443880-49e1d25b2bc5')],
  ['%refrigerator%',      img('photo-1571175443880-49e1d25b2bc5')],
  ['%stove%',             img('photo-1556909114-f6e7ad7d3136')],
  ['%gas range%',         img('photo-1556909114-f6e7ad7d3136')],
  ['%oven%',              img('photo-1556909114-f6e7ad7d3136')],
  ['%microwave%',         img('photo-1585771724684-38269d6639fd')],
  ['%washing machine%',   img('photo-1626806787461-102c1bfaaea1')],
  ['%washer%',            img('photo-1626806787461-102c1bfaaea1')],
  ['%television%',        img('photo-1593359677879-a4bb92f829e1')],
  [' %tv%',               img('photo-1593359677879-a4bb92f829e1')],
  ['%sofa%',              img('photo-1555041469-a586c61ea9bc')],
  ['%couch%',             img('photo-1555041469-a586c61ea9bc')],
  ['%chair%',             img('photo-1555041469-a586c61ea9bc')],
  ['%dining table%',      img('photo-1555041469-a586c61ea9bc')],
  ['%bed frame%',         img('photo-1555041469-a586c61ea9bc')],
  ['%mattress%',          img('photo-1555041469-a586c61ea9bc')],
  ['%wardrobe%',          img('photo-1555041469-a586c61ea9bc')],
]

async function run() {
  // Step 1: vendor defaults
  const { rows: vendors } = await pool.query('SELECT id, "storeName" FROM "Vendor"')
  let v = 0
  for (const vendor of vendors) {
    const d = VENDOR_DEFAULTS[vendor.storeName]
    if (!d) continue
    const r = await pool.query('UPDATE "Product" SET images = $1 WHERE "vendorId" = $2', [d, vendor.id])
    console.log(`[vendor] "${vendor.storeName}": ${r.rowCount}`)
    v += r.rowCount ?? 0
  }

  // Step 2: name overrides
  let o = 0
  for (const [pat, val] of OVERRIDES) {
    const r = await pool.query('UPDATE "Product" SET images = $1 WHERE LOWER(name) LIKE LOWER($2)', [val, pat])
    if ((r.rowCount ?? 0) > 0) { console.log(`[name] "${pat}": ${r.rowCount}`); o += r.rowCount ?? 0 }
  }

  // Step 3: catch-all for any remaining products with placeholder/broken images
  const catchAll = await pool.query(
    `UPDATE "Product" SET images = $1 WHERE images IS NULL OR images = '[]' OR images = 'null'`,
    [DEFAULT_IMG]
  )
  console.log(`[catch-all]: ${catchAll.rowCount}`)

  console.log(`\nVendor defaults: ${v} | Name overrides: ${o} | Catch-all: ${catchAll.rowCount}`)
  await pool.end()
}

run().catch(console.error)
