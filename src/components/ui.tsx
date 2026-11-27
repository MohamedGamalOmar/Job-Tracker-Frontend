import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react';
import { AlertCircle, Check, ChevronDown, Inbox, Loader2 } from 'lucide-react';
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
    neutral: 'bg-sunken text-ink-2 ring-line',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
    purple: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
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
    <div
      className={cn(
        'rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-shadow duration-200 dark:shadow-none',
        className,
      )}
    >
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
      'bg-ink text-canvas shadow-sm hover:bg-ink/85 active:scale-[0.98] disabled:opacity-40',
    secondary:
      'bg-surface text-ink-2 ring-1 ring-inset ring-line-strong hover:bg-sunken hover:text-ink active:scale-[0.98] disabled:text-ink-4',
    danger:
      'bg-red-600 text-white shadow-sm hover:bg-red-500 active:scale-[0.98] disabled:opacity-40',
    ghost:
      'text-ink-2 hover:bg-sunken hover:text-ink active:scale-[0.98] disabled:text-ink-4',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60 disabled:cursor-not-allowed',
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

export function Input({
  className,
  ref,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink shadow-[0_1px_2px_rgb(0_0_0/0.03)] placeholder-ink-4 outline-none dark:shadow-none transition-all duration-150 focus:border-ink-3 focus:ring-2 focus:ring-ink/10 disabled:bg-canvas',
        className,
      )}
      {...props}
    />
  );
}

interface SelectProps {
  id?: string;
  className?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: ReactNode;
  'aria-label'?: string;
}

export function Select({
  id,
  className,
  value = '',
  onChange,
  disabled,
  children,
  'aria-label': ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((el) => {
      const props = el.props as { value?: string; children?: ReactNode; disabled?: boolean };
      return {
        value: String(props.value ?? ''),
        label: props.children,
        disabled: !!props.disabled,
      };
    });

  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function handleSelect(optionValue: string) {
    onChange?.({
      target: { value: optionValue, name: id ?? '', id: id ?? '' },
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  }

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3 py-2 text-left text-sm text-ink shadow-[0_1px_2px_rgb(0_0_0/0.03)] outline-none transition-all duration-150 dark:shadow-none',
          open
            ? 'border-ink-3 ring-2 ring-ink/10'
            : 'border-line-strong hover:border-ink-4 focus-visible:border-ink-3 focus-visible:ring-2 focus-visible:ring-ink/10',
          disabled && 'cursor-not-allowed bg-canvas text-ink-4',
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-ink-4 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="animate-menu absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-auto rounded-xl border border-line bg-surface p-1 shadow-xl"
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              disabled={o.disabled}
              onClick={() => handleSelect(o.value)}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-100',
                o.value === value
                  ? 'bg-sunken font-medium text-ink'
                  : 'text-ink-2 hover:bg-sunken hover:text-ink',
                o.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check className="h-4 w-4 shrink-0 text-ink" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink shadow-[0_1px_2px_rgb(0_0_0/0.03)] placeholder-ink-4 outline-none dark:shadow-none transition-all duration-150 focus:border-ink-3 focus:ring-2 focus:ring-ink/10 disabled:bg-canvas',
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
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-2">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-3">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-ink-4', className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-line/60', className)} />;
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
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sunken">
        <Inbox className="h-6 w-6 text-ink-4" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-3">{description}</p>}
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
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-ink">Something went wrong</h3>
      <p className="mt-1 max-w-md text-sm text-ink-3">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Card>
  );
}
