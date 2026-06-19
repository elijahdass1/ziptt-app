// Isolated seed for the app-store reviewer demo account. Upserts ONLY the
// reviewer User row — never touches vendors/products/categories/addresses.
// Safe to re-run: each run regenerates the password and resets it on the
// existing row, so the printed credentials always match what's in the DB.
import dotenv from 'dotenv'
import path from 'path'
// Plain ts-node scripts don't get Next.js's automatic .env loading, so load
// it ourselves. .env.local takes precedence, same as Next's own convention.
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env.local'), override: true })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding reviewer demo account...')

  const password = crypto.randomBytes(9).toString('base64url')
  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.upsert({
    where: { email: 'reviewer@zip.tt' },
    update: { password: passwordHash },
    create: {
      name: 'App Reviewer',
      email: 'reviewer@zip.tt',
      password: passwordHash,
      role: 'CUSTOMER',
      emailVerified: new Date(),
    },
  })

  console.log(`REVIEWER LOGIN: reviewer@zip.tt / ${password}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
