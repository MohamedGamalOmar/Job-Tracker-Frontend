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
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/jobs/${job.id}`}
            className="text-base font-semibold text-neutral-900 hover:underline"
          >
            {job.title}
          </Link>
          <p className="mt-0.5 text-sm text-neutral-500">{job.company ?? 'Company not specified'}</p>
        </div>
        <div className="flex items-center gap-1">
          <SaveButton jobId={job.id} saved={job.saved} />
          <SourceBadge source={job.source} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        )}
        <span>Posted {formatDate(job.postedAt)}</span>
        <span>{formatExperience(job)}</span>
        <WorkplaceBadge type={job.workplaceType} />
        {salary && <span className="font-medium text-emerald-700">{salary}</span>}
      </div>

      {job.description && (
        <p className="mt-3 line-clamp-2 text-sm text-neutral-600">{truncate(job.description)}</p>
      )}

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
          {extraSkills > 0 && <Badge>+{extraSkills} more</Badge>}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 ring-1 ring-inset ring-neutral-300 transition-colors hover:bg-neutral-50"
        >
          View details
        </Link>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 ring-1 ring-inset ring-neutral-300 transition-colors hover:bg-neutral-50"
        >
          Open original
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </Card>
  );
}
