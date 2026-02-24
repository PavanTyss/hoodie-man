import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/format';

/**
 * POST /api/promo/validate
 * Body: { code: string, amount: number }
 * Returns { valid: boolean, discount?: number, message: string }
 */
export async function POST(request: Request) {
  try {
    const { code, amount } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Code is required' });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!promo || !promo.active) {
      return NextResponse.json({ valid: false, message: 'Invalid or inactive code' });
    }

    const now = new Date();
    if (now < promo.validFrom) {
      return NextResponse.json({ valid: false, message: 'Code not yet valid' });
    }
    if (now > promo.validUntil) {
      return NextResponse.json({ valid: false, message: 'Code has expired' });
    }

    const cartAmount = typeof amount === 'number' ? amount : 0;
    if (cartAmount < promo.minAmount) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order amount is ${formatPrice(promo.minAmount)}`,
      });
    }

    if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, message: 'Code has reached maximum uses' });
    }

    return NextResponse.json({
      valid: true,
      discount: promo.discount,
      message: `${promo.discount}% off applied`,
    });
  } catch (error) {
    console.error('Promo validate error:', error);
    return NextResponse.json({ valid: false, message: 'Validation failed' }, { status: 500 });
  }
}
