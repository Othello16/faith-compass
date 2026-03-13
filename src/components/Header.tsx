'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const { data: session, status } = useSession()

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl">🧭</span>
        <span className="text-xl font-bold text-[#D4AF37]">Faith Compass</span>
      </Link>
      <div className="flex gap-4 items-center">
        <Link href="/compass" className="text-sm text-white/70 hover:text-white transition">Compass</Link>
        <Link href="/churches" className="text-sm text-white/70 hover:text-white transition">Churches</Link>
        <Link href="/pricing" className="text-sm text-white/70 hover:text-white transition">Pricing</Link>
        {status === 'loading' ? (
          <span className="text-sm text-white/30">...</span>
        ) : session ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm text-white/70 hover:text-white transition"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/auth/signin"
            className="bg-[#1E40AF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
