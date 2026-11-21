import type { Job, WorkplaceType } from '../types';

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not specified';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not specified';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatSalary(job: Job): string | null {
  if (job.salaryText) return job.salaryText;
  if (job.salaryMin === null && job.salaryMax === null) return null;
  const currency = job.salaryCurrency ?? '';
  const fmt = (n: number) => n.toLocaleString();
  if (job.salaryMin !== null && job.salaryMax !== null) {
    return `${currency} ${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`.trim();
  }
  const value = job.salaryMin ?? job.salaryMax;
  return `${currency} ${fmt(value!)}`.trim();
}

export function formatExperience(job: Job): string {
  if (job.experienceMin !== null && job.experienceMax !== null) {
    return `${job.experienceMin}–${job.experienceMax} years`;
  }
  if (job.experienceMin !== null) return `${job.experienceMin}+ years`;
  if (job.experienceMax !== null) return `Up to ${job.experienceMax} years`;
  return job.experienceLevel ?? 'Not specified';
}

export const workplaceLabels: Record<WorkplaceType, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
  unknown: 'Not specified',
};

export const sourceLabels: Record<string, string> = {
  wuzzuf: 'Wuzzuf',
  linkedin: 'LinkedIn',
  glassdoor: 'Glassdoor',
  indeed: 'Indeed',
  manual: 'Manual',
};

export function truncate(text: string | null | undefined, max = 160): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}
