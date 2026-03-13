'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Build callbackUrl so sign-in returns the user to where they were
  const callbackUrl = encodeURIComponent(pathname || '/compass')

  return (
    <nav className="w-full px-4 py-3 border-b border-white/10">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🧭</span>
          <span className="text-base font-bold text-[#D4AF37] leading-tight">Faith<br className="hidden sm:block" /> Compass</span>
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-3">
          <Link href="/compass" className="text-xs text-white/60 hover:text-white transition px-2 py-1">Compass</Link>
          <Link href="/topics" className="text-xs text-white/60 hover:text-white transition px-2 py-1 hidden sm:block">Topics</Link>
          <Link href="/churches" className="text-xs text-white/60 hover:text-white transition px-2 py-1 hidden sm:block">Churches</Link>
          <Link href="/pricing" className="text-xs text-white/60 hover:text-white transition px-2 py-1 hidden sm:block">Pricing</Link>

          {status === 'loading' ? (
            <div className="w-16 h-7 rounded-lg bg-white/10 animate-pulse" />
          ) : session ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-white/10 text-white/80 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/20 transition whitespace-nowrap"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href={`/auth/signin?callbackUrl=${callbackUrl}`}
              className="bg-[#1E40AF] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition whitespace-nowrap"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
