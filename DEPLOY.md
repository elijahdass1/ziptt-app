# zip.tt — Deployment Guide

## Quick Deploy to Vercel + Neon Postgres

### 1. Create a Neon Database
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project → copy the **Connection String**
3. It looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

### 2. Run Database Migration
```bash
# Set your Neon connection string
export DATABASE_URL="postgresql://..."

# Push schema to Neon
npx prisma db push

# Seed with demo data
npx tsx prisma/seed.ts
```

### 3. Push to GitHub
```bash
git init
git add .
git commit -m "Initial zip.tt commit"
git remote add origin https://github.com/youruser/ziptt.git
git push -u origin main
```

### 4. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **Import Project**
2. Select your GitHub repo
3. Add all environment variables from `.env.production.template`
4. Click **Deploy** — Vercel auto-runs `prisma generate && next build`

### 5. Environment Variables (required)
| Variable | Where to get |
|---|---|
| `DATABASE_URL` | Neon dashboard |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `UPLOADTHING_SECRET` | [uploadthing.com](https://uploadthing.com) |
| `WIPAY_ACCOUNT_NUMBER` | [wipayfinancial.com](https://wipayfinancial.com) |
| `WIPAY_API_KEY` | [wipayfinancial.com](https://wipayfinancial.com) |

### 6. Schema Migration (SQLite → PostgreSQL)
The app uses a JSON workaround for arrays in SQLite dev mode.
For production PostgreSQL, update `prisma/schema.prisma`:
- Change `provider = "sqlite"` to `provider = "postgresql"`
- Change `String` JSON fields back to `String[]` arrays
- Remove the `$extends` result transforms in `lib/prisma.ts`
- Run `npx prisma migrate deploy`

### Custom Domain
Point `zip.tt` DNS to Vercel:
- Add A record: `76.76.21.21`
- Add CNAME: `cname.vercel-dns.com`

## Dev Setup
```bash
npm install
npx prisma generate
npx tsx prisma/seed.ts
npm run dev  # runs on port 3001
```
