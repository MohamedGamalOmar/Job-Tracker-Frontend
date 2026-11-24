import { useQuery } from '@tanstack/react-query';
import { apiClient, getApiErrorMessage } from '../api/axios';
import type { ApiEnvelope } from '../types';
import { Badge, Button, Card } from '../components/ui';
import { formatDateTime } from '../lib/format';

export function SettingsPage() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await apiClient.get<ApiEnvelope<{ status: string; timestamp: string }>>('/health');
      return res.data.data;
    },
    retry: false,
    refetchInterval: 60_000,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Settings</h2>
        <p className="mt-1 text-sm text-ink-3">Connection and application settings.</p>
      </div>

      {import.meta.env.DEV && (
      <Card className="p-6">
        <h3 className="text-base font-semibold text-ink">Backend connection</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-ink-3">API base URL</dt>
            <dd className="font-mono text-xs text-ink">{apiBaseUrl}/api</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-3">Status</dt>
            <dd>
              {healthQuery.isLoading && <Badge>Checking…</Badge>}
              {healthQuery.isError && <Badge tone="red">Unreachable</Badge>}
              {healthQuery.data && <Badge tone="green">Connected</Badge>}
            </dd>
          </div>
          {healthQuery.data && (
            <div className="flex items-center justify-between">
              <dt className="text-ink-3">Last health check</dt>
              <dd className="text-ink">{formatDateTime(healthQuery.data.timestamp)}</dd>
            </div>
          )}
        </dl>
        {healthQuery.isError && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {getApiErrorMessage(healthQuery.error)}
          </p>
        )}
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => healthQuery.refetch()}
          loading={healthQuery.isFetching}
        >
          Re-check connection
        </Button>
      </Card>
      )}

      <Card className="p-6">
        <h3 className="text-base font-semibold text-ink">About</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Job Tracker is a personal app for collecting job opportunities from
          Wuzzuf, LinkedIn, Glassdoor, and Indeed.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Browsing jobs is public. Importing jobs and managing saved jobs
          require a logged-in account. Scheduled imports are triggered by the
          backend cron endpoint and are not managed from this UI.
        </p>
      </Card>
    </div>
  );
}
