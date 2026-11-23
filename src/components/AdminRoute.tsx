import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Card, Spinner } from './ui';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md">
        <Card className="flex flex-col items-center px-6 py-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10">
            <ShieldAlert className="h-6 w-6 text-amber-500" />
          </div>
          <h3 className="text-base font-semibold text-ink">Admin access required</h3>
          <p className="mt-1 text-sm text-ink-3">
            Your account doesn't have permission to view this page.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
