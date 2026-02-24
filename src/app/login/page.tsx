'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Welcome back!');
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-card border border-border rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground text-center">Sign in</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Or{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                create a new account
              </Link>
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input label="Email" name="email" type="email" required placeholder="Email address" />
              <div>
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                />
                <p className="mt-1 text-right text-sm">
                  <Link href="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                </p>
              </div>
            </div>
            <Button type="submit" fullWidth loading={loading} disabled={loading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
