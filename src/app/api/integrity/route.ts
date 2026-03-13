import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getSession } from '@/lib/auth'
import { checkUsageLimit, recordUsage, getUserIdFromRequest } from '@/lib/usage-limit'

const SYSTEM_PROMPT = `You are a Faith Integrity Check tool for Faith Compass. You analyze religious content (sermons, articles, devotionals) against Scripture.

For every piece of content submitted, provide:

1. **Scripture Alignment Score**: Rate as "High", "Medium", or "Low" based on how well the content aligns with Biblical teaching.

2. **Flagged Claims**: List any claims that contradict, misrepresent, or lack Scriptural support. For each flagged claim, provide:
   - The specific claim from the text
   - The relevant Scripture that addresses it
   - Whether it contradicts, is unsupported, or is taken out of context

3. **Unverified Theological Claims**: List any theological statements made without Scripture citation that should be verified.

4. **AI Content Warning**: If the content appears to be AI-generated, note this observation.

Rules:
- Be fair and charitable in analysis — flag genuine concerns, not stylistic preferences
- Always cite specific Scripture references
- This is a discernment tool, not a judgment of people
- Focus on theological accuracy, not writing quality
- Format your response clearly with headers and bullet points`

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const session = await getSession()
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip')
    const userId = getUserIdFromRequest(session as { user?: { id?: string; email?: string } } | null, ip)

    // Check usage limit
    const usage = await checkUsageLimit(userId)
    if (!usage.allowed) {
      return NextResponse.json({
        error: 'limit_reached',
        nextAvailable: usage.nextAvailable,
        used: usage.used,
        limit: usage.limit,
        remaining: 0,
      }, { status: 429 })
    }

    const { content } = await req.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content exceeds maximum length (5000 characters)' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Please analyze the following content for Scripture alignment:\n\n${content}` },
      ],
      max_tokens: 1200,
      temperature: 0.3,
    })

    // Record usage after successful call
    await recordUsage(userId)

    const analysis = completion.choices[0]?.message?.content || 'Unable to analyze content.'
    return NextResponse.json({
      analysis,
      used: usage.used + 1,
      limit: usage.limit,
      remaining: usage.remaining - 1,
      nextAvailable: usage.nextAvailable,
    })
  } catch (err) {
    console.error('Integrity API error:', err)
    return NextResponse.json({ error: 'Failed to analyze content' }, { status: 500 })
  }
}
