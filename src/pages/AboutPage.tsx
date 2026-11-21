import { Bookmark, Briefcase, Download, Filter, Search, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Briefcase,
    title: 'One place for every job board',
    text: 'Job opportunities from Wuzzuf, LinkedIn, Glassdoor, and Indeed are collected and normalized into a single feed — no more tab-hopping between sites.',
  },
  {
    icon: Search,
    title: 'Powerful search & filters',
    text: 'Search across titles, companies, and skills, or narrow by title only. Filter by source, location, experience level, and workplace type, then sort however you like.',
  },
  {
    icon: Filter,
    title: 'Smart imports',
    text: 'Admins can import jobs from each platform with targeted queries — manually or automatically on a daily schedule via a background cron job. Optional strict matching keeps only results relevant to your search terms.',
  },
  {
    icon: Bookmark,
    title: 'Save what matters',
    text: 'Bookmark interesting roles to your personal saved list, then revisit them anytime — your saves follow your account across devices.',
  },
  {
    icon: Download,
    title: 'Installable & offline-ready',
    text: 'Add Job Tracker to your home screen as a PWA. Previously viewed jobs remain available even without an internet connection.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy first',
    text: 'Browsing is public, but saving jobs and importing requires an account. Your data stays yours — admins manage the platform, not your activity.',
  },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">About Job Tracker</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Job Tracker is a personal job-hunting companion that pulls opportunities from the
          biggest job boards into one clean, searchable dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900">
              <Icon className="h-4.5 w-4.5 text-white" />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-neutral-900">{title}</h2>
            <p className="mt-1 text-sm text-neutral-600">{text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">How it works</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-neutral-600">
          <li>
            <span className="font-medium text-neutral-800">Browse freely</span> — the dashboard
            and job listings are public, no account needed.
          </li>
          <li>
            <span className="font-medium text-neutral-800">Create an account</span> to save jobs
            and keep your shortlist across devices.
          </li>
          <li>
            <span className="font-medium text-neutral-800">Admins keep the feed fresh</span> by
            running imports from Wuzzuf, LinkedIn, Glassdoor, and Indeed — manually from the
            admin panel or automatically every day via a scheduled cron job.
          </li>
          <li>
            <span className="font-medium text-neutral-800">Apply with confidence</span> — every
            job links back to the original posting.
          </li>
        </ol>
      </div>
    </div>
  );
}
