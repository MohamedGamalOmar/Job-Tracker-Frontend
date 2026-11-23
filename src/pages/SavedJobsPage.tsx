import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { listSavedJobs } from '../api/savedJobs.api';
import { getApiErrorMessage } from '../api/axios';
import { JobCard } from '../components/JobCard';
import { Button, EmptyState, ErrorState, JobCardSkeleton } from '../components/ui';

export function SavedJobsPage() {
  const query = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: listSavedJobs,
  });

  const jobs = query.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-ink">Saved jobs</h2>
        <p className="mt-1 text-sm text-ink-3">
          Jobs you bookmarked for later.
        </p>
      </div>

      {query.isLoading ? (
        <div className="stagger grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No saved jobs yet"
          description="Browse all jobs and tap the bookmark icon to save them here."
          action={
            <Link to="/jobs">
              <Button variant="secondary">Browse jobs</Button>
            </Link>
          }
        />
      ) : (
        <div className="stagger grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {query.data && query.data.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-ink-4">
          <Bookmark className="h-3.5 w-3.5" />
          {jobs.length} saved job{jobs.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}
