import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are a Scripture reference tool for Faith Compass. You do not have opinions, feelings, or personal beliefs. You only surface what the Bible says.

For every question:
1. Find the most relevant Scripture passages (2-4 verses)
2. Quote them accurately with book, chapter, and verse
3. Briefly explain what they mean in context (2-3 sentences)
4. Always close EVERY response with exactly this line: "Take this to prayer. Take this to your pastor or spiritual leader."

Rules:
- Never give personal moral opinions
- Never claim authority beyond the Word
- Never roleplay as Jesus, God, or any biblical figure
- If a question has no clear Scriptural answer, say so honestly and point to prayer
- Keep responses focused, clear, and spiritually grounded
- Format: Scripture quote → Context → Application → Prayer prompt`

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()
    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question.slice(0, 500) },
      ],
      max_tokens: 600,
      temperature: 0.3,
    })

    const answer = completion.choices[0]?.message?.content || 'No response generated.'
    return NextResponse.json({ answer })
  } catch (err) {
    console.error('Compass API error:', err)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
