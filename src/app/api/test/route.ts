import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    openai_key: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.slice(0,7)}...` : 'MISSING',
    faith_aws_key: process.env.FAITH_AWS_ACCESS_KEY_ID ? `${process.env.FAITH_AWS_ACCESS_KEY_ID.slice(0,8)}...` : 'MISSING',
    dynamo_table: process.env.DYNAMODB_USAGE_TABLE || 'MISSING',
    region: process.env.AWS_REGION || 'MISSING',
  })
}
