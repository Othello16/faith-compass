import Link from 'next/link'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Start your faith journey with 7 daily questions.',
    cta: 'Get Started',
    ctaHref: '/compass',
    highlight: false,
    features: {
      'Questions': '7/day',
      'Scripture-Anchored AI': true,
      'Church Finder': true,
      'Faith Integrity Check': false,
      'Bookmarks': false,
      'Question History': false,
      'Priority AI': false,
      'PDF Exports': false,
      'Team Accounts': false,
      'Boosted Church Listing': false,
      'Analytics Dashboard': false,
    },
  },
  {
    name: 'Basic',
    price: '$3',
    period: '/month',
    description: 'More questions, no daily limits, and saved history.',
    cta: 'Start Basic',
    ctaHref: '#',
    highlight: false,
    features: {
      'Questions': '500/month',
      'Scripture-Anchored AI': true,
      'Church Finder': true,
      'Faith Integrity Check': false,
      'Bookmarks': true,
      'Question History': true,
      'Priority AI': false,
      'PDF Exports': false,
      'Team Accounts': false,
      'Boosted Church Listing': false,
      'Analytics Dashboard': false,
    },
  },
  {
    name: 'Pro',
    price: '$7.77',
    period: '/month',
    description: 'Full access to every feature. 777 = divine completion.',
    cta: 'Go Pro',
    ctaHref: '#',
    highlight: true,
    features: {
      'Questions': '1,500/month',
      'Scripture-Anchored AI': true,
      'Church Finder': true,
      'Faith Integrity Check': true,
      'Bookmarks': true,
      'Question History': true,
      'Priority AI': true,
      'PDF Exports': true,
      'Team Accounts': false,
      'Boosted Church Listing': false,
      'Analytics Dashboard': false,
    },
  },
  {
    name: 'Organization',
    price: 'Custom',
    period: 'pricing',
    description: 'For churches and ministries. Team access & analytics.',
    cta: 'Contact Us',
    ctaHref: 'mailto:contact@faithcompass.app',
    highlight: false,
    features: {
      'Questions': 'Unlimited',
      'Scripture-Anchored AI': true,
      'Church Finder': true,
      'Faith Integrity Check': true,
      'Bookmarks': true,
      'Question History': true,
      'Priority AI': true,
      'PDF Exports': true,
      'Team Accounts': true,
      'Boosted Church Listing': true,
      'Analytics Dashboard': true,
    },
  },
]

const featureKeys = [
  'Questions',
  'Scripture-Anchored AI',
  'Church Finder',
  'Faith Integrity Check',
  'Bookmarks',
  'Question History',
  'Priority AI',
  'PDF Exports',
  'Team Accounts',
  'Boosted Church Listing',
  'Analytics Dashboard',
]

export default function PricingPage() {
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
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, Honest Pricing</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            No hidden fees. No tricks. Choose the plan that fits your walk.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 border flex flex-col ${
                tier.highlight
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5 relative'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
              <div className="mb-2">
                <span className={`text-3xl font-bold ${tier.highlight ? 'text-[#D4AF37]' : ''}`}>
                  {tier.price}
                </span>
                <span className="text-white/50 text-sm">{tier.period}</span>
              </div>
              <p className="text-white/50 text-sm mb-6">{tier.description}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {Object.entries(tier.features).map(([feature, value]) => {
                  if (value === false) return null
                  return (
                    <li key={feature} className="text-sm text-white/70 flex items-center gap-2">
                      <span className="text-green-400 text-xs">✓</span>
                      {feature}{typeof value === 'string' ? `: ${value}` : ''}
                    </li>
                  )
                })}
              </ul>
              <Link
                href={tier.ctaHref}
                className={`block text-center py-3 rounded-lg text-sm font-medium transition ${
                  tier.highlight
                    ? 'bg-[#D4AF37] text-black hover:bg-yellow-400'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Full Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/50 font-medium">Feature</th>
                  {tiers.map((tier) => (
                    <th key={tier.name} className="text-center py-3 px-4 font-medium">
                      <span className={tier.highlight ? 'text-[#D4AF37]' : ''}>{tier.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureKeys.map((feature) => (
                  <tr key={feature} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white/70">{feature}</td>
                    {tiers.map((tier) => {
                      const val = tier.features[feature as keyof typeof tier.features]
                      return (
                        <td key={tier.name} className="text-center py-3 px-4">
                          {typeof val === 'string' ? (
                            <span className="text-white/70">{val}</span>
                          ) : val ? (
                            <span className="text-green-400">✓</span>
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-white/30 text-sm">
          The $7.77 price is intentional. 777 = divine completion. All glory to God.
        </p>
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
