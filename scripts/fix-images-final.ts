import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

// ── Image pools per vendor type ────────────────────────────────────────────────

const toyImages = [
  'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600', // LEGO bricks
  'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600', // toy cars
  'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600', // board games
  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600', // dolls/pink toys
  'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=600',    // stuffed animals
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',    // kids bicycle
  'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600', // action toys
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600',    // ride-on car
]

const techImages = [
  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', // phones
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', // headphones
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',    // tablet
  'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600',    // laptop
  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600', // charger/accessories
  'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600', // airpods/earbuds
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600', // smart watch
  'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600', // TV/monitor
]

const streetwearImages = [
  'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600', // black hoodie
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', // tee
  'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600', // bucket hat
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', // shorts
  'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600', // socks
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600',    // white tee
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', // crewneck sweatshirt
]

const homeImages = [
  'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600', // fridge
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',    // stove
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',    // sofa
  'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600', // TV
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600', // microwave
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',    // washer
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600', // kitchen/counter
]

const carnivalImages = [
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600', // carnival colorful
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600', // snapback cap
  'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600', // festival crowd
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600', // costume/festival
]

const groceryImages = [
  'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600', // spices/seasoning
  'https://images.unsplash.com/photo-1470338745628-171cf53de3a8?w=600', // rum/drinks
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',    // fresh produce
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',    // pantry
  'https://images.unsplash.com/photo-1584868609591-7d9ba1b79a38?w=600', // coconut milk
  'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=600', // cooking ingredients
]

const homeGardenImages = [
  'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600', // jewelry/bracelet
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',    // home decor sofa
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600', // home interior
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600', // bedroom/lamp
  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600', // crystal/lamp
  'https://images.unsplash.com/photo-1523413307857-ef26e3bf671e?w=600', // necklace/jewelry
  'https://images.unsplash.com/photo-1546913720-3091d4610c95?w=600',    // decor accessories
]

// ── Vendor config ──────────────────────────────────────────────────────────────

interface VendorConfig {
  name: string
  imagePool: string[]
  overrides?: { keywords: string[]; image: string }[]
}

