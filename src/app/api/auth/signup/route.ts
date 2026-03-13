import { NextRequest, NextResponse } from 'next/server'
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
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
    const { email, password, marketingOptIn } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    await cognitoClient.send(new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'custom:marketing_opt_in', Value: marketingOptIn ? 'true' : 'false' },
      ],
    }))

    // Return pending — user must verify email
    return NextResponse.json({ success: true, needsVerification: true, email })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sign up failed'
    if (message.includes('UsernameExistsException') || message.includes('already exists')) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in.', code: 'USER_EXISTS' }, { status: 409 })
    }
    if (message.includes('InvalidPasswordException') || message.includes('password')) {
      return NextResponse.json({ error: 'Password must be 8+ characters with uppercase, lowercase, and a number.' }, { status: 400 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
