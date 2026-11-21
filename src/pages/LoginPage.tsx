import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { getApiErrorMessage } from '../api/axios';
import { AuthLayout } from '../components/AuthLayout';
import { Button, Field, Input } from '../components/ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsPending(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Logged in');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Login failed'));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Access your job tracker.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" htmlFor="login-email" error={errors.email} required>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="login-password" error={errors.password} required>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-neutral-500 hover:text-neutral-800">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isPending}>
          Log in
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        No account?{' '}
        <Link to="/register" className="font-medium text-neutral-900 hover:underline">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
