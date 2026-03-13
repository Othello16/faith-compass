import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkUsageLimit, getUserIdFromRequest } from '@/lib/usage-limit'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  const userId = getUserIdFromRequest(
    session?.user
      ? { user: { id: (session.user as { id?: string }).id, email: session.user.email ?? undefined } }
      : null,
    ip
  )

  // checkUsageLimit handles the subscription lookup internally — single DynamoDB call
  const usage = await checkUsageLimit(userId)

  return NextResponse.json({
    allowed: usage.allowed,
    used: usage.used,
    limit: usage.limit,
    remaining: usage.remaining,
    nextAvailable: usage.nextAvailable,
    plan: usage.plan,           // 'free' | 'guided' | 'pro'
    subscribed: usage.subscribed,
  })
}
