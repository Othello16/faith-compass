import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-6 text-center text-white/40 text-sm">
      <div className="flex justify-center items-center gap-2 text-xs text-white/30">
        <span>v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</span>
        <span className="text-white/15">·</span>
        <Link href="/terms" className="hover:text-white transition">Terms</Link>
        <span className="text-white/15">·</span>
        <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
      </div>
    </footer>
  )
}
