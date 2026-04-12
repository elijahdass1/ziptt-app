// update-passwords.js - Set vendor passwords in Neon
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const NEON_URL = 'postgresql://neondb_owner:npg_9GgIpNu2aUvH@ep-quiet-paper-am2rt5xh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'

const pool = new Pool({
  connectionString: NEON_URL,
  ssl: { rejectUnauthorized: false }
})

const vendorPasswords = [
  { email: 'don.wvrldwide@zip.tt', password: 'Wvrldwide2026', name: 'Don Wvrldwide' },
  { email: 'dbest.toys@zip.tt', password: 'BestToys2026', name: "D'Best Toys TT" },
  { email: 'trini.tech@zip.tt', password: 'TechHub2026', name: 'Kamla Ramsaran' },
  { email: 'dmas.camp@zip.tt', password: 'DmasCamp2026', name: 'Dexter Williams' },
  { email: 'elite.home@zip.tt', password: 'EliteHome2026', name: 'Elite Home Decor' },
  { email: 'trini.necessities@zip.tt', password: 'Necessities2026', name: 'Trini Necessities' },
  { email: 'sasha.gourmet@zip.tt', password: 'Gourmet2026', name: 'Sasha Mohammed' },
  // Also update existing emails from seed
  { email: 'mas.camp@zip.tt', password: 'DmasCamp2026', name: 'Dexter Williams' },
  { email: 'elite.homedecor@zip.tt', password: 'EliteHome2026', name: 'Elite Home Decor' },
]

async function updatePasswords() {
  console.log('Updating vendor passwords...')

  for (const v of vendorPasswords) {
    const hash = await bcrypt.hash(v.password, 12)

    // Try to upsert the user (create if not exists, update password if exists)
    try {
      const existing = await pool.query('SELECT id FROM "User" WHERE email = $1', [v.email])

      if (existing.rows.length > 0) {
        await pool.query('UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE email = $2', [hash, v.email])
        console.log(`Updated password for ${v.email}`)
      } else {
        // Create user with VENDOR role
        await pool.query(`
          INSERT INTO "User" (id, name, email, password, role, status, "createdAt", "updatedAt", "emailVerified")
          VALUES (gen_random_uuid()::text, $1, $2, $3, 'VENDOR', 'ACTIVE', NOW(), NOW(), NOW())
        `, [v.name, v.email, hash])
        console.log(`Created user ${v.email}`)
      }
    } catch (err) {
      console.error(`Failed for ${v.email}:`, err.message)
    }
  }

  // Show final vendor users
  const { rows } = await pool.query('SELECT email, role, name FROM "User" WHERE role = \'VENDOR\' ORDER BY email')
  console.log('\nVendor users in Neon:')
  rows.forEach(r => console.log(`  ${r.email} (${r.name})`))

  await pool.end()
}

updatePasswords().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
