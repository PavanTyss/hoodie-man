'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { SortDropdown } from '@/components/ui/SortDropdown';

type DeliveryAddress = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
};

const emptyForm = {
  label: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  isDefault: false,
};

/**
 * Delivery addresses CRUD: list, add, edit, delete, set default.
 * Protected; uses dashboard layout.
 */
export default function AddressesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'label'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchAddresses = () => {
    const params = new URLSearchParams();
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    fetch(`/api/addresses?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setAddresses)
      .catch(() => toast.error('Failed to load addresses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status !== 'authenticated') return;
    fetchAddresses();
  }, [status, router, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps -- fetchAddresses stable; run on auth/sort

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Address added');
        resetForm();
        fetchAddresses();
      } else {
        toast.error(data.error ?? 'Failed to add address');
      }
    } catch {
      toast.error('Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/addresses/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Address updated');
        resetForm();
        fetchAddresses();
      } else {
        toast.error(data.error ?? 'Failed to update address');
      }
    } catch {
      toast.error('Failed to update address');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        toast.success('Default address updated');
        fetchAddresses();
      }
    } catch {
      toast.error('Failed to set default');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this address?')) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Address removed');
        if (editingId === id) resetForm();
        fetchAddresses();
      } else {
        toast.error('Failed to delete address');
      }
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const startEdit = (a: DeliveryAddress) => {
    setEditingId(a.id);
    setShowAddForm(false);
    setFormData({
      label: a.label,
      firstName: a.firstName,
      lastName: a.lastName,
      phone: a.phone,
      address: a.address,
      city: a.city,
      state: a.state,
      zipCode: a.zipCode,
      isDefault: a.isDefault,
    });
  };

  if (status !== 'authenticated') return null;

  const formContent = (
    <>
      <Input label="Label (e.g. Home, Office)" name="label" value={formData.label} onChange={handleChange} required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="First name" name="firstName" value={formData.firstName} onChange={handleChange} required />
        <Input label="Last name" name="lastName" value={formData.lastName} onChange={handleChange} required />
      </div>
      <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
      <Input label="Street address" name="address" value={formData.address} onChange={handleChange} required />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="City" name="city" value={formData.city} onChange={handleChange} required />
        <Input label="State" name="state" value={formData.state} onChange={handleChange} required />
        <Input label="ZIP code" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="rounded border-border"
        />
        <span className="text-sm text-foreground">Set as default address</span>
      </label>
    </>
  );

  const addressSortOptions = [
    { value: 'createdAt', label: 'Date added' },
    { value: 'label', label: 'Label' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Delivery addresses</h1>
          <p className="text-muted-foreground mt-1">
            Save addresses and choose one at checkout.
          </p>
        </div>
        {!showAddForm && !editingId && (
          <Button onClick={() => setShowAddForm(true)} className="gap-2 shrink-0">
            <Plus className="h-5 w-5" />
            Add address
          </Button>
        )}
      </div>
      <div className="mb-6">
        <SortDropdown
          options={addressSortOptions}
          value={sortBy}
          order={sortOrder}
          onChange={(by, order) => {
            setSortBy(by as 'createdAt' | 'label');
            setSortOrder(order);
          }}
          label="Sort by"
        />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="h-32 bg-muted rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {showAddForm && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">New address</h2>
              <form onSubmit={handleSubmitAdd} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                {formContent}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={saving} disabled={saving}>
                    Save address
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {editingId && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Edit address</h2>
              <form onSubmit={handleSubmitEdit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                {formContent}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={saving} disabled={saving}>
                    Update address
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {addresses.length === 0 && !showAddForm && !editingId && (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <p className="text-foreground font-medium mb-2">No saved addresses</p>
              <p className="text-muted-foreground text-sm mb-6">Add an address to use at checkout.</p>
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="h-5 w-5" />
                Add address
              </Button>
            </div>
          )}

          {addresses.length > 0 && (
            <div className="grid gap-4">
              <h2 className="text-lg font-semibold text-foreground">Saved addresses</h2>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {addr.firstName} {addr.lastName} · {addr.phone}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {addr.address}, {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {!addr.isDefault && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(addr.id)}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Set default
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(addr)}
                      className="gap-1"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(addr.id)}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
