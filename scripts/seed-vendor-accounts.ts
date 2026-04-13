import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

const accounts = [
  { email: 'don@wvrldwide.tt',         password: 'Wvrldwide2026',   name: 'Don Wvrldwide',        storeName: "Don Wvrldwide",     role: 'VENDOR' },
  { email: 'info@dbesttoys.tt',         password: 'BestToys2026',    name: "D'Best Toys",          storeName: "D'Best Toys",       role: 'VENDOR' },
  { email: 'info@trinitechhub.tt',      password: 'TechHub2026',     name: 'Trini Tech Hub',       storeName: "Trini Tech Hub",    role: 'VENDOR' },
  { email: 'info@dmascamp.tt',          password: 'DmasCamp2026',    name: "D'Mas Camp",           storeName: "D'Mas Camp",        role: 'VENDOR' },
  { email: 'info@elitehome.tt',         password: 'EliteHome2026',   name: 'Elite Home Decor',     storeName: "Elite Home Decor",  role: 'VENDOR' },
  { email: 'info@trininecessities.tt',  password: 'Necessities2026', name: 'Trini Necessities',    storeName: "Trini Necessities", role: 'VENDOR' },
  { email: 'sasha@sashasgourmet.tt',    password: 'Gourmet2026',     name: "Sasha's Gourmet",      storeName: "Sasha's Gourmet",   role: 'VENDOR' },
  { email: 'elijah.dass1@gmail.com',    password: 'TridentAdmin2026!', name: 'Elijah Dass',        storeName: null,                role: 'ADMIN' },
]

async function run() {
  for (const acc of accounts) {
    const hash = bcrypt.hashSync(acc.password, 12)
    const userId = randomUUID()

    // Upsert user — update password if email already exists
    await pool.query(`
      INSERT INTO "User" (id, name, email, password, role, status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        name = EXCLUDED.name
    `, [userId, acc.name, acc.email, hash, acc.role])

    // Get the actual user ID (in case it already existed)
    const { rows } = await pool.query('SELECT id FROM "User" WHERE email = $1', [acc.email])
    const realUserId = rows[0].id

    // Link to vendor if this is a vendor account
    if (acc.storeName) {
      await pool.query(`
        UPDATE "Vendor" SET "userId" = $1 WHERE "storeName" = $2
      `, [realUserId, acc.storeName])
      console.log(`OK ${acc.email} -> linked to "${acc.storeName}"`)
    } else {
      console.log(`OK ${acc.email} -> Admin`)
    }
  }

  // Verify
  const { rows: vendors } = await pool.query(`
    SELECT v."storeName", u.email, v.status
    FROM "Vendor" v
    LEFT JOIN "User" u ON u.id = v."userId"
    ORDER BY v."storeName"
  `)
  console.log('\nVendor accounts:')
  vendors.forEach((v: any) => console.log(`  ${v.storeName}: ${v.email ?? '(no user linked)'} [${v.status}]`))

  await pool.end()
}

run().catch(console.error)
