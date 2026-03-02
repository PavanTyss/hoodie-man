'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/**
 * Profile / account settings: edit name, email, password.
 * Protected; requires auth. Uses shared dashboard layout.
 */
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status !== 'authenticated') return;

    fetch('/api/user')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setName(data.name ?? '');
          setEmail(data.email ?? '');
        }
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);

    try {
      const body: {
        name?: string;
        email?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Profile updated');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error ?? 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || !session) return null;

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-border bg-gradient-to-br from-primary/5 via-accent/5 to-transparent">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Update your name, email, and password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {/* Personal info */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">Personal information</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Your name"
            />
            <Input
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              hint="We'll use this for order updates and login."
            />
          </div>
        </section>

        {/* Password */}
        <section className="pt-6 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-muted-foreground">
              <Lock className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">Change password</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required only when setting a new password"
              showPasswordToggle
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              showPasswordToggle
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              showPasswordToggle
            />
          </div>
        </section>

        <div className="pt-2">
          <Button type="submit" loading={saving} disabled={saving} size="lg">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
