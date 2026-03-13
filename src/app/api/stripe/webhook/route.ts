import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { upsertSubscription, PLAN_PRICE_IDS, Plan } from '@/lib/subscription'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break
        const userId = session.client_reference_id || session.metadata?.userId
        if (!userId) { console.error('No userId in checkout session'); break }

        const subscriptionId = session.subscription as string
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = sub.items.data[0]?.price.id
        const plan: Plan = PLAN_PRICE_IDS[priceId] || 'guided'

        await upsertSubscription({
          userId,
          plan,
          status: sub.status as 'active' | 'canceled' | 'past_due' | 'trialing',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        })
        console.log(`✅ Subscription created: ${userId} → ${plan}`)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        const priceId = sub.items.data[0]?.price.id
        const plan: Plan = PLAN_PRICE_IDS[priceId] || 'guided'

        await upsertSubscription({
          userId,
          plan,
          status: sub.status as 'active' | 'canceled' | 'past_due' | 'trialing',
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        })
        console.log(`✅ Subscription updated: ${userId} → ${plan} (${sub.status})`)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        await upsertSubscription({
          userId,
          plan: 'free',
          status: 'canceled',
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        })
        console.log(`✅ Subscription canceled: ${userId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as unknown as { subscription: string }).subscription
        if (!subscriptionId) break
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.userId
        if (userId) {
          await upsertSubscription({
            userId,
            plan: PLAN_PRICE_IDS[sub.items.data[0]?.price.id] || 'guided',
            status: 'past_due',
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          })
          console.log(`⚠️ Payment failed: ${userId}`)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
