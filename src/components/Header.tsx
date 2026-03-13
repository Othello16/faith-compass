'use client'
import Link from 'next/link'

export default function Header() {
  return (
    <nav className="w-full px-4 py-3 border-b border-white/10">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🧭</span>
          <span className="text-base font-bold text-[#D4AF37] leading-tight">Faith<br className="hidden sm:block" /> Compass</span>
        </Link>

        {/* Nav — hidden on very small screens, shown as icons/short labels */}
        <div className="flex items-center gap-3">
          <Link href="/compass" className="text-xs text-white/60 hover:text-white transition px-2 py-1">Compass</Link>
          <Link href="/topics" className="text-xs text-white/60 hover:text-white transition px-2 py-1 hidden sm:block">Topics</Link>
          <Link href="/churches" className="text-xs text-white/60 hover:text-white transition px-2 py-1 hidden sm:block">Churches</Link>
          <Link href="/pricing" className="text-xs text-white/60 hover:text-white transition px-2 py-1 hidden sm:block">Pricing</Link>
          <Link
            href="/auth/signin"
            className="bg-[#1E40AF] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition whitespace-nowrap"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  )
}
