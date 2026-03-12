import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <span className="text-xl font-bold text-[#D4AF37]">Faith Compass</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/compass" className="text-sm text-white/70 hover:text-white transition">Compass</Link>
          <Link href="/churches" className="text-sm text-white/70 hover:text-white transition">Churches</Link>
          <Link href="/pricing" className="text-sm text-white/70 hover:text-white transition">Pricing</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">About Faith Compass</h1>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
            <p>
              Faith Compass is a faith-centered AI platform that points people TO God — not away from Him.
              We leverage AI and blockchain technology to give believers and seekers a trusted, scripturally-grounded
              moral compass. We never replace prayer, the Holy Spirit, or the local church — we amplify the path
              to all three.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Our Philosophy</h2>
            <p className="text-[#D4AF37] font-semibold text-lg mb-3">Leverage it. Don&#39;t rely on it.</p>
            <p>
              Other AI apps try to replace your pastor. Some even pretend to be Jesus. Faith Compass was built
              by people who heard the warning — and decided to build the answer. We use AI the way a surgeon
              uses a scalpel: precision tool, not a replacement for wisdom.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">What We Offer</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-[#D4AF37]">&#x2022;</span>
                <span><strong className="text-white">Scripture-Anchored AI</strong> — Every answer grounded exclusively in the Word. No personal opinions. Always ends with a prayer prompt.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#D4AF37]">&#x2022;</span>
                <span><strong className="text-white">Trusted Church Finder</strong> — Find real congregations near you with service times that fit your schedule.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#D4AF37]">&#x2022;</span>
                <span><strong className="text-white">Faith Integrity Check</strong> — Cross-reference sermons, articles, and devotionals against Scripture.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Who We Are</h2>
            <p>
              Faith Compass is a Rising Jupiter initiative in partnership with MostHighKing Ministries.
              Built with faith and purpose by believers who understand both technology and theology.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
            <p>
              Have questions or feedback? Reach us at{' '}
              <a href="mailto:contact@faithcompass.app" className="text-[#1E40AF] hover:text-blue-400 transition">
                contact@faithcompass.app
              </a>
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-white/40 text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition">Terms</Link>
        </div>
        <p>&copy; 2026 Faith Compass. Built with faith and purpose.</p>
      </footer>
    </main>
  )
}
