import OpenAI from 'openai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const ALLOWED_VOICES = ['onyx', 'echo', 'fable', 'nova', 'shimmer', 'alloy']

export async function POST(req: NextRequest) {
  const { text, voice = 'onyx' } = await req.json()
  if (!text || typeof text !== 'string') return new Response('Missing text', { status: 400 })
  if (!ALLOWED_VOICES.includes(voice)) return new Response('Invalid voice', { status: 400 })

  // Trim to 4000 chars max to control cost
  const trimmed = text.slice(0, 4000)

  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: voice as 'onyx' | 'echo' | 'fable' | 'nova' | 'shimmer' | 'alloy',
    input: trimmed,
  })

  const buffer = Buffer.from(await mp3.arrayBuffer())

  return new Response(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