const VENDORS: { [vendorId: string]: VendorConfig } = {
  'cmnwbk3p0000ox0cnmho5oh3q': {
    name: "D'Best Toys",
    imagePool: toyImages,
    overrides: [
      { keywords: ['lego'],                          image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600' },
      { keywords: ['barbie'],                        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600' },
      { keywords: ['hot wheels'],                    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600' },
      { keywords: ['power wheels', 'jeep', 'ride-on', 'ride on'], image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600' },
      { keywords: ['nerf'],                          image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600' },
      { keywords: ['plush', 'stuffed', 'teddy', 'bear'], image: 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=600' },
      { keywords: ['board game', 'uno', 'monopoly', 'puzzle'], image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600' },
      { keywords: ['bicycle', 'bike', 'scooter'],   image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
      { keywords: ['doll'],                          image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600' },
    ]
  },
  'cmnwbk2xd000lx0cns6x4gs4n': {
    name: "D'Mas Camp",
    imagePool: carnivalImages,
  },
  'cmnwbk3h7000nx0cnuquug9u8': {
    name: "Don Wvrldwide",
    imagePool: streetwearImages,
    overrides: [
      { keywords: ['hoodie'],    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600' },
      { keywords: ['tee', 't-shirt', 'shirt'], image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600' },
      { keywords: ['hat', 'cap'], image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600' },
      { keywords: ['shorts'],    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600' },
      { keywords: ['socks'],     image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600' },
    ]
  },
  'cmnwbk3up000px0cnspizxuk5': {
    name: "Elite Home Decor",
    imagePool: homeImages,
    overrides: [
      { keywords: ['refrigerator', 'fridge'],    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600' },
      { keywords: ['stove', 'oven', 'range'],    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600' },
      { keywords: ['sofa', 'couch', 'sectional'], image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600' },
      { keywords: ['tv', 'television'],          image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600' },
      { keywords: ['microwave'],                 image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600' },
      { keywords: ['wardrobe', 'drawer', 'chest', 'dresser'], image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600' },
    ]
  },
  'cmnwbk36o000mx0cn3juv7lml': {
    name: "Sasha's Gourmet",
    imagePool: groceryImages,
    overrides: [
      { keywords: ['rum', 'angostura', '1919'],  image: 'https://images.unsplash.com/photo-1470338745628-171cf53de3a8?w=600' },
      { keywords: ['seasoning', 'herb', 'shadow beni', 'curry', 'spice'], image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600' },
      { keywords: ['coconut', 'milk'],           image: 'https://images.unsplash.com/photo-1584868609591-7d9ba1b79a38?w=600' },
    ]
  },
  'c77eb95b6eef1027c4fe047': {
    name: "Trini Necessities",
    imagePool: homeGardenImages,
    overrides: [
      { keywords: ['bracelet', 'copper', 'magnetic'], image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600' },
      { keywords: ['necklace', 'pendant', 'obsidian', 'crystal', 'jade'], image: 'https://images.unsplash.com/photo-1523413307857-ef26e3bf671e?w=600' },
      { keywords: ['lamp', 'light', 'led', 'sphere', 'ball', 'galaxy', 'resin'], image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600' },
    ]
  },
  'cmnwbk2l0000kx0cnmprzxsp6': {
    name: "Trini Tech Hub",
    imagePool: techImages,
    overrides: [
      { keywords: ['speaker', 'jbl', 'bluetooth'], image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
      { keywords: ['power bank', 'battery', 'anker'], image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600' },
      { keywords: ['samsung', 'galaxy', 'phone', 'iphone'], image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600' },
      { keywords: ['airpods', 'earbuds', 'earphone', 'headphone'], image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600' },
    ]
  },
  'c88ddde5022b7cfa739a520': {
    name: "iWorld TT",
    imagePool: techImages,
    overrides: [
      { keywords: ['cable', 'thunderbolt', 'lightning'], image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600' },
      { keywords: ['adapter', 'charger', 'power'],      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600' },
      { keywords: ['airpods', 'earpods', 'earphone'],   image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600' },
      { keywords: ['ipad', 'tablet'],                    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600' },
      { keywords: ['macbook', 'laptop'],                 image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600' },
      { keywords: ['apple pencil', 'pencil'],            image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600' },
      { keywords: ['watch', 'band'],                     image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600' },
      { keywords: ['phone', 'iphone'],                   image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600' },
    ]
  },
}

function getOverrideImage(productName: string, overrides: { keywords: string[]; image: string }[]): string | null {
  const lower = productName.toLowerCase()
  for (const override of overrides) {
    if (override.keywords.some(kw => lower.includes(kw))) {
      return override.image
    }
  }
  return null
}

async function run() {
  console.log('=== FIX IMAGES (rotating pools per vendor) ===\n')

  for (const [vendorId, config] of Object.entries(VENDORS)) {
    const { rows: products } = await pool.query(
      `SELECT id, name FROM "Product" WHERE "vendorId" = $1 ORDER BY id`,
      [vendorId]
    )

    if (products.length === 0) {
      console.log(`[SKIP] ${config.name}: no products found`)
      continue
    }

    console.log(`[UPDATE] ${config.name}: ${products.length} products`)

    let overrideCount = 0
    let rotationCount = 0

    // Process in batches of 100 for efficiency
    const BATCH_SIZE = 100
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE)

      for (let j = 0; j < batch.length; j++) {
        const product = batch[j]
        const globalIndex = i + j

        // Try override first
        let imageUrl: string | null = null
        if (config.overrides) {
          imageUrl = getOverrideImage(product.name, config.overrides)
          if (imageUrl) overrideCount++
        }

        // Fall back to rotation
        if (!imageUrl) {
          imageUrl = config.imagePool[globalIndex % config.imagePool.length]
          rotationCount++
        }

        await pool.query(
          `UPDATE "Product" SET images = $1 WHERE id = $2`,
          [JSON.stringify([imageUrl]), product.id]
        )
      }

      if (i % 500 === 0 && i > 0) {
        console.log(`  ... processed ${i} products`)
      }
    }

    console.log(`  -> Done: ${overrideCount} name-matched overrides + ${rotationCount} rotated`)
  }

  // Verify spot check
  console.log('\n=== SPOT CHECK (3 products per vendor) ===')
  for (const [vendorId, config] of Object.entries(VENDORS)) {
    const { rows } = await pool.query(
      `SELECT name, images FROM "Product" WHERE "vendorId" = $1 ORDER BY id LIMIT 3`,
      [vendorId]
    )
    console.log(`\n${config.name}:`)
    rows.forEach(r => {
      console.log(`  "${r.name}" -> ${r.images.substring(0, 80)}`)
    })
  }

  await pool.end()
  console.log('\nDone.')
}

run().catch(console.error)
