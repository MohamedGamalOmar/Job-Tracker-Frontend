import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Clock, Globe } from 'lucide-react';
import { listJobs } from '../api/jobs.api';
import { getApiErrorMessage } from '../api/axios';
import { JobCard } from '../components/JobCard';
import { Card, ErrorState, JobCardSkeleton, Skeleton } from '../components/ui';
import type { JobSource } from '../types';
import { sourceLabels } from '../lib/format';

type TrackedSource = Exclude<JobSource, 'manual'>;

const SOURCES: TrackedSource[] = ['wuzzuf', 'linkedin', 'glassdoor', 'indeed'];

async function fetchStats() {
  const countFor = async (source?: string) => {
    const res = await listJobs({ page: 1, limit: 1, source });
    return res.meta.total;
  };
  const [total, wuzzuf, linkedin, glassdoor, indeed] = await Promise.all([
    countFor(),
    countFor('wuzzuf'),
    countFor('linkedin'),
    countFor('glassdoor'),
    countFor('indeed'),
  ]);
  return { total, wuzzuf, linkedin, glassdoor, indeed };
}

export function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchStats,
  });

  const recentQuery = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: () => listJobs({ page: 1, limit: 8, sortBy: 'postedAt', sortOrder: 'desc' }),
  });

  const newJobsQuery = useQuery({
    queryKey: ['dashboard', 'new'],
    queryFn: async () => {
      const res = await listJobs({
        page: 1,
        limit: 100,
        sortBy: 'collectedAt',
        sortOrder: 'desc',
      });
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return res.jobs.filter((j) => new Date(j.collectedAt).getTime() >= weekAgo).length;
    },
  });

  const stats = statsQuery.data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-ink">Dashboard</h2>
        <p className="mt-1 text-sm text-ink-3">
          Overview of your collected job opportunities.
        </p>
      </div>

      {statsQuery.isError && (
        <ErrorState
          message={getApiErrorMessage(statsQuery.error)}
          onRetry={() => statsQuery.refetch()}
        />
      )}

      <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {statsQuery.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : stats ? (
          <>
            <StatCard icon={Briefcase} label="Total jobs" value={stats.total} />
            <StatCard
              icon={Clock}
              label="New (7 days)"
              value={newJobsQuery.data ?? '…'}
            />
            {SOURCES.map((source) => (
              <StatCard
                key={source}
                icon={Globe}
                label={sourceLabels[source]}
                value={stats[source]}
                to={`/jobs?source=${source}`}
              />
            ))}
          </>
        ) : null}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">Recent jobs</h3>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentQuery.isLoading ? (
          <div className="stagger grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : recentQuery.isError ? (
          <ErrorState
            message={getApiErrorMessage(recentQuery.error)}
            onRetry={() => recentQuery.refetch()}
          />
        ) : (recentQuery.data?.jobs.length ?? 0) === 0 ? (
          <Card className="p-8 text-center text-sm text-ink-3">
            No jobs yet. Import jobs to get started.
          </Card>
        ) : (
          <div className="stagger grid gap-4 lg:grid-cols-2">
            {recentQuery.data!.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Briefcase;
  label: string;
  value: number | string;
  to?: string;
}) {
  const content = (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 text-ink-3">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </Card>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}
