import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { getApiErrorMessage } from '../api/axios';
import { AuthLayout } from '../components/AuthLayout';
import { Button, Field, Input } from '../components/ui';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters';
    if (password !== confirm) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsPending(true);
    try {
      await register({ email: email.trim(), password });
      toast.success('Account created');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Registration failed'));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Register to import jobs and save listings.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" htmlFor="reg-email" error={errors.email} required>
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="reg-password" error={errors.password} required hint="At least 8 characters">
          <Input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Confirm password" htmlFor="reg-confirm" error={errors.confirm} required>
          <Input
            id="reg-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" loading={isPending}>
          Register
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-neutral-900 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
