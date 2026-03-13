import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

const TABLE_NAME = process.env.DYNAMODB_USAGE_TABLE || 'faith-compass-usage'
const FREE_LIMIT = 3
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
const TTL_SECONDS = 25 * 60 * 60 // 25 hours

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
  nextAvailable: string | null
}

export async function checkUsageLimit(userId: string): Promise<UsageCheckResult> {
  const db = getClient()
  const now = new Date()
  const windowStart = new Date(now.getTime() - WINDOW_MS).toISOString()

  const result = await db.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :uid AND questionTimestamp > :start',
    ExpressionAttributeValues: {
      ':uid': userId,
      ':start': windowStart,
    },
  }))

  const used = result.Count || 0
  const remaining = Math.max(0, FREE_LIMIT - used)
  const allowed = used < FREE_LIMIT

  let nextAvailable: string | null = null
  if (!allowed && result.Items && result.Items.length > 0) {
    const timestamps = result.Items.map(i => i.questionTimestamp as string).sort()
    const oldest = new Date(timestamps[0])
    nextAvailable = new Date(oldest.getTime() + WINDOW_MS).toISOString()
  }

  return { allowed, used, limit: FREE_LIMIT, remaining, nextAvailable }
}

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

export function getUserIdFromRequest(
  session: { user?: { id?: string; email?: string } } | null,
  ip: string | null
): string {
  if (session?.user?.id) return `user:${session.user.id}`
  if (session?.user?.email) return `user:${session.user.email}`
  return `anon:${ip || 'unknown'}`
}
