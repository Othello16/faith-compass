import Header from '@/components/Header'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-[#9CA3AF] text-sm mb-12">Last updated: March 13, 2026</p>

        <div className="space-y-8 text-[#374151] leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Faith Compass (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use the Service.
              Faith Compass is operated by Rising Jupiter in partnership with MostHighKing Ministries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">2. Description of Service</h2>
            <p>
              Faith Compass provides AI-powered Scripture reference tools, church finding services,
              Bible search with cryptographic verification, and content integrity analysis. The Service
              is a discernment aid — not a replacement for prayer, the Holy Spirit, pastoral counsel,
              or the local church.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">3. Important Disclaimer</h2>
            <p className="text-[#C9A84C]">
              Faith Compass is a technology tool that surfaces Scripture references. It does not
              provide theological authority, pastoral counseling, or spiritual direction. Always
              take what you read here to prayer and to your pastor or spiritual leader.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">4. User Accounts &amp; Authentication</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Accounts are managed through AWS Cognito with email-based authentication</li>
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be at least 13 years old to use the Service</li>
              <li>One person or entity may not maintain more than one free account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">5. Question Limits &amp; Free Tier</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Free tier: 3 questions per 24-hour rolling window, no credit card required</li>
              <li>Questions are counted across both Compass and Integrity Check features</li>
              <li>Usage records are automatically purged after 25 hours</li>
              <li>Anonymous users (no account) are tracked by IP address</li>
              <li>Subscribed users: limits based on their plan tier</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">6. Subscriptions and Payments</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Basic ($3/month): 500 questions/month, bookmarks, history</li>
              <li>Pro ($7.77/month): 1,500 questions/month, Faith Integrity Check, priority AI, PDF exports</li>
              <li>Organization: Custom pricing — contact us for details</li>
              <li>Payments are processed securely through Stripe</li>
              <li>You may cancel your subscription at any time; access continues through the billing period</li>
              <li>Refunds are handled on a case-by-case basis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">7. AI Usage Disclosure</h2>
            <p>
              Faith Compass uses OpenAI&apos;s GPT-4o model to process questions and generate Scripture-based
              responses. Your questions are sent to OpenAI for processing but are not used to train AI
              models. Bible verse verification uses SHA-256 cryptographic hashing to ensure Scripture
              accuracy independent of AI.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">8. Location Data</h2>
            <p>
              The Church Finder feature may request access to your browser&apos;s geolocation. This data
              is used only during your active session to find nearby churches and is never stored
              on our servers. You may alternatively search by zip code.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">9. Voice Feature</h2>
            <p>
              Voice search is provided as a convenience feature. Faith Compass does not guarantee accuracy
              of voice transcription. Voice queries count against your daily question limit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">10. Account Required</h2>
            <p>
              Access to the Compass AI feature and voice search requires a free account. You must be 13
              or older to create an account (COPPA).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">11. Terms Acceptance</h2>
            <p>
              By using Faith Compass, you agree to these Terms. We will notify you of material changes.
              Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">12. Acceptable Use</h2>
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
            <h2 className="text-xl font-semibold gold-text mb-3">13. Intellectual Property</h2>
            <p>
              Scripture quotations are from the King James Version (public domain).
              The Faith Compass platform, branding, and original content are the property
              of Rising Jupiter. AI-generated responses are provided for personal use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">14. Limitation of Liability</h2>
            <p>
              Faith Compass is provided &quot;as is&quot; without warranties of any kind. We are not
              liable for any spiritual, emotional, or other decisions made based on information
              provided by the Service. The Service is a reference tool — not a source of
              spiritual authority.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">15. Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the
              Service after changes constitutes acceptance of the modified terms. Material
              changes will be communicated via email or prominent notice on the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold gold-text mb-3">16. Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a href="mailto:legal@faithcompass.app" className="text-[#C9A84C] hover:text-[#E8C96E] transition">
                legal@faithcompass.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
