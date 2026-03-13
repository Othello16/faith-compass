import Link from 'next/link'
import Header from '@/components/Header'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: March 12, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect the following information when you use Faith Compass:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-white">Email address</strong> — collected via AWS Cognito when you create an account</li>
              <li><strong className="text-white">Question timestamps</strong> — stored in DynamoDB to enforce usage limits, automatically deleted after 25 hours</li>
              <li><strong className="text-white">Location data</strong> — used in-browser only for church finding, never stored server-side</li>
              <li><strong className="text-white">Payment information</strong> — processed securely through Stripe; we never store card details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide Scripture-based responses to your questions</li>
              <li>To find churches near your location</li>
              <li>To analyze content for Scripture alignment</li>
              <li>To manage your account and subscription</li>
              <li>To enforce free tier usage limits (3 questions per 24-hour rolling window)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. AI Usage Disclosure</h2>
            <p>
              Faith Compass uses OpenAI&apos;s GPT-4o model to process your questions and generate
              Scripture-based responses. Your questions are sent to OpenAI for processing. We do not
              use your questions to train AI models. OpenAI processes data per their own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-white">Usage records:</strong> Automatically deleted after 25 hours via DynamoDB TTL</li>
              <li><strong className="text-white">Account data:</strong> Retained until you request deletion</li>
              <li><strong className="text-white">Questions/content:</strong> Processed in real-time, not permanently stored</li>
              <li><strong className="text-white">Location data:</strong> Never stored — used only in your browser session</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Third-Party Services</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-white">OpenAI</strong> — processes questions per OpenAI privacy policy</li>
              <li><strong className="text-white">Google Places / Maps</strong> — location queries for church finding</li>
              <li><strong className="text-white">AWS (Cognito, DynamoDB)</strong> — authentication and usage tracking</li>
              <li><strong className="text-white">Stripe</strong> — secure payment processing</li>
              <li><strong className="text-white">Vercel</strong> — application hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Cookies</h2>
            <p className="mb-3">We use the following cookies:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-white">Authentication session cookies</strong> — necessary for login functionality</li>
              <li><strong className="text-white">Cookie consent preference</strong> — remembers your cookie choice</li>
            </ul>
            <p className="mt-3">We do not use advertising, tracking, or third-party marketing cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. GDPR Compliance</h2>
            <p className="mb-3">If you are in the European Economic Area, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Export your data in a portable format</li>
              <li>Object to processing of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. CCPA Compliance</h2>
            <p>
              If you are a California resident: we do not sell your personal information to third
              parties. You have the right to know what data we collect, request deletion, and
              opt out of any future sale of personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Children&apos;s Privacy (COPPA)</h2>
            <p>
              Faith Compass is intended for users aged 13 and older. We do not knowingly collect
              personal information from children under 13. If you believe a child under 13 has
              provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the new policy on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contact</h2>
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
