import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/addresses/[id] - Get a single delivery address. Auth required; must own the address.
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const address = await prisma.deliveryAddress.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error('Address fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch address' }, { status: 500 });
  }
}

/**
 * PATCH /api/addresses/[id] - Update a delivery address. Auth required; must own the address.
 * Body: { label?, firstName?, lastName?, phone?, address?, city?, state?, zipCode?, isDefault? }
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.deliveryAddress.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      label,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      zipCode,
      isDefault,
    } = body;

    const updates: Record<string, unknown> = {};
    if (label !== undefined) updates.label = String(label).trim();
    if (firstName !== undefined) updates.firstName = String(firstName).trim();
    if (lastName !== undefined) updates.lastName = String(lastName).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (address !== undefined) updates.address = String(address).trim();
    if (city !== undefined) updates.city = String(city).trim();
    if (state !== undefined) updates.state = String(state).trim();
    if (zipCode !== undefined) updates.zipCode = String(zipCode).trim();
    if (isDefault !== undefined) {
      updates.isDefault = Boolean(isDefault);
      if (updates.isDefault) {
        await prisma.deliveryAddress.updateMany({
          where: { userId: session.user.id, id: { not: id } },
          data: { isDefault: false },
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existing);
    }

    const updated = await prisma.deliveryAddress.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Address update error:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

/**
 * DELETE /api/addresses/[id] - Delete a delivery address. Auth required; must own the address.
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.deliveryAddress.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await prisma.deliveryAddress.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Address delete error:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
