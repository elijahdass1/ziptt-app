import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

function img(id: string) {
  return JSON.stringify([`https://images.unsplash.com/${id}?w=600&q=80`])
}

// Vendor default images — applied first to ALL products in that store
const VENDOR_DEFAULTS: Record<string, string> = {
  "Don Wvrldwide":     img('photo-1556821840-3a63f15732ce'),  // black hoodie
  "D'Best Toys":       img('photo-1587654780291-39c9404d746b'), // LEGO bricks
  "Trini Tech Hub":    img('photo-1610945415295-d9bbf067e59c'), // Android phone
  "iWorld TT":         img('photo-1610945415295-d9bbf067e59c'), // Android phone
  "D'Mas Camp":        img('photo-1533174072545-7a4b6ad7a6c3'), // carnival costume
  "Trini Necessities": img('photo-1506368249639-73a05d6f6488'),  // condiment bottles
  "Sasha's Gourmet":   img('photo-1598300042247-d088f8ab3a91'), // green seasoning
  "Elite Home Decor":  img('photo-1555041469-a586c61ea9bc'),   // modern living room
}

// Product-name overrides — applied AFTER vendor defaults (more specific wins)
// Pattern is ILIKE (case-insensitive)
const OVERRIDES: Array<[string, string]> = [
  // Don Wvrldwide streetwear
  ['%hoodie%',           img('photo-1556821840-3a63f15732ce')],
  ['%white hoodie%',     img('photo-1565693413579-8ff3fdc1b03b')],
  ['%tee%',              img('photo-1583743814966-8936f5b7be1a')],
  ['%t-shirt%',          img('photo-1583743814966-8936f5b7be1a')],
  ['%bucket hat%',       img('photo-1521369909029-2afed882baee')],
  ['%cap%',              img('photo-1521369909029-2afed882baee')],
  ['%socks%',            img('photo-1586350977771-b3b0abd50c82')],
  ['%shorts%',           img('photo-1624378439575-d8705ad7ae80')],
  // D'Best Toys
  ['%lego%',             img('photo-1587654780291-39c9404d746b')],
  ['%barbie%',           img('photo-1515488042361-ee00e0ddd4e4')],
  ['%dreamhouse%',       img('photo-1515488042361-ee00e0ddd4e4')],
  ['%hot wheels%',       img('photo-1594736797933-d0501ba2fe65')],
  ['%power wheels%',     img('photo-1558981806-ec527fa84c39')],
  ['%jeep%',             img('photo-1558981806-ec527fa84c39')],
  ['%ride-on%',          img('photo-1558981806-ec527fa84c39')],
  ['%ride on%',          img('photo-1558981806-ec527fa84c39')],
  ['%nerf%',             img('photo-1585366119957-e9730b6d0f60')],
  ['%board game%',       img('photo-1611996575749-79a3a250f948')],
  ['%uno%',              img('photo-1611996575749-79a3a250f948')],
  ['%monopoly%',         img('photo-1611996575749-79a3a250f948')],
  ['%plush%',            img('photo-1559715541-5daf8a0296d0')],
  ['%stuffed%',          img('photo-1559715541-5daf8a0296d0')],
  ['%teddy%',            img('photo-1559715541-5daf8a0296d0')],
  ['%puzzle%',           img('photo-1586348943529-beaae6c28db9')],
  ['%baby%',             img('photo-1515488042361-ee00e0ddd4e4')],
  ['%doll%',             img('photo-1515488042361-ee00e0ddd4e4')],
  // Trini Tech Hub electronics
  ['%samsung galaxy%',   img('photo-1610945415295-d9bbf067e59c')],
  ['%airpod%',           img('photo-1606220588913-b3aacb4d2f46')],
  ['%macbook%',          img('photo-1541807084-5c52b6b3adef')],
  ['%ps5%',              img('photo-1607853202273-797f1c22a38e')],
  ['%playstation%',      img('photo-1607853202273-797f1c22a38e')],
  ['%ipad%',             img('photo-1544244015-0df4b3ffc6b0')],
  ['%iphone%',           img('photo-1510557880182-3d4d3cba35a5')],
  ['%headphone%',        img('photo-1505740420928-5e560c06d30e')],
  ['%xm5%',              img('photo-1505740420928-5e560c06d30e')],
  ['%sony%',             img('photo-1505740420928-5e560c06d30e')],
  ['%apple watch%',      img('photo-1579586337278-3befd40fd17a')],
  ['%charger%',          img('photo-1583863788434-e58a36330cf0')],
  ['%usb%',              img('photo-1583863788434-e58a36330cf0')],
  ['%laptop%',           img('photo-1541807084-5c52b6b3adef')],
  ['%xbox%',             img('photo-1605901309584-818e25960a8f')],
  // D'Mas Camp carnival
  ['%costume%',          img('photo-1533174072545-7a4b6ad7a6c3')],
  ['%carnival%',         img('photo-1533174072545-7a4b6ad7a6c3')],
  ['%fete%',             img('photo-1429962714451-bb934ecdc4ec')],
  ['%wristband%',        img('photo-1429962714451-bb934ecdc4ec')],
  ['%boots%',            img('photo-1535043934128-cf0b28d52f95')],
  // Trini Necessities
  ['%angostura 1919%',   img('photo-1569529465841-dfecdab7503b')],
  ['%rum%',              img('photo-1569529465841-dfecdab7503b')],
  ['%bitters%',          img('photo-1470338745628-171cf53de3a8')],
  ['%dove%',             img('photo-1556228578-8c89e6adf883')],
  ['%fabuloso%',         img('photo-1563453392212-326f5e854473')],
  ['%dettol%',           img('photo-1584308666744-24d5c474f2ae')],
  ['%paper towel%',      img('photo-1585664811087-47f65abbad64')],
  ['%gillette%',         img('photo-1585747860715-2ba37e788b70')],
  ['%razor%',            img('photo-1585747860715-2ba37e788b70')],
  // Sasha's Gourmet
  ['%green seasoning%',  img('photo-1598300042247-d088f8ab3a91')],
  ['%seasoning%',        img('photo-1598300042247-d088f8ab3a91')],
  ['%sauce%',            img('photo-1506368249639-73a05d6f6488')],
  ['%pepper%',           img('photo-1506368249639-73a05d6f6488')],
  // Elite Home Decor
  ['%sofa%',             img('photo-1555041469-a586c61ea9bc')],
  ['%couch%',            img('photo-1555041469-a586c61ea9bc')],
  ['%chair%',            img('photo-1555041469-a586c61ea9bc')],
  ['%table%',            img('photo-1555041469-a586c61ea9bc')],
  ['%bed%',              img('photo-1555041469-a586c61ea9bc')],
  ['%mattress%',         img('photo-1555041469-a586c61ea9bc')],
  ['%wardrobe%',         img('photo-1555041469-a586c61ea9bc')],
  ['%fridge%',           img('photo-1584568694244-14fbdf83bd30')],
  ['%refrigerator%',     img('photo-1584568694244-14fbdf83bd30')],
  ['%stove%',            img('photo-1556909114-f6e7ad7d3136')],
  ['%oven%',             img('photo-1556909114-f6e7ad7d3136')],
  ['%washer%',           img('photo-1626806787461-102c1bfaaea1')],
  ['%washing machine%',  img('photo-1626806787461-102c1bfaaea1')],
  ['%microwave%',        img('photo-1574269909862-7e1d70bb8078')],
  ['%television%',       img('photo-1593359677879-a4bb92f829e1')],
  ['%tv%',               img('photo-1593359677879-a4bb92f829e1')],
  ['%lamp%',             img('photo-1513506003901-1e6a35f59f5b')],
  ['%curtain%',          img('photo-1555041469-a586c61ea9bc')],
]

async function run() {
  // Step 1: vendor-wide defaults
  const { rows: vendors } = await pool.query('SELECT id, "storeName" FROM "Vendor"')
  let total = 0

  for (const v of vendors) {
    const defaultImg = VENDOR_DEFAULTS[v.storeName]
    if (!defaultImg) continue
    const r = await pool.query('UPDATE "Product" SET images = $1 WHERE "vendorId" = $2', [defaultImg, v.id])
    console.log(`[vendor default] "${v.storeName}": ${r.rowCount} products`)
    total += r.rowCount ?? 0
  }

  // Step 2: name-specific overrides
  let overrides = 0
  for (const [pattern, imgVal] of OVERRIDES) {
    const r = await pool.query('UPDATE "Product" SET images = $1 WHERE LOWER(name) LIKE LOWER($2)', [imgVal, pattern])
    if (r.rowCount && r.rowCount > 0) {
      console.log(`[override] "${pattern}": ${r.rowCount}`)
      overrides += r.rowCount
    }
  }

  console.log(`\nDone! Vendor defaults: ${total}, Name overrides: ${overrides}`)
  await pool.end()
}

run().catch(console.error)
