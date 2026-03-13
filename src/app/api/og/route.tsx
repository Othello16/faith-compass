import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const verse = searchParams.get('verse') || 'John 3:16'
  const text = searchParams.get('text') || 'For God so loved the world...'
  const truncated = text.length > 200 ? text.slice(0, 197) + '...' : text

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #080808 0%, #111111 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'serif',
        }}
      >
        {/* Top badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '36px' }}>🧭</span>
          <span style={{ color: '#C9A84C', fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px' }}>
            FAITH COMPASS
          </span>
        </div>

        {/* Verse */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
          <div
            style={{
              color: '#C9A84C',
              fontSize: '28px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            {verse}
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '32px',
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}
          >
            &ldquo;{truncated}&rdquo;
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>
            faithcompass.app
          </div>
          <div
            style={{
              background: '#C9A84C',
              color: 'black',
              padding: '12px 28px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            Ask the Compass →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
