import { getServerSession } from 'next-auth'
import type { AuthOptions } from 'next-auth'
import CognitoProvider from 'next-auth/providers/cognito'
import GoogleProvider from 'next-auth/providers/google'
import TwitterProvider from 'next-auth/providers/twitter'
import AppleProvider from 'next-auth/providers/apple'

export const authOptions: AuthOptions = {
  providers: [
    // Email/password via Cognito (existing)
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
      issuer: process.env.COGNITO_ISSUER,
    }),

    // Google Sign-In
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Sign in with X (Twitter)
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: '2.0',
    }),

    // Sign in with Apple
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: {
        appleId: process.env.APPLE_ID!,
        teamId: process.env.APPLE_TEAM_ID!,
        privateKey: (process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        keyId: process.env.APPLE_KEY_ID!,
      } as unknown as string,
    }),
  ],

  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/signin' },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.sub = account.providerAccountId || token.sub
        token.provider = account.provider
        // Carry over name/image from social providers
        if (profile) {
          token.name = token.name || (profile as Record<string, unknown>).name as string
          token.picture = token.picture || (profile as Record<string, unknown>).picture as string
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub
        ;(session.user as { provider?: string }).provider = token.provider as string
      }
      return session
    },
  },
}

export async function getSession() {
  return getServerSession(authOptions)
}
