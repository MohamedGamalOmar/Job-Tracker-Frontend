import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import type { JobSource, WorkplaceType } from '../types';
import { sourceLabels, workplaceLabels } from '../lib/format';

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'purple';
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    purple: 'bg-violet-50 text-violet-700 ring-violet-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const sourceTones: Record<JobSource, 'blue' | 'green' | 'amber' | 'purple' | 'neutral'> = {
  wuzzuf: 'blue',
  linkedin: 'blue',
  glassdoor: 'green',
  indeed: 'amber',
  manual: 'neutral',
};

export function SourceBadge({ source }: { source: string }) {
  const key = source as JobSource;
  return <Badge tone={sourceTones[key] ?? 'neutral'}>{sourceLabels[source] ?? source}</Badge>;
}

export function WorkplaceBadge({ type }: { type: WorkplaceType | string }) {
  const tone =
    type === 'remote' ? 'green' : type === 'hybrid' ? 'amber' : type === 'onsite' ? 'blue' : 'neutral';
  return <Badge tone={tone}>{workplaceLabels[type as WorkplaceType] ?? type}</Badge>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  className,
  loading,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}) {
  const variants: Record<string, string> = {
    primary:
      'bg-neutral-900 text-white hover:bg-neutral-700 disabled:bg-neutral-400',
    secondary:
      'bg-white text-neutral-700 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 disabled:text-neutral-400',
    danger: 'bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300',
    ghost: 'text-neutral-600 hover:bg-neutral-100 disabled:text-neutral-400',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed',
        variants[variant],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-50',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-colors focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-50',
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  required,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-neutral-400', className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-neutral-200/70', className)} />;
}

export function JobCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
    </Card>
  );
}

export function EmptyState({
  title = 'No jobs found',
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
        <Inbox className="h-6 w-6 text-neutral-400" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900">Something went wrong</h3>
      <p className="mt-1 max-w-md text-sm text-neutral-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Card>
  );
}
