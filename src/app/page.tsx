import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <span className="text-xl font-bold text-[#D4AF37]">Faith Compass</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/compass" className="text-sm text-white/70 hover:text-white transition">Compass</Link>
          <Link href="/churches" className="text-sm text-white/70 hover:text-white transition">Churches</Link>
          <Link href="/pricing" className="text-sm text-white/70 hover:text-white transition">Pricing</Link>
          <Link href="/compass" className="bg-[#1E40AF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 py-24">
        <div className="inline-block bg-[#D4AF37]/10 text-[#D4AF37] text-sm px-4 py-1 rounded-full mb-6 border border-[#D4AF37]/30">
          7 Free Questions Daily • No Credit Card Required
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Your Faith.<br />
          <span className="text-[#1E40AF]">Guided.</span> Not Replaced.
        </h1>
        <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
          AI-powered moral guidance anchored exclusively in Scripture. 
          Find answers, verify truth, connect with real churches nearby. 
          Leverage technology to walk closer with God — not away from Him.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/compass" className="bg-[#1E40AF] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition">
            Ask Your First Question →
          </Link>
          <Link href="/about" className="border border-white/20 text-white px-8 py-4 rounded-xl text-lg font-medium hover:border-white/40 transition">
            Learn More
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        {[
          {
            icon: '📖',
            title: 'Scripture-Anchored AI',
            desc: 'Every answer grounded in the Word. AI surfaces what the Bible says — not what it thinks. Always ends with: "Take this to prayer. Take this to your pastor."',
          },
          {
            icon: '⛪',
            title: 'Trusted Church Finder',
            desc: 'Locate verified congregations near you with service times that fit your schedule. Real churches. Real community. Real accountability.',
          },
          {
            icon: '🔍',
            title: 'Faith Integrity Check',
            desc: 'Paste any sermon, article, or devotional. AI cross-references it with Scripture and flags contradictions, missing citations, or AI-generated content.',
          },
        ].map((f) => (
          <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#1E40AF]/50 transition">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">{f.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* The difference */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Built Different. On Purpose.</h2>
        <p className="text-white/70 leading-relaxed mb-8">
          Other AI apps try to replace your pastor. Some even pretend to be Jesus. 
          Faith Compass was built by people who heard the warning — and decided to build the answer. 
          We use AI the way a surgeon uses a scalpel: precision tool, not a replacement for wisdom.
        </p>
        <div className="grid grid-cols-2 gap-4 text-left">
          {[
            ['❌ AI posing as God', '✅ AI pointing to God'],
            ['❌ Fake faith content', '✅ Scripture-verified answers'],
            ['❌ Emotional AI dependency', '✅ Connection to real churches'],
            ['❌ Hidden agendas', '✅ Transparent, blockchain-verified Word'],
          ].map(([bad, good]) => (
            <div key={good} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-red-400 text-sm mb-1">{bad}</p>
              <p className="text-green-400 text-sm font-medium">{good}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Honest Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Free', price: '$0', period: 'forever', features: ['7 questions/day', 'Scripture lookup', 'Church finder', 'No credit card'], cta: 'Get Started', highlight: false },
            { name: 'Basic', price: '$3', period: '/month', features: ['500 questions/month', 'No daily cap', 'Bookmarks', 'Question history'], cta: 'Start Basic', highlight: false },
            { name: 'Pro', price: '$7.77', period: '/month', features: ['1,500 questions/month', 'Faith Integrity Check', 'Priority AI', 'PDF exports'], cta: 'Go Pro', highlight: true },
          ].map((tier) => (
            <div key={tier.name} className={`rounded-2xl p-6 border ${tier.highlight ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/10 bg-white/5'}`}>
              <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-white/50 text-sm">{tier.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="text-sm text-white/70 flex items-center gap-2">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/compass" className={`block text-center py-2 rounded-lg text-sm font-medium transition ${tier.highlight ? 'bg-[#D4AF37] text-black hover:bg-yellow-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-white/40 text-sm mt-6">
          The $7.77 price is intentional. 777 = divine completion. ♃
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-white/40 text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition">Terms</Link>
        </div>
        <p>© 2026 Faith Compass. Built with faith and purpose.</p>
        <p className="mt-1 text-xs">A Rising Jupiter Initiative • MostHighKing Ministries</p>
      </footer>
    </main>
  )
}
