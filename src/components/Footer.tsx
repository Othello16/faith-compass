import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[#C9A84C]/30 px-6 py-6 text-center text-sm">
      <div className="flex justify-center items-center gap-2 text-xs text-[#C9A84C]/40">
        <span>v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</span>
        <span className="text-[#C9A84C]/20">·</span>
        <Link href="/terms" className="text-white/50 hover:text-white transition">Terms</Link>
        <span className="text-[#C9A84C]/20">·</span>
        <Link href="/privacy" className="text-white/50 hover:text-white transition">Privacy</Link>
      </div>
      <p className="text-white/30 text-xs mt-2">&copy; 2026 Faith Compass. Built with faith and purpose.</p>
    </footer>
  )
}
