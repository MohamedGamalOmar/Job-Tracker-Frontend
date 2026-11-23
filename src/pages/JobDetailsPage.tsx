import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Calendar, ExternalLink, MapPin } from 'lucide-react';
import { getJob } from '../api/jobs.api';
import { getApiErrorMessage } from '../api/axios';
import { SaveButton } from '../components/SaveButton';
import { Badge, Card, ErrorState, Skeleton, SourceBadge, WorkplaceBadge } from '../components/ui';
import {
  formatDate,
  formatDateTime,
  formatExperience,
  formatSalary,
  sourceLabels,
} from '../lib/format';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-sm text-ink-3">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

function NotSpecified() {
  return <span className="text-ink-4">Not specified</span>;
}

export function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const jobId = Number(id);

  const query = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    enabled: Number.isInteger(jobId) && jobId > 0,
    retry: false,
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card className="p-6">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <Skeleton className="mt-6 h-40 w-full" />
        </Card>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          message={
            query.error
              ? getApiErrorMessage(query.error)
              : 'Job not found. It may have been deleted.'
          }
        />
        <div className="mt-4">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Back to all jobs
          </Link>
        </div>
      </div>
    );
  }

  const job = query.data;
  const salary = formatSalary(job);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all jobs
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">{job.title}</h2>
            <p className="mt-1 text-sm text-ink-3">{job.company ?? 'Company not specified'}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SourceBadge source={job.source} />
              <WorkplaceBadge type={job.workplaceType} />
              {job.experienceLevel && <Badge>{job.experienceLevel}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SaveButton jobId={job.id} saved={job.saved} className="border border-line" />
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-canvas hover:bg-ink/85"
            >
              Open original job
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-line border-t border-line">
          <DetailRow label="Location">
            {job.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-ink-4" />
                {job.location}
              </span>
            ) : (
              <NotSpecified />
            )}
          </DetailRow>
          <DetailRow label="Source">
            {sourceLabels[job.source] ?? job.source}
            {job.externalId && (
              <span className="ml-2 text-ink-4">(ID: {job.externalId})</span>
            )}
          </DetailRow>
          <DetailRow label="Original URL">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-blue-600 hover:underline dark:text-blue-400"
            >
              {job.url}
            </a>
          </DetailRow>
          <DetailRow label="Salary">
            {salary ?? job.salaryText ?? <NotSpecified />}
          </DetailRow>
          <DetailRow label="Posted date">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-ink-4" />
              {formatDate(job.postedAt)}
            </span>
          </DetailRow>
          <DetailRow label="Experience">
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-ink-4" />
              {formatExperience(job)}
            </span>
          </DetailRow>
          <DetailRow label="Experience level">
            {job.experienceLevel ?? <NotSpecified />}
          </DetailRow>
          <DetailRow label="Workplace type">
            <WorkplaceBadge type={job.workplaceType} />
          </DetailRow>
          <DetailRow label="Saved">{job.saved ? 'Yes' : 'No'}</DetailRow>
          <DetailRow label="Collected at">{formatDateTime(job.collectedAt)}</DetailRow>
          <DetailRow label="Created at">{formatDateTime(job.createdAt)}</DetailRow>
          <DetailRow label="Updated at">{formatDateTime(job.updatedAt)}</DetailRow>
        </dl>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-ink">Required skills</h3>
          {job.requiredSkills.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.requiredSkills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-ink-4">Not specified</p>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-ink">Description</h3>
          {job.description ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
              {job.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-ink-4">Not specified</p>
          )}
        </div>
      </Card>
    </div>
  );
}
