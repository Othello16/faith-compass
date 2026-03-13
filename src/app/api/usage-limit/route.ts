import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkUsageLimit, getUserIdFromRequest } from '@/lib/usage-limit'
import { isSubscribed } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const userId = getUserIdFromRequest(
    session?.user ? { user: { id: (session.user as {id?:string}).id, email: session.user.email ?? undefined } } : null,
    ip
  )

  const [usage, subInfo] = await Promise.all([
    checkUsageLimit(userId),
    session?.user ? isSubscribed(userId) : Promise.resolve({ subscribed: false, plan: 'free' as const }),
  ])

  return NextResponse.json({
    allowed: usage.allowed,
    used: usage.used,
    limit: usage.limit,
    remaining: usage.remaining,
    nextAvailable: usage.nextAvailable,
    plan: subInfo.plan,           // 'free' | 'guided' | 'pro'
    subscribed: subInfo.subscribed,
  })
}
