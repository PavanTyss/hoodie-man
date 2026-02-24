export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>

      <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
        <p className="text-sm text-muted-foreground mb-8">
          <strong>Last Updated:</strong> January 1, 2026
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing and using Hoodie Man ("we," "our," or "us"), you accept and agree to be
            bound by these Terms and Conditions. If you do not agree to these terms, please do not
            use our website or services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Use of Website</h2>
          <p className="mb-4">
            You agree to use our website only for lawful purposes. You must not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful code or viruses</li>
            <li>Attempt to gain unauthorized access</li>
            <li>Interfere with website functionality</li>
            <li>Impersonate others or provide false information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Account Registration</h2>
          <p className="mb-4">To make purchases, you must create an account. You agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your password</li>
            <li>Notify us immediately of unauthorized use</li>
            <li>Be responsible for all activities under your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Products and Pricing</h2>
          <p className="mb-4">All products are subject to availability. We reserve the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Limit quantities purchased per order</li>
            <li>Discontinue products at any time</li>
            <li>Refuse or cancel orders</li>
            <li>Correct pricing errors</li>
          </ul>
          <p className="mt-4">
            Prices are in USD and do not include applicable taxes or shipping fees, which will be
            added at checkout.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Orders and Payment</h2>
          <p>
            By placing an order, you make an offer to purchase products. We reserve the right to
            accept or decline your order. Payment is processed securely through Stripe. You agree to
            provide valid payment information and authorize us to charge your payment method for all
            purchases.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Shipping and Delivery</h2>
          <p className="mb-4">
            We ship to addresses within the United States and internationally. Delivery times are
            estimates and not guaranteed.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Risk of loss transfers upon delivery to carrier</li>
            <li>We are not responsible for shipping delays</li>
            <li>Additional customs fees may apply for international orders</li>
            <li>You are responsible for providing accurate shipping information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Returns and Refunds</h2>
          <p className="mb-4">
            Please see our{' '}
            <a href="/returns" className="text-primary hover:underline">
              Return Policy
            </a>{' '}
            for detailed information. In summary:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>30-day return window from delivery date</li>
            <li>Items must be unworn, unwashed, and in original condition</li>
            <li>Original tags must be attached</li>
            <li>Refunds processed within 5-10 business days</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">8. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, images, and software, is
            owned by Hoodie Man or its licensors and protected by copyright and trademark laws. You
            may not reproduce, distribute, or create derivative works without our written
            permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">9. User Content</h2>
          <p className="mb-4">
            By submitting reviews, photos, or other content, you grant us a non-exclusive,
            royalty-free, perpetual, worldwide license to use, reproduce, and display such content.
            You represent that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You own or have rights to the content</li>
            <li>The content does not violate any rights of others</li>
            <li>The content is not defamatory or offensive</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">10. Disclaimer of Warranties</h2>
          <p>
            OUR WEBSITE AND PRODUCTS ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
            IMPLIED. WE DO NOT WARRANT THAT THE WEBSITE WILL BE UNINTERRUPTED, ERROR-FREE, OR
            SECURE. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY AND FITNESS FOR A
            PARTICULAR PURPOSE.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">11. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, HOODIE MAN SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF OUR WEBSITE OR
            PRODUCTS. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE PRODUCT.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">12. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Hoodie Man from any claims, damages, or
            expenses arising from your violation of these Terms or your use of our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">13. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the State of New York, without regard to
            conflict of law provisions. Any disputes shall be resolved in the courts of New York
            County, New York.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">14. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be effective
            immediately upon posting. Your continued use of the website constitutes acceptance of
            the modified Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">15. Severability</h2>
          <p>
            If any provision of these Terms is found to be invalid or unenforceable, the remaining
            provisions shall remain in full force and effect.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">16. Contact Information</h2>
          <p className="mb-4">For questions about these Terms, please contact us:</p>
          <ul className="list-none space-y-2">
            <li>
              <strong>Email:</strong> legal@hoodieman.com
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
