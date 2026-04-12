import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

async function run() {
  // First get all category IDs from the DB
  const catResult = await pool.query('SELECT id, name, slug FROM "Category"')
  const catMap: Record<string, string> = {}
  for (const row of catResult.rows) {
    catMap[row.name] = row.id
  }
  console.log('Found categories:', Object.keys(catMap))

  const updates = [
    {
      categoryName: 'Electronics',
      patterns: ['%airpod%', '%iphone%', '%samsung%', '%macbook%', '%ipad%', '%ps5%', '%playstation%', '%xbox%', '%apple watch%', '%sony%', '%anker%', '%laptop%', '%tablet%', '%headphone%', '%earphone%', '%speaker%', '%charger%', '%cable%', '%powerbank%', '%power bank%', '%monitor%', '%printer%', '%camera%', '%drone%', '%router%', '%smart tv%', '%android%']
    },
    {
      categoryName: 'Toys, Games & Kids',
      patterns: ['%lego%', '%barbie%', '%hot wheels%', '%nerf%', '%power wheels%', '%playskool%', '%fisher-price%', '%fisher price%', '%hasbro%', '%mattel%', '%puzzle%', '%board game%', '%action figure%', '%plush%', '%stuffed%', '%teddy%', '%doll%', '%toy%', '%ride-on%', '%ride on%', '%baby%', '%toddler%', '%kids%', '%children%']
    },
    {
      categoryName: 'Fashion & Clothing',
      patterns: ['%hoodie%', '%tee%', '%t-shirt%', '%shirt%', '%dress%', '%jeans%', '%pants%', '%shorts%', '%socks%', '%sneaker%', '%shoes%', '%boots%', '%sandals%', '%jacket%', '%coat%', '%blouse%', '%skirt%', '%legging%']
    },
    {
      categoryName: 'Urban Fashion & Streetwear',
      patterns: ['%bucket hat%', '%snapback%', '%cap%', '%fitted%', '%tracksuit%', '%jogger%', '%crewneck%']
    },
    {
      categoryName: 'Rum & Spirits',
      patterns: ['%rum%', '%bitters%', '%angostura%', '%whisky%', '%whiskey%', '%vodka%', '%gin%', '%brandy%', '%cognac%', '%liqueur%', '%beer%', '%wine%', '%champagne%', '%prosecco%']
    },
    {
      categoryName: 'Carnival & Mas',
      patterns: ['%carnival%', '%costume%', '% mas %', '%fete%', '%wristband%', '%band launch%', '%bikini and beads%']
    },
    {
      categoryName: 'Groceries & Food',
      patterns: ['%seasoning%', '%pepper sauce%', '%hot sauce%', '%green seasoning%', '%curry%', '%spice%', '%sauce%', '%condiment%', '%food%', '%snack%', '%chocolate%', '%candy%']
    },
    {
      categoryName: 'Home & Garden',
      patterns: ['%sofa%', '%couch%', '%chair%', '%table%', '%bed%', '%mattress%', '%curtain%', '%rug%', '%carpet%', '%lamp%', '%light%', '%mirror%', '%shelf%', '%bookcase%', '%wardrobe%', '%cabinet%', '%drawer%', '%cushion%', '%pillow%', '%plant%', '%vase%']
    },
    {
      categoryName: 'Beauty & Health',
      patterns: ['%shampoo%', '%conditioner%', '%lotion%', '%cream%', '%perfume%', '%cologne%', '%makeup%', '%lipstick%', '%foundation%', '%mascara%', '%nail%', '%skincare%', '%sunscreen%', '%vitamin%', '%supplement%']
    },
  ]

  let total = 0
  for (const { categoryName, patterns } of updates) {
    const categoryId = catMap[categoryName]
    if (!categoryId) {
      console.log(`⚠️  Category not found: "${categoryName}"`)
      continue
    }
    for (const pattern of patterns) {
      const res = await pool.query(
        `UPDATE "Product" SET "categoryId" = $1 WHERE LOWER(name) LIKE LOWER($2)`,
        [categoryId, pattern]
      )
      if (res.rowCount && res.rowCount > 0) {
        console.log(`✅ ${categoryName}: ${res.rowCount} products matching "${pattern}"`)
        total += res.rowCount
      }
    }
  }
  console.log(`\nTotal category-fixed: ${total} products`)
  await pool.end()
}

run().catch(console.error)
