// Admin/account password recovery. Sets a strong random password on an existing
// user and prints it ONCE to stdout. Use to get back into an account when the
// email reset flow isn't available yet (e.g. RESEND not configured).
//
//   npx ts-node scripts/reset-password.ts owner@example.com
//   (or: npm run reset-password -- owner@example.com)
//
// Follows the same env-loading + adapter setup as prisma/seed-reviewer.ts.
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
  const email = process.argv[2]?.trim()
  if (!email) {
    console.error('Usage: npx ts-node scripts/reset-password.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`No user found with email: ${email}`)
    process.exit(1)
  }

  // 24 random bytes -> ~32-char URL-safe password. bcrypt cost 12 matches the
  // registration and reset flows (bcrypt.hash(pw, 12)).
  const password = crypto.randomBytes(24).toString('base64url')
  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: passwordHash },
  })

  console.log('\n─────────────────────────────────────────────')
  console.log(`Password reset for: ${email}`)
  console.log(`New password:       ${password}`)
  console.log('Copy it now — it is not stored anywhere and')
  console.log('will not be shown again. Change it after signing in.')
  console.log('─────────────────────────────────────────────\n')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
