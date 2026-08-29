import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      // Google verifies email ownership before issuing a token, so linking
      // a Google sign-in to an existing email/password User with the same
      // address carries no account-takeover risk. Without this, NextAuth
      // refuses the link and bounces with OAuthAccountNotLinked.
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        // Diagnostic logging (server-side only — never returned to the client,
        // so it can't be used to enumerate accounts from the browser). These
        // lines make "email login silently fails" debuggable from Vercel logs:
        // the overwhelmingly common cause is an OAuth-only account (registered
        // via Google, so `password` is null) being used with the email form.
        if (!user) {
          console.warn(`[auth] credentials login failed: no account for ${credentials.email}`)
          return null
        }
        if (!user.password) {
          console.warn(
            `[auth] credentials login failed: ${credentials.email} has no password set (OAuth-only account — sign in with Google/Apple instead)`
          )
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          console.warn(`[auth] credentials login failed: wrong password for ${credentials.email}`)
          return null
        }

        if (user.status === 'BANNED' || user.deletedAt) {
          throw new Error('Your account has been suspended.')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
    // Apple Sign-In. Registered ONLY when both env vars are present so the
    // provider stays dormant (and never surfaces a broken button) until the
    // Apple Developer credentials are supplied on Vercel. APPLE_SECRET is a
    // short-lived ES256 JWT — regenerate it with scripts/generate-apple-secret.mjs
    // before it expires (max 180 days). Apple returns a verified email, so
    // linking to an existing same-email account is safe (see Google above).
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET
      ? [
          AppleProvider({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user }) {
      // Gate every provider (Google included — authorize() above only
      // covers the credentials provider) against banned/removed accounts.
      let dbUser
      try {
        dbUser = await prisma.user.findUnique({
          where: { id: (user as any).id },
          select: { status: true, deletedAt: true },
        })
      } catch (err) {
        // Fail open on a transient DB failure (e.g. a Neon serverless cold
        // start) rather than dropping the sign-in — same policy as the jwt
        // callback below. A genuinely banned user is still caught on the
        // next request once the DB is warm, via the jwt role refresh.
        console.warn('[auth] signIn ban check skipped (transient DB error):', (err as Error)?.message)
        return true
      }
      if (dbUser && (dbUser.status === 'BANNED' || dbUser.deletedAt)) {
        return false
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      // Always refresh role + ban/removal state from DB so an
      // already-issued session dies the moment an admin acts.
      if (token.id) {
        let dbUser
        try {
          dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, status: true, deletedAt: true },
          })
        } catch (err) {
          // Transient DB failure (e.g. a Neon serverless cold start) must NOT
          // invalidate every live session — that would randomly log the whole
          // marketplace out under load. Keep the existing token; the ban/role
          // refresh will succeed on the next request once the DB is warm.
          console.warn('[auth] jwt role refresh skipped (transient DB error):', (err as Error)?.message)
          return token
        }
        if (!dbUser || dbUser.status === 'BANNED' || dbUser.deletedAt) {
          // Definitive result (user genuinely gone or banned): throwing here
          // makes next-auth fail to resolve the session, forcing them out.
          throw new Error('Account suspended')
        }
        token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
}
