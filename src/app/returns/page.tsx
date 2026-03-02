export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-foreground mb-8">Return & Refund Policy</h1>

      <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
        <p className="text-sm text-muted-foreground mb-8">
          <strong>Effective Date:</strong> January 1, 2026
        </p>

        <div className="bg-primary/10 border-l-4 border-primary p-6 mb-8">
          <h3 className="text-xl font-bold text-foreground mb-2">Our Promise</h3>
          <p className="text-muted-foreground">
            We want you to love your purchase! If you&apos;re not completely satisfied, we offer a
            hassle-free 30-day return policy for most items.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Return Window</h2>
          <p>
            You have <strong>30 days</strong> from the date of delivery to return most items for a
            full refund or exchange. After 30 days, we cannot offer refunds or exchanges.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Eligibility Requirements</h2>
          <p className="mb-4">
            To be eligible for a return, items must meet ALL of the following conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Unworn and Unwashed:</strong> Items must not have been worn or washed
            </li>
            <li>
              <strong>Original Condition:</strong> In the same condition as received
            </li>
            <li>
              <strong>Tags Attached:</strong> All original tags must still be attached
            </li>
            <li>
              <strong>Original Packaging:</strong> Returned in original packaging when possible
            </li>
            <li>
              <strong>Proof of Purchase:</strong> Receipt or order confirmation required
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Non-Returnable Items</h2>
          <p className="mb-4">The following items cannot be returned:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Underwear and intimate apparel</li>
            <li>Earrings and pierced jewelry</li>
            <li>Final sale items (marked as &quot;Final Sale&quot;)</li>
            <li>Gift cards</li>
            <li>Customized or personalized items</li>
            <li>Items marked as &quot;non-returnable&quot;</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">How to Return</h2>

          <div className="bg-muted/30 p-6 rounded-lg mb-4">
            <h3 className="text-xl font-semibold text-foreground mb-4">Step 1: Request a Return</h3>
            <p className="mb-2">Contact us to initiate your return:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email: returns@hoodieman.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Or log into your account and visit the Orders page</li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Include your order number and reason for return
            </p>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg mb-4">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Step 2: Receive Return Authorization
            </h3>
            <p>
              We&apos;ll send you a Return Authorization (RA) number and return shipping label within 24
              hours. Please do not ship items without an RA number.
            </p>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg mb-4">
            <h3 className="text-xl font-semibold text-foreground mb-4">Step 3: Pack Your Return</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ensure all tags are still attached</li>
              <li>Place items in original packaging if available</li>
              <li>Include the RA number inside the package</li>
              <li>Attach the return label to the outside</li>
            </ul>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-foreground mb-4">Step 4: Ship Your Return</h3>
            <p>
              Drop off your package at any authorized carrier location. Keep your tracking number
              for your records.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Return Shipping Costs</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Defective Items:</strong> We cover return shipping costs
            </li>
            <li>
              <strong>Wrong Item Sent:</strong> We cover return shipping costs
            </li>
            <li>
              <strong>Change of Mind:</strong> Customer responsible for return shipping (₹500
              deducted from refund)
            </li>
            <li>
              <strong>Free Returns:</strong> Available on orders over ₹1000
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Refund Process</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Processing Time</h3>
              <p>
                Once we receive your return, we&apos;ll inspect it and process your refund within{' '}
                <strong>5-10 business days</strong>.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Refund Method</h3>
              <p>
                Refunds are issued to the original payment method. Please allow 5-10 business days
                for the refund to appear in your account, depending on your bank or credit card
                company.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Partial Refunds</h3>
              <p className="mb-2">Partial refunds may be granted for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Items showing obvious signs of use</li>
                <li>Items missing tags</li>
                <li>Items returned after 30 days but within 60 days</li>
                <li>Items not in original condition or damaged</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Exchanges</h2>
          <p className="mb-4">
            We offer exchanges for different sizes or colors of the same item, subject to
            availability.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact us to arrange an exchange</li>
            <li>We&apos;ll send the new item once we receive your return</li>
            <li>No additional shipping charges for exchanges on defective items</li>
            <li>Size/color exchanges subject to ₹500 shipping fee</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Defective or Damaged Items</h2>
          <p className="mb-4">If you receive a defective or damaged item:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Contact us immediately with photos of the defect/damage</li>
            <li>We&apos;ll send a replacement or provide a full refund</li>
            <li>We cover all return shipping costs</li>
            <li>No need to return the item if it&apos;s defective (we&apos;ll advise)</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Wrong Item Received</h2>
          <p>
            If we sent you the wrong item, we&apos;ll make it right! Contact us and we&apos;ll send the
            correct item at no additional charge and provide a prepaid return label for the wrong
            item.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">International Returns</h2>
          <p className="mb-4">For international orders:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Customer responsible for return shipping costs</li>
            <li>Items must be returned within 30 days</li>
            <li>Customs fees are non-refundable</li>
            <li>Mark package as &quot;Returned Goods&quot; to avoid additional fees</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Sale and Clearance Items</h2>
          <p>
            Items purchased during sales or from our clearance section can be returned within 30
            days unless marked as &quot;Final Sale.&quot; All eligibility requirements still apply.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Gift Returns</h2>
          <p className="mb-4">
            Items purchased as gifts can be returned for store credit by the recipient.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Gift receipt required</li>
            <li>Store credit issued in the amount of the purchase</li>
            <li>Same 30-day return window applies</li>
            <li>All eligibility requirements must be met</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
          <p className="mb-4">Questions about returns? We&apos;re here to help!</p>
          <ul className="list-none space-y-2">
            <li>
              <strong>Email:</strong> returns@hoodieman.com
            </li>
            <li>
              <strong>Phone:</strong> +1 (555) 123-4567
            </li>
            <li>
              <strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM EST
            </li>
          </ul>
        </section>

        <div className="bg-green-50 border-l-4 border-green-600 p-6 mt-8">
          <h3 className="text-xl font-bold text-foreground mb-2">Satisfaction Guaranteed</h3>
          <p className="text-muted-foreground">
            Your satisfaction is our priority. If you have any issues with your order, please reach
            out to us. We&apos;re committed to making it right!
          </p>
        </div>
      </div>
    </div>
  );
}
