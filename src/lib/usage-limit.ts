import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { isSubscribed, PLAN_LIMITS, Subscription } from './subscription'

const TABLE_NAME = process.env.DYNAMODB_USAGE_TABLE || 'faith-compass-usage'
const FREE_LIMIT = 3
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24-hour rolling window (free tier)
const TTL_SECONDS = 32 * 24 * 60 * 60  // 32 days TTL (covers full billing cycle + buffer)

let docClient: DynamoDBDocumentClient | null = null

function getClient() {
  if (!docClient) {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.FAITH_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.FAITH_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })
    docClient = DynamoDBDocumentClient.from(client)
  }
  return docClient
}

export interface UsageCheckResult {
  allowed: boolean
  used: number
  limit: number
  remaining: number
  nextAvailable: string | null  // ISO — when the next question becomes available
  plan: string
  subscribed: boolean
}

/**
 * Check usage limit for a user.
 *
 * Free users:  3 questions per 24-hour rolling window
 * Guided:     500 questions per billing cycle (currentPeriodStart → currentPeriodEnd)
 * Pro:       1500 questions per billing cycle (currentPeriodStart → currentPeriodEnd)
 *
 * Billing cycle alignment: usage is counted from Stripe's currentPeriodStart,
 * so limits reset when the subscription renews — not on a rolling 30-day basis.
 * If currentPeriodStart is missing (legacy records), falls back to currentPeriodEnd - 30 days.
 */
export async function checkUsageLimit(userId: string): Promise<UsageCheckResult> {
  const db = getClient()
  const now = new Date()

  // Single subscription lookup — result passed to avoid double-call in route
  const { subscribed, plan, subscription } = await isSubscribed(userId)
  const monthlyLimit = PLAN_LIMITS[plan]

  if (subscribed && monthlyLimit !== null && subscription) {
    // ── Paid user: count questions within the current billing cycle ────────
    const cycleStart = getPeriodStart(subscription)
    const result = await db.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'userId = :uid AND questionTimestamp >= :start',
      ExpressionAttributeValues: { ':uid': userId, ':start': cycleStart },
    }))

    const used = result.Count || 0
    const remaining = Math.max(0, monthlyLimit - used)
    const allowed = used < monthlyLimit

    // nextAvailable = subscription renewal date (when their cycle resets)
    const nextAvailable = allowed ? null : subscription.currentPeriodEnd

    return {
      allowed,
      used,
      limit: monthlyLimit,
      remaining,
      nextAvailable,
      plan,
      subscribed: true,
    }
  }

  // ── Free user: 24-hour rolling window, 3 questions ────────────────────────
  const windowStart = new Date(now.getTime() - WINDOW_MS).toISOString()
  const result = await db.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :uid AND questionTimestamp > :start',
    ExpressionAttributeValues: { ':uid': userId, ':start': windowStart },
  }))

  const used = result.Count || 0
  const remaining = Math.max(0, FREE_LIMIT - used)
  const allowed = used < FREE_LIMIT

  let nextAvailable: string | null = null
  if (!allowed && result.Items?.length) {
    // Oldest question in window + 24h = when a slot opens up
    const oldest = result.Items.map(i => i.questionTimestamp as string).sort()[0]
    nextAvailable = new Date(new Date(oldest).getTime() + WINDOW_MS).toISOString()
  }

  return {
    allowed,
    used,
    limit: FREE_LIMIT,
    remaining,
    nextAvailable,
    plan,
    subscribed: false,
  }
}

/**
 * Record a question usage event for this user.
 * Call this AFTER successfully delivering an answer.
 */
export async function recordUsage(userId: string): Promise<void> {
  const db = getClient()
  const now = new Date()
  await db.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      userId,
      questionTimestamp: now.toISOString(),
      ttl: Math.floor(now.getTime() / 1000) + TTL_SECONDS,
    },
  }))
}

/**
 * Resolve the billing cycle start date.
 * Prefers currentPeriodStart stored in the subscription record.
 * Falls back to currentPeriodEnd - 30 days for legacy records that predate this field.
 */
function getPeriodStart(subscription: Subscription): string {
  if (subscription.currentPeriodStart) {
    return subscription.currentPeriodStart
  }
  // Legacy fallback: approximate start as 30 days before period end
  const fallback = new Date(new Date(subscription.currentPeriodEnd).getTime() - 30 * 24 * 60 * 60 * 1000)
  return fallback.toISOString()
}

export function getUserIdFromRequest(
  session: { user?: { id?: string; email?: string } } | null,
  ip: string | null
): string {
  if (session?.user?.id) return `user:${session.user.id}`
  if (session?.user?.email) return `user:${session.user.email}`
  return `anon:${ip || 'unknown'}`
}
