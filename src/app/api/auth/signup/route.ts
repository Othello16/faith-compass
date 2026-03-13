import { NextRequest, NextResponse } from 'next/server'
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.FAITH_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.FAITH_AWS_SECRET_ACCESS_KEY || '',
  },
})

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Sign up
    await cognitoClient.send(new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: 'email', Value: email }],
    }))

    // Auto-confirm for frictionless signup (no email verification step)
    await cognitoClient.send(new AdminConfirmSignUpCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: email,
    }))

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sign up failed'
    // If user already exists, tell them to sign in instead
    if (message.includes('UsernameExistsException') || message.includes('already exists')) {
      return NextResponse.json({ error: 'Account already exists. Please sign in.' }, { status: 409 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
