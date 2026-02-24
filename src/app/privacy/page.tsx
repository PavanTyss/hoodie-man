export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
        <p className="text-sm text-muted-foreground mb-8">
          <strong>Effective Date:</strong> January 1, 2026
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name, email address, and contact information</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely through Stripe)</li>
            <li>Account credentials</li>
            <li>Purchase history and preferences</li>
            <li>Communications with customer service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Respond to your questions and provide customer support</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our products and services</li>
            <li>Prevent fraud and enhance security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Information Sharing</h2>
          <p className="mb-4">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Service Providers:</strong> Payment processors, shipping carriers, and email
              service providers
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with mergers or acquisitions
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to protect our rights
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Cookies and Tracking</h2>
          <p className="mb-4">We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Remember your preferences and shopping cart</li>
            <li>Analyze site traffic and usage patterns</li>
            <li>Provide personalized content and advertisements</li>
            <li>Improve website functionality</li>
          </ul>
          <p className="mt-4">
            You can control cookies through your browser settings. Note that disabling cookies may
            affect website functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal
            information. However, no method of transmission over the internet is 100% secure. We
            cannot guarantee absolute security but strive to use commercially acceptable means to
            protect your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access and receive a copy of your personal data</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Withdraw consent for marketing communications</li>
            <li>Data portability</li>
          </ul>
          <p className="mt-4">To exercise these rights, contact us at privacy@hoodieman.com</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Children's Privacy</h2>
          <p>
            Our services are not directed to children under 13. We do not knowingly collect personal
            information from children under 13. If you become aware that a child has provided us
            with personal information, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">8. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your
            country of residence. We ensure appropriate safeguards are in place to protect your
            data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">9. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party sites. We are not responsible for the
            privacy practices of these sites. We encourage you to review their privacy policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new policy on this page and updating the effective date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">11. Contact Us</h2>
          <p className="mb-4">
            If you have questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-none space-y-2">
            <li>
              <strong>Email:</strong> privacy@hoodieman.com
            </li>
            <li>
              <strong>Address:</strong> 123 Fashion Street, New York, NY 10001
            </li>
            <li>
              <strong>Phone:</strong> +1 (555) 123-4567
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
