import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { forgotPassword } from '../api/auth.api';
import { getApiErrorMessage } from '../api/axios';
import { AuthLayout } from '../components/AuthLayout';
import { Button, Field, Input } from '../components/ui';
import type { ForgotPasswordResult } from '../api/auth.api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ForgotPasswordResult | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }

    setIsPending(true);
    try {
      const res = await forgotPassword(email.trim());
      setResult(res);
      toast.success('If an account exists, a reset link has been sent.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Request failed'));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your account email and we'll send you a reset link."
    >
      {result ? (
        <div className="space-y-4 text-sm text-ink-2">
          <p>{result.message ?? 'If an account exists for this email, a reset link has been sent.'}</p>
          {result.resetUrl && (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              Dev mode: your reset link is{' '}
              <a href={result.resetUrl} className="font-medium underline">
                here
              </a>
              .
            </p>
          )}
          <Link to="/login" className="inline-block font-medium text-ink hover:underline">
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email" htmlFor="forgot-email" error={error ?? undefined} required>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" loading={isPending}>
            Send reset link
          </Button>
          <p className="text-center text-sm text-ink-3">
            <Link to="/login" className="font-medium text-ink hover:underline">
              Back to log in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
