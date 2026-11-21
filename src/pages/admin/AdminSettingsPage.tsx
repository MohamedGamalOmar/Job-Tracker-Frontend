import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import { getSystemInfo } from '../../api/admin.api';
import { getApiErrorMessage } from '../../api/axios';
import { Badge, Card, ErrorState, Skeleton } from '../../components/ui';
import { cn } from '../../lib/utils';

function StatusBadge({ ok, label }: { ok: boolean; label?: string }) {
  return (
    <Badge tone={ok ? 'green' : 'red'}>
      {ok ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
      {label ?? (ok ? 'Configured' : 'Not configured')}
    </Badge>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{children}</span>
    </div>
  );
}

export function AdminSettingsPage() {
  const query = useQuery({
    queryKey: ['admin', 'system'],
    queryFn: getSystemInfo,
  });

  const info = query.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">Admin settings</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Backend configuration status. Secrets are never exposed.
        </p>
      </div>

      {query.isLoading ? (
        <Card className="space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </Card>
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : info ? (
        <Card className="divide-y divide-neutral-100 p-6">
          <Row label="Environment">
            <Badge tone={info.nodeEnv === 'production' ? 'blue' : 'amber'}>{info.nodeEnv}</Badge>
          </Row>
          <Row label="Database">
            {info.database === 'turso' ? 'Turso (libSQL)' : 'SQLite file'}
          </Row>
          <Row label="API.SH provider">
            <StatusBadge ok={info.apishConfigured} />
          </Row>
          <Row label="SMTP (password reset)">
            <StatusBadge ok={info.smtpConfigured} />
          </Row>
          <Row label="Cron secret">
            <StatusBadge ok={info.cronSecretConfigured} />
          </Row>
          <Row label="Import interval">
            {info.jobImportIntervalMinutes > 0
              ? `Every ${info.jobImportIntervalMinutes} min`
              : 'Disabled (manual only)'}
          </Row>
          <Row label="Scheduled imports">
            <span className={cn(info.scheduledImportsError && 'text-red-600')}>
              {info.scheduledImportsError
                ? info.scheduledImportsError
                : `${info.scheduledImportsCount} configured`}
            </span>
          </Row>
        </Card>
      ) : null}
    </div>
  );
}
