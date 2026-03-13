import { NextRequest, NextResponse } from 'next/server'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { cookies } from 'next/headers'

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

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    })

    const result = await cognitoClient.send(command)
    const idToken = result.AuthenticationResult?.IdToken
    const accessToken = result.AuthenticationResult?.AccessToken

    if (!idToken) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('fc_session', idToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return NextResponse.json({ success: true, accessToken })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sign in failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
