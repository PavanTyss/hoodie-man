import { prisma } from '@/lib/prisma';

export type AuditAction =
  | 'role_change'
  | 'user_created'
  | 'user_deleted'
  | 'store_created'
  | 'store_deleted'
  | 'store_updated'
  | 'scopes_updated'
  | 'order_accepted'
  | 'delivery_assigned'
  | 'delivery_status_updated'
  | 'order_status_updated'
  | 'order_cancel_requested'
  | 'order_cancel_approved'
  | 'order_cancel_rejected'
  | 'payment_status_updated'
  | 'product_created'
  | 'product_deleted'
  | 'product_updated';

export interface AuditPayload {
  actorId?: string;
  actorEmail?: string;
  action: AuditAction;
  entityType: 'user' | 'store' | 'order' | 'product';
  entityId: string;
  details: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

/** Write an audit log entry. Fire-and-forget; does not throw. */
export async function writeAuditLog(payload: AuditPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: payload.actorId ?? null,
        actorEmail: payload.actorEmail ?? null,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        details: JSON.stringify(payload.details),
        ip: payload.ip ?? null,
        userAgent: payload.userAgent ?? null,
      },
    });
  } catch {
    // avoid breaking request flow
  }
}
