'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/format';

interface OrderDetail {
  id: string;
  status: string;
  total: number;
  cancellationReason?: string | null;
  trackingNumber?: string | null;
  user?: { name: string | null; email: string };
  deliveryAgent?: { id: string; name: string | null; email: string } | null;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { name: string; id: string };
  }>;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? '';
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignAgentId, setAssignAgentId] = useState('');
  const [agents, setAgents] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const id = params?.id as string;

  const loadOrder = () => {
    if (!id) return;
    fetch(`/api/admin/orders/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id || !['super_admin', 'admin', 'store_manager', 'delivery_agent'].includes(role)) return;
    loadOrder();
    // loadOrder is stable (no deps); id/role trigger refetch
  }, [id, role]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!['store_manager', 'admin', 'super_admin'].includes(role)) return;
    fetch('/api/admin/delivery-agents')
      .then((res) => (res.ok ? res.json() : []))
      .then((list: { id: string; name: string | null; email: string }[]) => {
        setAgents(list);
        if (list.length && !assignAgentId) setAssignAgentId(list[0].id);
      })
      .catch(() => setAgents([]));
    // Intentionally run only when role changes
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  const accept = () => {
    fetch(`/api/orders/${id}/accept`, { method: 'POST' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed'))))
      .then(() => {
        toast.success('Order accepted');
        loadOrder();
      })
      .catch(() => toast.error('Failed to accept'));
  };

  const assignDelivery = () => {
    if (!assignAgentId) return;
    fetch(`/api/orders/${id}/assign-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryAgentId: assignAgentId }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed'))))
      .then(() => {
        toast.success('Delivery assigned');
        loadOrder();
      })
      .catch(() => toast.error('Failed to assign'));
  };

  const setDeliveryStatus = (status: string) => {
    fetch(`/api/orders/${id}/delivery-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed'))))
      .then(() => {
        toast.success('Status updated');
        loadOrder();
      })
      .catch(() => toast.error('Failed to update'));
  };

  const approveCancel = () => {
    fetch(`/api/orders/${id}/approve-cancel`, { method: 'POST' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed'))))
      .then(() => {
        toast.success('Cancellation approved');
        loadOrder();
      })
      .catch(() => toast.error('Failed'));
  };

  const rejectCancel = () => {
    fetch(`/api/orders/${id}/reject-cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Rejected by store manager' }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed'))))
      .then(() => {
        toast.success('Cancellation rejected');
        loadOrder();
      })
      .catch(() => toast.error('Failed'));
  };

  if (!id || loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-card border border-border rounded-xl p-8">
        <p className="text-muted-foreground">Order not found.</p>
        <Link href="/admin/orders" className="mt-4 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </div>
    );
  }

  const canActOnOrder = ['store_manager', 'admin', 'super_admin'].includes(role);
  const canAccept = canActOnOrder && (order.status === 'pending' || order.status === 'processing');
  const canAssign = canActOnOrder && ['accepted', 'assigned_to_delivery', 'yet_to_deliver'].includes(order.status);
  const isMyDelivery = role === 'delivery_agent' && order.deliveryAgent?.id === session?.user?.id;
  const canUpdateDelivery = isMyDelivery && ['assigned_to_delivery', 'yet_to_deliver', 'out_for_delivery'].includes(order.status);
  const canApproveCancel = canActOnOrder && order.status === 'pending_cancellation';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground capitalize">{order.status.replace(/_/g, ' ')}</p>
            {order.cancellationReason && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Cancel reason: {order.cancellationReason}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {canAccept && <button onClick={accept} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Accept order</button>}
            {canApproveCancel && (
              <>
                <button onClick={approveCancel} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Approve cancel</button>
                <button onClick={rejectCancel} className="px-4 py-2 rounded-lg border border-border">Reject cancel</button>
              </>
            )}
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p><span className="text-muted-foreground">Customer:</span> {order.user?.name ?? order.user?.email ?? '—'}</p>
          {order.deliveryAgent && <p><span className="text-muted-foreground">Delivery agent:</span> {order.deliveryAgent.name ?? order.deliveryAgent.email}</p>}
          {order.trackingNumber && <p><span className="text-muted-foreground">Tracking:</span> <span className="font-mono text-sm">{order.trackingNumber}</span></p>}
          <p><span className="text-muted-foreground">Total:</span> {formatPrice(order.total)}</p>
          {canAssign && agents.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={assignAgentId}
                onChange={(e) => setAssignAgentId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name ?? a.email}</option>
                ))}
              </select>
              <button onClick={assignDelivery} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Assign delivery</button>
            </div>
          )}
          {canUpdateDelivery && (
            <div className="flex flex-wrap gap-2">
              {order.status !== 'yet_to_deliver' && <button onClick={() => setDeliveryStatus('yet_to_deliver')} className="px-4 py-2 rounded-lg border border-border">Mark yet to deliver</button>}
              <button onClick={() => setDeliveryStatus('out_for_delivery')} className="px-4 py-2 rounded-lg border border-border">Out for delivery</button>
              <button onClick={() => setDeliveryStatus('delivered')} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Mark delivered</button>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-border">
          <h2 className="font-semibold text-foreground mb-2">Items</h2>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>{item.product.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
