import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900">
            <Briefcase className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-semibold text-neutral-900">Job Tracker</span>
        </Link>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
