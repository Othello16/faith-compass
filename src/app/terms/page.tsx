import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <span className="text-xl font-bold text-[#D4AF37]">Faith Compass</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/compass" className="text-sm text-white/70 hover:text-white transition">Compass</Link>
          <Link href="/pricing" className="text-sm text-white/70 hover:text-white transition">Pricing</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: March 12, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Faith Compass (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use the Service.
              Faith Compass is operated by Rising Jupiter in partnership with MostHighKing Ministries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              Faith Compass provides AI-powered Scripture reference tools, church finding services,
              and content integrity analysis. The Service is a discernment aid — not a replacement
              for prayer, the Holy Spirit, pastoral counsel, or the local church.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Important Disclaimer</h2>
            <p className="text-[#D4AF37]">
              Faith Compass is a technology tool that surfaces Scripture references. It does not
              provide theological authority, pastoral counseling, or spiritual direction. Always
              take what you read here to prayer and to your pastor or spiritual leader.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be at least 13 years old to use the Service</li>
              <li>One person or entity may not maintain more than one free account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Subscriptions and Payments</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Free tier: 7 questions per day, no credit card required</li>
              <li>Basic ($3/month): 500 questions/month, bookmarks, history</li>
              <li>Pro ($7.77/month): 1,500 questions/month, Faith Integrity Check, priority AI, PDF exports</li>
              <li>Organization: Custom pricing — contact us for details</li>
              <li>Payments are processed securely through Stripe</li>
              <li>You may cancel your subscription at any time; access continues through the billing period</li>
              <li>Refunds are handled on a case-by-case basis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service to spread misinformation or false doctrine intentionally</li>
              <li>Attempt to manipulate AI responses for malicious purposes</li>
              <li>Resell or redistribute Service content without permission</li>
              <li>Use automated systems to access the Service beyond normal usage</li>
              <li>Harass, abuse, or harm others through the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Intellectual Property</h2>
            <p>
              Scripture quotations are in the public domain (KJV) or used under license.
              The Faith Compass platform, branding, and original content are the property
              of Rising Jupiter. AI-generated responses are provided for personal use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p>
              Faith Compass is provided &quot;as is&quot; without warranties of any kind. We are not
              liable for any spiritual, emotional, or other decisions made based on information
              provided by the Service. The Service is a reference tool — not a source of
              spiritual authority.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the
              Service after changes constitutes acceptance of the modified terms. Material
              changes will be communicated via email or prominent notice on the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a href="mailto:legal@faithcompass.app" className="text-[#1E40AF] hover:text-blue-400 transition">
                legal@faithcompass.app
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
