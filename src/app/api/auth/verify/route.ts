import { NextRequest, NextResponse } from 'next/server'
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
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
    const { email, code, password } = await req.json()
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code required' }, { status: 400 })
    }

    // Confirm the account
    await cognitoClient.send(new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email,
      ConfirmationCode: code.trim(),
    }))

    // Auto sign-in after verification
    if (password) {
      const authResult = await cognitoClient.send(new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID!,
        AuthParameters: { USERNAME: email, PASSWORD: password },
      }))
      const idToken = authResult.AuthenticationResult?.IdToken
      if (idToken) {
        const cookieStore = await cookies()
        cookieStore.set('fc_session', idToken, {
          httpOnly: true, secure: true, sameSite: 'strict',
          maxAge: 60 * 60 * 24, path: '/',
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed'
    if (message.includes('CodeMismatchException') || message.includes('code')) {
      return NextResponse.json({ error: 'Invalid verification code. Please try again.' }, { status: 400 })
    }
    if (message.includes('ExpiredCodeException')) {
      return NextResponse.json({ error: 'Code expired. Please sign up again.' }, { status: 400 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
