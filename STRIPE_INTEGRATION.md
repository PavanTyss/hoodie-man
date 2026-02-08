# Stripe Payment Integration Guide

This guide will help you integrate Stripe payment processing into your Hoodie Man e-commerce store.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Access to your Stripe Dashboard
- Basic understanding of webhooks

## Installation

Stripe dependencies are already included in your package.json:
```bash
npm install stripe @stripe/stripe-js
```

## Step 1: Get Your Stripe Keys

### Development (Test Mode)
1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API keys**
3. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Add to Environment Variables
```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
STRIPE_SECRET_KEY="sk_test_your_key_here"
```

## Step 2: Create Stripe Instance

Create `src/lib/stripe.ts`:

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});
```

Create `src/lib/stripe-client.ts`:

```typescript
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
```

## Step 3: Create Payment Intent API

Create `src/app/api/create-payment-intent/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount, currency = 'usd', orderId } = await request.json();

    // Validate amount
    if (!amount || amount < 50) { // Minimum $0.50
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId,
        userId: session.user.id || session.user.email!,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## Step 4: Update Checkout Page

Update `src/app/checkout/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe-client';
import { useCart } from '@/context/CartContext';
import CheckoutForm from '@/components/CheckoutForm';

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const total = getCartTotal();

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }

    // Create payment intent
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: total,
        currency: 'usd',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, [cartItems, total, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#9333ea',
              },
            },
          }}
        >
          <CheckoutForm
            clientSecret={clientSecret}
            amount={total}
            onSuccess={() => {
              clearCart();
              router.push('/dashboard?payment=success');
            }}
          />
        </Elements>
      )}
    </div>
  );
}
```

## Step 5: Create Checkout Form Component

Create `src/components/CheckoutForm.tsx`:

```typescript
'use client';

import { useState, FormEvent } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
}

export default function CheckoutForm({
  clientSecret,
  amount,
  onSuccess,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?payment=success`,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
    } else {
      // Payment successful
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
        
        <div className="mb-6">
          <div className="text-2xl font-bold text-purple-600">
            ${amount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">Total Amount</div>
        </div>

        <PaymentElement />

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || processing}
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>🔒 Secure payment powered by Stripe</p>
      </div>
    </form>
  );
}
```

## Step 6: Set Up Webhooks

Webhooks allow Stripe to notify your application about payment events.

### Development (Testing)

Install Stripe CLI:
```bash
# Windows (with Scoop)
scoop install stripe

# Mac
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Forward webhooks to local development:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret that appears (starts with `whsec_`):
```env
STRIPE_WEBHOOK_SECRET="whsec_your_secret_here"
```

### Create Webhook Handler

Create `src/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { orderId, userId } = paymentIntent.metadata;

  if (orderId) {
    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentId: paymentIntent.id,
      },
    });

    console.log(`✅ Payment successful for order: ${orderId}`);

    // TODO: Send confirmation email
    // TODO: Update inventory
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { orderId } = paymentIntent.metadata;

  if (orderId) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'FAILED',
      },
    });

    console.log(`❌ Payment failed for order: ${orderId}`);

    // TODO: Send failure notification email
  }
}
```

### Production Webhooks

1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded` (optional)
5. Copy the signing secret
6. Add to production environment variables

## Step 7: Update Order Creation

Update `src/app/api/orders/route.ts` to create order before payment:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shippingAddress, total } = await request.json();

    // Create order
    const order = await prisma.order.create({
      data: {
        user: {
          connect: { email: session.user.email },
        },
        total,
        status: 'PENDING',
        shippingAddress: JSON.stringify(shippingAddress),
        items: {
          create: items.map((item: any) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

## Test Payment Flow

### Test Card Numbers
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155

Use any:
- Future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any ZIP code
```

### Testing Checklist
- [ ] Add items to cart
- [ ] Proceed to checkout
- [ ] Payment form loads
- [ ] Submit payment with test card
- [ ] Payment succeeds
- [ ] Order status updates
- [ ] Webhook received
- [ ] Cart clears
- [ ] Redirect to success page

## Production Launch

### Switch to Live Mode
1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Get new API keys from **Developers → API keys**
3. Update environment variables:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
   STRIPE_SECRET_KEY="sk_live_..."
   ```
4. Update webhook endpoint to production URL
5. Get new webhook secret
6. Update `STRIPE_WEBHOOK_SECRET`

### Security Checklist
- [ ] Never expose secret key in client code
- [ ] Validate amounts server-side
- [ ] Verify webhook signatures
- [ ] Use HTTPS in production
- [ ] Log payment events
- [ ] Handle errors gracefully
- [ ] Test refund process

## Common Issues

### "No such payment_intent"
- Check your API keys match (test/live)
- Ensure clientSecret is being passed correctly

### Webhook signature verification failed
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check webhook endpoint URL is correct
- Ensure request body is raw (not parsed)

### Payment succeeds but order not updated
- Check webhook is reaching your endpoint
- Verify webhook handler is processing events
- Check database for order updates
- Review server logs for errors

## Additional Features

### Refunds
```typescript
const refund = await stripe.refunds.create({
  payment_intent: 'pi_xxx',
  amount: 1000, // cents
});
```

### Customer Management
```typescript
const customer = await stripe.customers.create({
  email: user.email,
  metadata: { userId: user.id },
});
```

### Subscriptions (Future)
For recurring billing, see: https://stripe.com/docs/billing/subscriptions

## Resources

- [Stripe Docs](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Test Cards](https://stripe.com/docs/testing)
- [Webhook Events](https://stripe.com/docs/api/events/types)
- [Security Best Practices](https://stripe.com/docs/security)

## Support

- Stripe Support: support@stripe.com
- Stripe Discord: https://stripe.com/discord
- Documentation: https://stripe.com/docs

---

**Last Updated:** January 2024
