'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import FaithIcon from '@/components/FaithIcon'

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Build callbackUrl so sign-in returns the user to where they were
  const callbackUrl = encodeURIComponent(pathname || '/compass')

  return (
    <nav className="w-full px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <FaithIcon size={30} />
          <span className="text-base font-bold text-[#0A0A0A]">Faith</span>
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-3">
          <Link href="/compass" className="text-xs text-[#374151] hover:text-[#0A0A0A] transition px-2 py-1">Compass</Link>
          <Link href="/topics" className="text-xs text-[#374151] hover:text-[#0A0A0A] transition px-2 py-1 hidden sm:block">Topics</Link>
          <Link href="/churches" className="text-xs text-[#374151] hover:text-[#0A0A0A] transition px-2 py-1 hidden sm:block">Churches</Link>
          <Link href="/pricing" className="text-xs text-[#374151] hover:text-[#0A0A0A] transition px-2 py-1 hidden sm:block">Pricing</Link>

          {status === 'loading' ? (
            <div className="w-16 h-7 rounded-lg bg-gray-100 animate-pulse" />
          ) : session ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-gray-100 text-[#374151] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition whitespace-nowrap"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href={`/auth/signin?callbackUrl=${callbackUrl}`}
              className="bg-[#080808] text-white border border-[#C9A84C]/40 px-3 py-1.5 rounded-lg text-xs font-medium hover:shadow-[0_0_12px_rgba(201,168,76,0.3)] transition whitespace-nowrap"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
