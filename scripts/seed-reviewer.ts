// Seeds (or refreshes) the App Store / Play Store reviewer account.
//
//   email:    reviewer@zip.tt
//   password: Review2026!
//   role:     CUSTOMER
//
// Run with:  npm run seed:reviewer   (needs DATABASE_URL in env)
//
// Upsert is idempotent — safe to re-run. On re-run it re-hashes and
// resets the password so the reviewer can always log in with the
// documented credentials.
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set — cannot seed reviewer account.')
  }

  const password = await bcrypt.hash('Review2026!', 12)

  const user = await prisma.user.upsert({
    where: { email: 'reviewer@zip.tt' },
    update: { password, role: 'CUSTOMER' },
    create: {
      name: 'App Reviewer',
      email: 'reviewer@zip.tt',
      password,
      role: 'CUSTOMER',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Reviewer account ready:')
  console.log('   email:    reviewer@zip.tt')
  console.log('   password: Review2026!')
  console.log('   role:     CUSTOMER')
  console.log('   id:      ', user.id)
}

main()
  .catch((e) => {
    console.error('❌ seed-reviewer failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
