import { Link } from 'react-router-dom';
import { ExternalLink, MapPin } from 'lucide-react';
import { formatDate, formatExperience, formatSalary, truncate } from '../lib/format';
import { Badge, Card, SourceBadge, WorkplaceBadge } from './ui';
import { SaveButton } from './SaveButton';
import type { Job } from '../types';

export function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job);
  const skills = job.requiredSkills.slice(0, 4);
  const extraSkills = job.requiredSkills.length - skills.length;

  return (
    <Card className="flex flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg dark:hover:shadow-black/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/jobs/${job.id}`}
            className="text-base font-semibold text-ink transition-colors hover:text-ink-3"
          >
            {job.title}
          </Link>
          <p className="mt-0.5 text-sm text-ink-3">{job.company ?? 'Company not specified'}</p>
        </div>
        <div className="flex items-center gap-1">
          <SaveButton jobId={job.id} saved={job.saved} />
          <SourceBadge source={job.source} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-3">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        )}
        <span>Posted {formatDate(job.postedAt)}</span>
        <span>{formatExperience(job)}</span>
        <WorkplaceBadge type={job.workplaceType} />
        {salary && <span className="font-medium text-emerald-700 dark:text-emerald-400">{salary}</span>}
      </div>

      {job.description && (
        <p className="mt-3 line-clamp-2 text-sm text-ink-2">{truncate(job.description)}</p>
      )}

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
          {extraSkills > 0 && <Badge>+{extraSkills} more</Badge>}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-canvas shadow-sm transition-all duration-150 hover:bg-ink/85 active:scale-[0.97]"
        >
          View details
        </Link>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-3 transition-all duration-150 hover:bg-sunken hover:text-ink active:scale-[0.97]"
        >
          Open original
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </Card>
  );
}
