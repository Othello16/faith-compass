import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

const CONSENT_TABLE = 'faith-compass-consent'
const LOGINS_TABLE = 'faith-compass-logins'
const LOGIN_TTL_SECONDS = 90 * 24 * 60 * 60 // 90 days

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
  return { raw: rawClient, doc: docClient! }
}

async function ensureTable(tableName: string, sortKey?: { name: string; type: 'S' | 'N' }) {
  const { raw } = getClients()
  try {
    await raw.send(new DescribeTableCommand({ TableName: tableName }))
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'ResourceNotFoundException') {
      const keySchema: { AttributeName: string; KeyType: 'HASH' | 'RANGE' }[] = [
        { AttributeName: 'userId', KeyType: 'HASH' },
      ]
      const attrDefs: { AttributeName: string; AttributeType: 'S' | 'N' | 'B' }[] = [
        { AttributeName: 'userId', AttributeType: 'S' },
      ]
      if (sortKey) {
        keySchema.push({ AttributeName: sortKey.name, KeyType: 'RANGE' })
        attrDefs.push({ AttributeName: sortKey.name, AttributeType: sortKey.type })
      }
      await raw.send(new CreateTableCommand({
        TableName: tableName,
        KeySchema: keySchema,
        AttributeDefinitions: attrDefs,
        BillingMode: 'PAY_PER_REQUEST',
      }))
    }
  }
}

// ── Consent ──────────────────────────────────────────────────────────────────

export interface ConsentRecord {
  userId: string
  termsAccepted: boolean
  privacyAccepted: boolean
  marketingOptIn: boolean
  acceptedAt: string
  ipAddress: string
  userAgent: string
  version: string
}

export async function checkConsent(userId: string): Promise<boolean> {
  const { doc } = getClients()
  await ensureTable(CONSENT_TABLE)
  try {
    const result = await doc.send(new GetCommand({
      TableName: CONSENT_TABLE,
      Key: { userId },
    }))
    return !!(result.Item && result.Item.termsAccepted && result.Item.privacyAccepted)
  } catch {
    return false
  }
}

export async function recordConsent(record: ConsentRecord): Promise<void> {
  const { doc } = getClients()
  await ensureTable(CONSENT_TABLE)
  await doc.send(new PutCommand({
    TableName: CONSENT_TABLE,
    Item: record,
  }))
}

// ── Login Events ─────────────────────────────────────────────────────────────

export async function recordLogin(
  userId: string,
  provider: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  const { doc } = getClients()
  await ensureTable(LOGINS_TABLE, { name: 'loginTimestamp', type: 'S' })
  const now = new Date()
  await doc.send(new PutCommand({
    TableName: LOGINS_TABLE,
    Item: {
      userId,
      loginTimestamp: now.toISOString(),
      provider,
      ipAddress,
      userAgent,
      ttl: Math.floor(now.getTime() / 1000) + LOGIN_TTL_SECONDS,
    },
  }))
}
