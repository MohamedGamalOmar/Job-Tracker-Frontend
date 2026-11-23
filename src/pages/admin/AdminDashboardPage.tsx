import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, Briefcase, ShieldCheck, Users } from 'lucide-react';
import { getAdminStats } from '../../api/admin.api';
import { getApiErrorMessage } from '../../api/axios';
import { Card, ErrorState, Skeleton } from '../../components/ui';
import { sourceLabels } from '../../lib/format';

export function AdminDashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
  });

  const stats = statsQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Admin dashboard</h2>
        <p className="mt-1 text-sm text-ink-3">Platform-wide statistics.</p>
      </div>

      {statsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : statsQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(statsQuery.error)}
          onRetry={() => statsQuery.refetch()}
        />
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Users} label="Total users" value={stats.users} />
            <StatCard icon={ShieldCheck} label="Admins" value={stats.admins} />
            <StatCard icon={Briefcase} label="Jobs" value={stats.jobs} />
            <StatCard icon={Bookmark} label="Saved jobs" value={stats.savedJobs} />
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Jobs by source</h3>
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink"
              >
                Manage users
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {Object.entries(stats.jobsBySource).length === 0 && (
                <p className="text-sm text-ink-4">No jobs yet.</p>
              )}
              {Object.entries(stats.jobsBySource).map(([source, count]) => (
                <div
                  key={source}
                  className="rounded-lg border border-line px-3 py-2.5"
                >
                  <p className="text-xs text-ink-3">{sourceLabels[source] ?? source}</p>
                  <p className="mt-0.5 text-lg font-semibold text-ink">{count}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-ink-3">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </Card>
  );
}
