import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getApiErrorMessage } from '../api/axios';
import { resendVerification } from '../api/auth.api';
import { AuthLayout } from '../components/AuthLayout';
import { Button, Field, Input } from '../components/ui';

const RESEND_COOLDOWN_SECONDS = 30;
const OTP_LENGTH = 6;

function isTerminalVerifyError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('expired') ||
    m.includes('too many') ||
    m.includes('no pending') ||
    m.includes('not found')
  );
}

export function RegisterPage() {
  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'credentials' | 'verify'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyPending, setVerifyPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendPending, setResendPending] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'verify') otpRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleRegister(e: React.FormEvent) {
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
      setOtp('');
      setOtpError('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setStep('verify');
      toast.success('Verification code sent — check your email');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Registration failed'));
    } finally {
      setIsPending(false);
    }
  }

  async function submitOtp(code: string) {
    if (code.length !== OTP_LENGTH || verifyPending) return;
    setVerifyPending(true);
    setOtpError('');
    try {
      await verifyEmail(email.trim(), code);
      toast.success('Account verified — welcome!');
      navigate('/', { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error, 'Verification failed');
      setOtpError(message);
      toast.error(message);
      if (isTerminalVerifyError(message)) {
        setStep('credentials');
        setOtp('');
      } else {
        setOtp('');
        otpRef.current?.focus();
      }
    } finally {
      setVerifyPending(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resendPending) return;
    setResendPending(true);
    try {
      await resendVerification(email.trim());
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp('');
      setOtpError('');
      toast.success('A new code was sent — the previous one no longer works');
      otpRef.current?.focus();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not resend code'));
    } finally {
      setResendPending(false);
    }
  }

  if (step === 'verify') {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle={`We sent a 6-digit code to ${email}. Enter it below to finish creating your account.`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitOtp(otp);
          }}
          className="space-y-4"
        >
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sunken">
              <MailCheck className="h-5 w-5 text-ink-3" />
            </div>
          </div>
          <Field label="Verification code" htmlFor="reg-otp" error={otpError} required>
            <Input
              id="reg-otp"
              ref={otpRef}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              placeholder="••••••"
              className="text-center font-mono text-lg tracking-[0.5em]"
              value={otp}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
                setOtp(digits);
                if (digits.length === OTP_LENGTH) void submitOtp(digits);
              }}
            />
          </Field>
          <Button type="submit" className="w-full" loading={verifyPending} disabled={otp.length !== OTP_LENGTH}>
            Verify email
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setOtp('');
                setOtpError('');
              }}
              className="font-medium text-ink-3 hover:text-ink"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resendPending}
              className="font-medium text-ink hover:underline disabled:text-ink-4 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : resendPending ? 'Sending…' : 'Resend code'}
            </button>
          </div>
          <p className="text-center text-xs text-ink-4">
            The code expires in 10 minutes. Wrong codes count toward a 5-attempt limit.
          </p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create account" subtitle="Register to import jobs and save listings.">
      <form onSubmit={handleRegister} className="space-y-4">
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
      <p className="mt-4 text-center text-sm text-ink-3">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-ink hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
