'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function FloatingCompass() {
  const pathname = usePathname()
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  // Don't show on compass page (already there), hide until scroll
  useEffect(() => {
    if (pathname === '/compass') { setVisible(false); return }
    const handleScroll = () => setVisible(window.scrollY > 80)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  if (pathname === '/compass' || !visible) return null

  return (
    <button
      onClick={() => router.push('/compass')}
      aria-label="Ask the Compass"
      className="fixed bottom-6 right-5 z-40 flex items-center gap-2 btn-gold px-4 py-3 rounded-2xl shadow-2xl active:scale-95 transition-all group"
    >
      <span className="text-xl leading-none">🧭</span>
      <span className="text-sm font-semibold">Ask the Compass</span>
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-[#C9A84C] pointer-events-none" />
    </button>
  )
}
