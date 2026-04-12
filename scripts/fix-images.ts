import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

const imageUpdates = [
  // Electronics
  { match: '%airpod%', img: 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=600' },
  { match: '%iphone%', img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600' },
  { match: '%samsung galaxy%', img: 'https://images.unsplash.com/photo-1707343848552-893e05dba6ac?w=600' },
  { match: '%macbook%', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
  { match: '%ipad%', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600' },
  { match: '%apple watch%', img: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600' },
  { match: '%ps5%', img: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600' },
  { match: '%playstation%', img: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600' },
  { match: '%xbox%', img: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600' },
  // Toys
  { match: '%lego%', img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600' },
  { match: '%barbie%', img: 'https://images.unsplash.com/photo-1612160609504-334bce9f2c42?w=600' },
  { match: '%hot wheels%', img: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600' },
  { match: '%power wheels%', img: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600' },
  { match: '%nerf%', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  { match: '%board game%', img: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600' },
  { match: '%puzzle%', img: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600' },
  { match: '%plush%', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600' },
  { match: '%teddy%', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600' },
  { match: '%stuffed%', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600' },
  { match: '%ride-on%', img: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600' },
  { match: '%ride on%', img: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600' },
  // Rum & Spirits
  { match: '%angostura%', img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
  { match: '%rum%', img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
  { match: '%bitters%', img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600' },
  { match: '%whisky%', img: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600' },
  { match: '%whiskey%', img: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600' },
  // Carnival
  { match: '%carnival%', img: 'https://images.unsplash.com/photo-1559894922-a2c97d6e40c5?w=600' },
  { match: '%costume%', img: 'https://images.unsplash.com/photo-1559894922-a2c97d6e40c5?w=600' },
  // Groceries
  { match: '%seasoning%', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600' },
  { match: '%pepper sauce%', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600' },
  // Don Wvrldwide streetwear
  { match: '%hoodie%', img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600' },
  { match: '%tee%', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600' },
  { match: '%bucket hat%', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600' },
]

async function run() {
  let total = 0
  for (const { match, img } of imageUpdates) {
    const value = JSON.stringify([img])
    const res = await pool.query(
      `UPDATE "Product" SET images = $1 WHERE LOWER(name) LIKE LOWER($2)`,
      [value, match]
    )
    if (res.rowCount && res.rowCount > 0) {
      console.log(`✅ Updated ${res.rowCount} products matching "${match}"`)
      total += res.rowCount
    }
  }
  console.log(`\nTotal updated: ${total} products`)
  await pool.end()
}

run().catch(console.error)
