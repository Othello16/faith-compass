import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { checkConsent, recordConsent } from '@/lib/consent'
import { getUserIdFromRequest } from '@/lib/usage-limit'

export async function GET() {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ hasConsented: false, error: 'Not authenticated' }, { status: 401 })
  }
  const userId = getUserIdFromRequest(session as { user?: { id?: string; email?: string } }, null)
  const hasConsented = await checkConsent(userId)
  return NextResponse.json({ hasConsented })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { termsAccepted, privacyAccepted, marketingOptIn } = await req.json()
  if (!termsAccepted || !privacyAccepted) {
    return NextResponse.json({ error: 'Terms and privacy acceptance required' }, { status: 400 })
  }

  const userId = getUserIdFromRequest(session as { user?: { id?: string; email?: string } }, null)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'

  await recordConsent({
    userId,
    termsAccepted,
    privacyAccepted,
    marketingOptIn: !!marketingOptIn,
    acceptedAt: new Date().toISOString(),
    ipAddress: ip,
    userAgent,
    version: '1.0',
  })

  return NextResponse.json({ ok: true })
}
