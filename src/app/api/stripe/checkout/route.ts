import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const PRICE_IDS: Record<string, string> = {
  guided: process.env.STRIPE_PRICE_ID_GUIDED || 'price_1TAZX83qAFa8YFW6IAZlhatH',
  pro:    process.env.STRIPE_PRICE_ID_PRO    || 'price_1TAZXo3qAFa8YFW6qtwOajN2',
}

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()
    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'auth_required' }, { status: 401 })
    }
    const userId = `user:${session.user.email}`

    const priceId = PRICE_IDS[plan]

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL || 'https://faithcompass.app'}/compass?upgraded=1`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'https://faithcompass.app'}/pricing`,
      client_reference_id: userId,
      metadata: { userId, plan },
      ...(session?.user?.email ? { customer_email: session.user.email } : {}),
      subscription_data: {
        metadata: { userId, plan },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
