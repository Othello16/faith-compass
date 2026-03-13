import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

const TABLE = 'faith-compass-subscriptions'

let docClient: DynamoDBDocumentClient | null = null
let rawClient: DynamoDBClient | null = null

function getClients() {
  if (!rawClient) {
    rawClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.FAITH_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.FAITH_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })
    docClient = DynamoDBDocumentClient.from(rawClient)
  }
  return { raw: rawClient!, doc: docClient! }
}

async function ensureTable() {
  const { raw } = getClients()
  try {
    await raw.send(new DescribeTableCommand({ TableName: TABLE }))
  } catch (err: unknown) {
    const e = err as { name?: string }
    if (e?.name === 'ResourceNotFoundException') {
      await raw.send(new CreateTableCommand({
        TableName: TABLE,
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
      }))
      // Wait for table to become active
      await new Promise(r => setTimeout(r, 3000))
    }
  }
}

export type Plan = 'free' | 'guided' | 'pro'

export interface Subscription {
  userId: string
  plan: Plan
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  stripeCustomerId: string
  stripeSubscriptionId: string
  currentPeriodEnd: string  // ISO
  updatedAt: string
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  await ensureTable()
  const { doc } = getClients()
  try {
    const result = await doc.send(new GetCommand({ TableName: TABLE, Key: { userId } }))
    if (!result.Item) return null
    return result.Item as Subscription
  } catch {
    return null
  }
}

export async function upsertSubscription(sub: Subscription): Promise<void> {
  await ensureTable()
  const { doc } = getClients()
  await doc.send(new PutCommand({ TableName: TABLE, Item: { ...sub, updatedAt: new Date().toISOString() } }))
}

export async function isSubscribed(userId: string): Promise<{ subscribed: boolean; plan: Plan }> {
  const sub = await getSubscription(userId)
  if (!sub) return { subscribed: false, plan: 'free' }
  const active = sub.status === 'active' || sub.status === 'trialing'
  const notExpired = new Date(sub.currentPeriodEnd) > new Date()
  if (active && notExpired) return { subscribed: true, plan: sub.plan }
  return { subscribed: false, plan: 'free' }
}

// Monthly question limits per plan
export const PLAN_LIMITS: Record<Plan, number | null> = {
  free: null,       // uses daily limit (3/day) — see usage-limit.ts
  guided: 100,      // 100 questions per month
  pro: 500,         // 500 questions per month
}

export const PLAN_PRICE_IDS: Record<string, Plan> = {
  [process.env.STRIPE_PRICE_ID_GUIDED || 'price_1TAZX83qAFa8YFW6IAZlhatH']: 'guided',
  [process.env.STRIPE_PRICE_ID_PRO || 'price_1TAZXo3qAFa8YFW6qtwOajN2']: 'pro',
}
