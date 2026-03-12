import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: March 12, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect information you provide directly when using Faith Compass:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account information (email, name) when you sign up</li>
              <li>Questions submitted to the AI Compass feature</li>
              <li>Content submitted to the Faith Integrity Check</li>
              <li>Location data (zip code) when using the Church Finder</li>
              <li>Payment information processed securely through Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide Scripture-based responses to your questions</li>
              <li>To find churches near your location</li>
              <li>To analyze content for Scripture alignment</li>
              <li>To manage your account and subscription</li>
              <li>To improve our services and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. Payment processing
              is handled entirely by Stripe — we never store your credit card information on our servers.
              Your questions and content submissions are processed in real-time and are not used to train
              AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-white">OpenAI</strong> — to process Scripture-based AI responses</li>
              <li><strong className="text-white">Google Places API</strong> — to find churches near you</li>
              <li><strong className="text-white">Stripe</strong> — for secure payment processing</li>
              <li><strong className="text-white">Google Analytics</strong> — for anonymous usage analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Export your question history</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. Analytics cookies
              are used to understand usage patterns and improve the service. You can control cookie
              preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Children&#39;s Privacy</h2>
            <p>
              Faith Compass is not intended for children under 13. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the new policy on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
            <p>
              For privacy-related inquiries, contact us at{' '}
              <a href="mailto:privacy@faithcompass.app" className="text-[#1E40AF] hover:text-blue-400 transition">
                privacy@faithcompass.app
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
