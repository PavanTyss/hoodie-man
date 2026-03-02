import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/require-role';
import { auditLogsQuerySchema, parseSearchParams } from '@/lib/list-query';
import { toCsv } from '@/lib/csv-export';
import type { Prisma } from '@prisma/client';

const EXPORT_LIMIT = 5000;

/** GET: list audit logs (super_admin only) with filter, sort, search. Optional ?format=csv for CSV export. */
export async function GET(request: Request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const searchParams = new URL(request.url).searchParams;
  const exportCsv = searchParams.get('format') === 'csv' || searchParams.get('export') === 'csv';
  const parsed = parseSearchParams(searchParams, auditLogsQuerySchema);
  if (!parsed.success) return parsed.error;
  const {
    action,
    entityType,
    entityId,
    from,
    to,
    actorId,
    sortBy,
    sortOrder,
    q,
  } = parsed.data;
  let { page, limit } = parsed.data;
  if (exportCsv) {
    limit = EXPORT_LIMIT;
    page = 1;
  }

  const where: Prisma.AuditLogWhereInput = {};
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (actorId) where.actorId = actorId;
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(from);
    if (to) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(to);
  }
  if (q) {
    where.OR = [
      { entityId: { contains: q, mode: 'insensitive' } },
      { actorId: { contains: q, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.AuditLogOrderByWithRelationInput =
    sortBy === 'action'
      ? { action: sortOrder }
      : sortBy === 'entityType'
        ? { entityType: sortOrder }
        : { createdAt: sortOrder };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  if (exportCsv) {
    const csvRows = logs.map((l) => ({
      id: l.id,
      createdAt: l.createdAt,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      actorId: l.actorId ?? '',
      actorEmail: l.actorEmail ?? '',
      details: l.details,
    }));
    const csv = toCsv(csvRows, [
      { key: 'id', header: 'ID' },
      { key: 'createdAt', header: 'Created At' },
      { key: 'action', header: 'Action' },
      { key: 'entityType', header: 'Entity Type' },
      { key: 'entityId', header: 'Entity ID' },
      { key: 'actorId', header: 'Actor ID' },
      { key: 'actorEmail', header: 'Actor Email' },
      { key: 'details', header: 'Details' },
    ]);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="audit-logs.csv"',
      },
    });
  }

  return NextResponse.json({
    items: logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
