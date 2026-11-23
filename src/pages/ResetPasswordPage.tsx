import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { resetPassword } from '../api/auth.api';
import { getApiErrorMessage } from '../api/axios';
import { AuthLayout } from '../components/AuthLayout';
import { Button, Field, Input } from '../components/ui';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!token) next.token = 'Missing reset token';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters';
    if (password !== confirm) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsPending(true);
    try {
      await resetPassword(token, password);
      toast.success('Password updated. You can now log in.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Reset failed'));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Enter a new password for your account.">
      {!token && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          This reset link is missing its token. Request a new one from the{' '}
          <Link to="/forgot-password" className="font-medium underline">
            forgot password
          </Link>{' '}
          page.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="New password" htmlFor="reset-password" error={errors.password} required>
          <Input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Confirm password" htmlFor="reset-confirm" error={errors.confirm} required>
          <Input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        {errors.token && <p className="text-xs text-red-600 dark:text-red-400">{errors.token}</p>}
        <Button type="submit" className="w-full" loading={isPending} disabled={!token}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
