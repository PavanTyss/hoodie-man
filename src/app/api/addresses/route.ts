import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addressesQuerySchema, parseSearchParams } from '@/lib/list-query';
import type { Prisma } from '@prisma/client';

/**
 * GET /api/addresses - List all delivery addresses for the current user. Auth required.
 * Query: sortBy (createdAt | label), sortOrder, q (optional search).
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = parseSearchParams(
      new URL(request.url).searchParams,
      addressesQuerySchema
    );
    if (!parsed.success) return parsed.error;
    const { sortBy, sortOrder, q } = parsed.data;

    const where: Prisma.DeliveryAddressWhereInput = {
      userId: session.user.id,
    };
    if (q) {
      where.OR = [
        { label: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.DeliveryAddressOrderByWithRelationInput[] = [
      { isDefault: 'desc' },
      sortBy === 'label'
        ? { label: sortOrder }
        : { createdAt: sortOrder },
    ];

    const addresses = await prisma.deliveryAddress.findMany({
      where,
      orderBy,
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Addresses list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/addresses - Create a new delivery address. Auth required.
 * Body: { label, firstName, lastName, phone, address, city, state, zipCode, isDefault? }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      isDefault = false,
    } = body;

    const required = ['label', 'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (body[field] == null || String(body[field]).trim() === '') {
        return NextResponse.json({ error: `Missing or empty field: ${field}` }, { status: 400 });
      }
    }

    if (isDefault) {
      await prisma.deliveryAddress.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const created = await prisma.deliveryAddress.create({
      data: {
        userId: session.user.id,
        label: String(label).trim(),
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        phone: String(phone).trim(),
        address: String(address).trim(),
        city: String(city).trim(),
        state: String(state).trim(),
        zipCode: String(zipCode).trim(),
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('Address create error:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
