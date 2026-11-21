import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  importCsv,
  importGlassdoor,
  importIndeed,
  importJobsPayload,
  importLinkedIn,
  importWuzzuf,
} from '../api/imports.api';
import { runScheduledImports } from '../api/admin.api';
import type { RunImportsResult } from '../types';
import { getApiErrorMessage } from '../api/axios';
import { Badge, Button, Card, Field, Input, Select, Textarea } from '../components/ui';
import type { ImportSummary, SourceImportSummary } from '../types';

type Tab = 'platforms' | 'json' | 'csv';

function cleanObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== '' && v !== null),
  );
}

function numOrUndef(v: string): number | undefined {
  const t = v.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function importSuccessToast(source: string, s: SourceImportSummary) {
  const base = `${source} import finished: ${s.inserted} inserted`;
  toast.success(
    s.filteredByQuery && s.filteredByQuery > 0
      ? `${base} (${s.filteredByQuery} filtered out by strict matching)`
      : base,
  );
}

function invalidateJobQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['jobs'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
}

function ImportResult({ summary }: { summary: ImportSummary | SourceImportSummary }) {
  const sourceSummary = summary as SourceImportSummary;
  return (
    <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm">
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <span>
          Received: <strong>{summary.totalReceived}</strong>
        </span>
        <span className="text-emerald-700">
          Inserted: <strong>{summary.inserted}</strong>
        </span>
        <span className="text-amber-700">
          Duplicates: <strong>{summary.duplicates}</strong>
        </span>
        <span className="text-red-600">
          Invalid: <strong>{summary.invalid}</strong>
        </span>
        {sourceSummary.pagesFetched !== undefined && (
          <span>
            Pages fetched: <strong>{sourceSummary.pagesFetched}</strong>
          </span>
        )}
        {sourceSummary.providerTotal !== null && sourceSummary.providerTotal !== undefined && (
          <span>
            Provider total: <strong>{sourceSummary.providerTotal}</strong>
          </span>
        )}
        {sourceSummary.filteredByQuery !== undefined && sourceSummary.filteredByQuery > 0 && (
          <span className="text-violet-700">
            Filtered out by strict matching:{' '}
            <strong>{sourceSummary.filteredByQuery}</strong>
          </span>
        )}
      </div>
      {summary.errors.length > 0 && (
        <div className="mt-3">
          <p className="font-medium text-neutral-700">Errors ({summary.errors.length}):</p>
          <ul className="mt-1 max-h-40 list-disc space-y-0.5 overflow-y-auto pl-5 text-xs text-neutral-600">
            {summary.errors.slice(0, 20).map((err, i) => (
              <li key={i}>
                #{err.index}: {err.message}
                {err.issues && ` — ${err.issues.join('; ')}`}
              </li>
            ))}
            {summary.errors.length > 20 && <li>…and {summary.errors.length - 20} more</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

function PlatformCard({
  title,
  description,
  children,
  onSubmit,
  isPending,
  result,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSubmit: () => void;
  isPending: boolean;
  result: ImportSummary | SourceImportSummary | null;
}) {
  return (
    <Card className="flex flex-col p-5">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-xs text-neutral-500">{description}</p>
      <div className="mt-4 flex-1 space-y-3">{children}</div>
      <Button className="mt-4 w-full" onClick={onSubmit} loading={isPending} disabled={isPending}>
        {isPending ? 'Importing…' : `Import from ${title}`}
      </Button>
      {result && <ImportResult summary={result} />}
    </Card>
  );
}

function WuzzufForm({ strict }: { strict: boolean }) {
  const queryClient = useQueryClient();
  const [f, setF] = useState({
    query: '', country: 'Egypt', workplace: '', careerLevel: '',
    postedWithinDays: '', maxPages: '1',
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () =>
      importWuzzuf(
        cleanObject({
          query: f.query,
          country: f.country,
          workplace: f.workplace || undefined,
          careerLevel: f.careerLevel || undefined,
          postedWithinDays: numOrUndef(f.postedWithinDays),
          maxPages: numOrUndef(f.maxPages) ?? 1,
          strictQuery: strict ? true : undefined,
        }),
      ),
    onSuccess: (s) => {
      importSuccessToast('Wuzzuf', s);
      invalidateJobQueries(queryClient);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <PlatformCard
      title="Wuzzuf"
      description="Search wuzzuf.net jobs via the configured backend provider."
      onSubmit={() => mutation.mutate()}
      isPending={mutation.isPending}
      result={mutation.data ?? null}
    >
      <Field label="Search query" htmlFor="w-query">
        <Input id="w-query" value={f.query} onChange={set('query')} placeholder="frontend developer" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Country" htmlFor="w-country">
          <Input id="w-country" value={f.country} onChange={set('country')} />
        </Field>
        <Field label="Workplace" htmlFor="w-workplace">
          <Select id="w-workplace" value={f.workplace} onChange={set('workplace')}>
            <option value="">Any</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="on_site">On-site</option>
          </Select>
        </Field>
        <Field label="Career level" htmlFor="w-level">
          <Input id="w-level" value={f.careerLevel} onChange={set('careerLevel')} placeholder="Experienced" />
        </Field>
        <Field label="Posted within" htmlFor="w-days">
          <Select id="w-days" value={f.postedWithinDays} onChange={set('postedWithinDays')}>
            <option value="">Any time</option>
            <option value="1">24 hours</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
          </Select>
        </Field>
        <Field label="Max pages" htmlFor="w-pages">
          <Input id="w-pages" type="number" min={1} max={20} value={f.maxPages} onChange={set('maxPages')} />
        </Field>
      </div>
    </PlatformCard>
  );
}

function LinkedInForm({ strict }: { strict: boolean }) {
  const queryClient = useQueryClient();
  const [f, setF] = useState({
    query: '', location: 'Cairo, Egypt', distance: '25', posted: 'week',
    easyApply: false, maxPages: '1',
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const mutation = useMutation({
    mutationFn: () =>
      importLinkedIn(
        cleanObject({
          query: f.query,
          location: f.location || undefined,
          distance: numOrUndef(f.distance),
          posted: f.posted === 'any' ? undefined : f.posted,
          easyApply: f.easyApply || undefined,
          maxPages: numOrUndef(f.maxPages) ?? 1,
          strictQuery: strict ? true : undefined,
        }),
      ),
    onSuccess: (s) => {
      importSuccessToast('LinkedIn', s);
      invalidateJobQueries(queryClient);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <PlatformCard
      title="LinkedIn"
      description="Requires a location (or geoId) in addition to the query."
      onSubmit={() => mutation.mutate()}
      isPending={mutation.isPending}
      result={mutation.data ?? null}
    >
      <Field label="Search query" htmlFor="l-query" required>
        <Input id="l-query" value={f.query} onChange={set('query')} placeholder="frontend developer" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Location" htmlFor="l-location" required>
          <Input id="l-location" value={f.location} onChange={set('location')} />
        </Field>
        <Field label="Distance (km)" htmlFor="l-distance">
          <Select id="l-distance" value={f.distance} onChange={set('distance')}>
            {[0, 5, 10, 25, 50, 100].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Posted" htmlFor="l-posted">
          <Select id="l-posted" value={f.posted} onChange={set('posted')}>
            <option value="any">Any time</option>
            <option value="24h">Past 24h</option>
            <option value="week">Past week</option>
            <option value="month">Past month</option>
          </Select>
        </Field>
        <Field label="Max pages" htmlFor="l-pages">
          <Input id="l-pages" type="number" min={1} max={30} value={f.maxPages} onChange={set('maxPages')} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={f.easyApply}
          onChange={(e) => setF((p) => ({ ...p, easyApply: e.target.checked }))}
          className="h-4 w-4 rounded border-neutral-300"
        />
        Easy Apply only
      </label>
    </PlatformCard>
  );
}

function GlassdoorForm({ strict }: { strict: boolean }) {
  const queryClient = useQueryClient();
  const [f, setF] = useState({
    query: '', location: 'Cairo', fromAge: '7', remote: false, easyApply: false,
    jobType: '', maxPages: '1',
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const mutation = useMutation({
    mutationFn: () =>
      importGlassdoor(
        cleanObject({
          query: f.query || undefined,
          location: f.location || undefined,
          fromAge: numOrUndef(f.fromAge),
          remote: f.remote || undefined,
          easyApply: f.easyApply || undefined,
          jobType: f.jobType || undefined,
          maxPages: numOrUndef(f.maxPages) ?? 1,
          strictQuery: strict ? true : undefined,
        }),
      ),
    onSuccess: (s) => {
      importSuccessToast('Glassdoor', s);
      invalidateJobQueries(queryClient);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <PlatformCard
      title="Glassdoor"
      description="Requires a search query or a Glassdoor search URL."
      onSubmit={() => mutation.mutate()}
      isPending={mutation.isPending}
      result={mutation.data ?? null}
    >
      <Field label="Search query" htmlFor="g-query">
        <Input id="g-query" value={f.query} onChange={set('query')} placeholder="frontend developer" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Location" htmlFor="g-location">
          <Input id="g-location" value={f.location} onChange={set('location')} />
        </Field>
        <Field label="Posted within" htmlFor="g-age">
          <Select id="g-age" value={f.fromAge} onChange={set('fromAge')}>
            <option value="">Any time</option>
            {[1, 3, 7, 14, 30].map((d) => (
              <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>
            ))}
          </Select>
        </Field>
        <Field label="Job type" htmlFor="g-type">
          <Select id="g-type" value={f.jobType} onChange={set('jobType')}>
            <option value="">Any</option>
            <option value="fulltime">Full-time</option>
            <option value="parttime">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="temporary">Temporary</option>
          </Select>
        </Field>
        <Field label="Max pages" htmlFor="g-pages">
          <Input id="g-pages" type="number" min={1} max={30} value={f.maxPages} onChange={set('maxPages')} />
        </Field>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={f.remote} onChange={set('remote')} className="h-4 w-4 rounded border-neutral-300" />
          Remote only
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={f.easyApply} onChange={set('easyApply')} className="h-4 w-4 rounded border-neutral-300" />
          Easy Apply only
        </label>
      </div>
    </PlatformCard>
  );
}

function IndeedForm({ strict }: { strict: boolean }) {
  const queryClient = useQueryClient();
  const [f, setF] = useState({
    query: '', location: '', date: '7', sort: 'date', jobType: '', experience: '', remote: '',
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () =>
      importIndeed(
        cleanObject({
          query: f.query,
          location: f.location || undefined,
          date: numOrUndef(f.date),
          sort: f.sort || undefined,
          jobType: f.jobType || undefined,
          experience: f.experience || undefined,
          remote: f.remote || undefined,
          strictQuery: strict ? true : undefined,
        }),
      ),
    onSuccess: (s) => {
      importSuccessToast('Indeed', s);
      invalidateJobQueries(queryClient);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <PlatformCard
      title="Indeed"
      description="The backend currently supports a single page per Indeed import."
      onSubmit={() => mutation.mutate()}
      isPending={mutation.isPending}
      result={mutation.data ?? null}
    >
      <Field label="Search query" htmlFor="i-query" required>
        <Input id="i-query" value={f.query} onChange={set('query')} placeholder="frontend developer" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Location" htmlFor="i-location">
          <Input id="i-location" value={f.location} onChange={set('location')} />
        </Field>
        <Field label="Posted within" htmlFor="i-date">
          <Select id="i-date" value={f.date} onChange={set('date')}>
            <option value="">Any time</option>
            <option value="1">24 hours</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
          </Select>
        </Field>
        <Field label="Sort" htmlFor="i-sort">
          <Select id="i-sort" value={f.sort} onChange={set('sort')}>
            <option value="date">Date</option>
            <option value="relevance">Relevance</option>
          </Select>
        </Field>
        <Field label="Job type" htmlFor="i-type">
          <Select id="i-type" value={f.jobType} onChange={set('jobType')}>
            <option value="">Any</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
            <option value="internship">Internship</option>
            <option value="permanent">Permanent</option>
          </Select>
        </Field>
        <Field label="Experience" htmlFor="i-exp">
          <Select id="i-exp" value={f.experience} onChange={set('experience')}>
            <option value="">Any</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </Select>
        </Field>
        <Field label="Remote" htmlFor="i-remote">
          <Select id="i-remote" value={f.remote} onChange={set('remote')}>
            <option value="">Any</option>
            <option value="1">Remote</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </Field>
      </div>
    </PlatformCard>
  );
}

function JsonImport() {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: unknown) => importJobsPayload(payload),
    onSuccess: (s) => {
      toast.success(`Import finished: ${s.inserted} inserted, ${s.duplicates} duplicates`);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setText('');
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  function handleImport() {
    setParseError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setParseError('Invalid JSON. Check for syntax errors.');
      return;
    }
    const isArray = Array.isArray(parsed);
    const hasJobs =
      parsed !== null &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as { jobs?: unknown }).jobs);
    if (!isArray && !hasJobs) {
      setParseError('Payload must be a JSON array of jobs or an object with a "jobs" array.');
      return;
    }
    mutation.mutate(parsed);
  }

  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-neutral-900">Import jobs from JSON</h3>
      <p className="mt-1 text-sm text-neutral-500">
        Paste a JSON array of job objects, or an object like {'{ "jobs": [...] }'}. Each job
        requires at least <code className="rounded bg-neutral-100 px-1">title</code> and{' '}
        <code className="rounded bg-neutral-100 px-1">url</code>.
      </p>
      <div className="mt-4">
        <Textarea
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'[\n  {\n    "title": "Frontend Developer",\n    "company": "Acme",\n    "url": "https://example.com/job/1",\n    "source": "manual"\n  }\n]'}
          className="font-mono text-xs"
          aria-label="JSON jobs payload"
        />
      </div>
      {parseError && <p className="mt-2 text-sm text-red-600">{parseError}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleImport} loading={mutation.isPending} disabled={!text.trim()}>
          Import JSON
        </Button>
        {mutation.data && <ImportResult summary={mutation.data} />}
      </div>
    </Card>
  );
}

function CsvImport() {
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (csv: string) => importCsv(csv),
    onSuccess: (s) => {
      toast.success(`CSV import finished: ${s.inserted} inserted, ${s.duplicates} duplicates`);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setFileName(null);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFileError(null);
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setFileError('Please select a .csv file.');
      return;
    }
    const text = await file.text();
    setFileName(file.name);
    mutation.mutate(text);
  }

  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-neutral-900">Import jobs from CSV</h3>
      <p className="mt-1 text-sm text-neutral-500">
        The CSV must include a header row with at least{' '}
        <code className="rounded bg-neutral-100 px-1">title</code> and{' '}
        <code className="rounded bg-neutral-100 px-1">url</code> columns. Supported columns
        include company, location, source, workplace_type, salary_min, salary_max,
        salary_currency, posted_at, description, required_skills, experience_min,
        experience_max, and experience_level.
      </p>
      <div className="mt-4">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700"
          aria-label="CSV file"
        />
        {fileName && !mutation.isPending && (
          <p className="mt-2 text-xs text-neutral-500">Selected: {fileName}</p>
        )}
        {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
      </div>
      {mutation.isPending && (
        <p className="mt-3 text-sm text-neutral-500">Importing {fileName}…</p>
      )}
      {mutation.data && (
        <div className="mt-2">
          <ImportResult summary={mutation.data} />
        </div>
      )}
    </Card>
  );
}

const STRICT_PREF_KEY = 'jt_strict_import';

function PlatformsTab() {
  const [strict, setStrict] = useState(
    () => localStorage.getItem(STRICT_PREF_KEY) === '1',
  );

  function handleToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.checked;
    setStrict(value);
    try {
      localStorage.setItem(STRICT_PREF_KEY, value ? '1' : '0');
    } catch {
      // storage unavailable — preference just won't persist
    }
  }

  return (
    <div className="space-y-4">
      <Card className="flex items-start gap-3 p-4">
        <input
          id="strict-matching"
          type="checkbox"
          checked={strict}
          onChange={handleToggle}
          className="mt-0.5 h-4 w-4 rounded border-neutral-300"
        />
        <div>
          <label htmlFor="strict-matching" className="text-sm font-medium text-neutral-900">
            Strict matching
          </label>
          <p className="mt-0.5 text-xs text-neutral-500">
            Only import jobs whose title or skills contain every word of your search
            query. Turn off to import all provider results (provider search is fuzzy).
            Applies to all four platforms.
          </p>
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        <WuzzufForm strict={strict} />
        <LinkedInForm strict={strict} />
        <GlassdoorForm strict={strict} />
        <IndeedForm strict={strict} />
      </div>
    </div>
  );
}

function RunScheduledCard() {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<RunImportsResult | null>(null);

  const mutation = useMutation({
    mutationFn: runScheduledImports,
    onSuccess: (r) => {
      setResult(r);
      const failed = r.results.filter((x) => !x.ok).length;
      toast.success(
        failed > 0
          ? `Scheduled imports finished: ${r.results.length - failed} ok, ${failed} failed`
          : `Scheduled imports finished: ${r.results.length} ok`,
      );
      invalidateJobQueries(queryClient);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Scheduled imports</h3>
          <p className="mt-1 text-xs text-neutral-500">
            Runs the import schedules configured on the backend
            (JOB_IMPORT_SCHEDULES) immediately.
          </p>
        </div>
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={mutation.isPending}>
          Run scheduled imports
        </Button>
      </div>
      {result && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-neutral-400">Ran at {new Date(result.ranAt).toLocaleString()}</p>
          {result.results.length === 0 && (
            <p className="text-sm text-neutral-500">No schedules configured.</p>
          )}
          {result.results.map((r) => (
            <div
              key={r.source}
              className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            >
              <span className="font-medium capitalize text-neutral-900">{r.source}</span>
              {r.ok ? (
                <span className="text-emerald-700">
                  {r.summary
                    ? `${r.summary.inserted} inserted, ${r.summary.duplicates} duplicates`
                    : 'OK'}
                </span>
              ) : (
                <span className="text-red-600">{r.error ?? 'Failed'}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function ImportPage() {
  const [tab, setTab] = useState<Tab>('platforms');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'platforms', label: 'Job platforms' },
    { key: 'json', label: 'JSON import' },
    { key: 'csv', label: 'CSV import' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">Import jobs</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Collect jobs from supported platforms or import your own data.
        </p>
      </div>

      <RunScheduledCard />

      <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {t.label}
            {t.key === 'platforms' && <Badge className="ml-2">API</Badge>}
          </button>
        ))}
      </div>

      {tab === 'platforms' && <PlatformsTab />}
      {tab === 'json' && <JsonImport />}
      {tab === 'csv' && <CsvImport />}
    </div>
  );
}
