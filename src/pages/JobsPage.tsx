import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { listJobs } from '../api/jobs.api';
import { getApiErrorMessage } from '../api/axios';
import { JobCard } from '../components/JobCard';
import { Button, EmptyState, ErrorState, Input, JobCardSkeleton, Select } from '../components/ui';
import { useDebounce } from '../hooks/useDebounce';

const PAGE_SIZE = 20;

const locationOptions = [
  { value: '', label: 'All locations' },
  { value: 'Cairo', label: 'Cairo' },
  { value: 'Giza', label: 'Giza' },
  { value: 'Alexandria', label: 'Alexandria' },
  { value: 'Remote', label: 'Remote' },
  { value: '__custom__', label: 'Other / custom…' },
];

export function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = searchParams.get('q') ?? '';
  const title = searchParams.get('title') ?? '';
  const source = searchParams.get('source') ?? 'all';
  const locationParam = searchParams.get('location') ?? '';
  const locationIsPreset = locationOptions.some((o) => o.value === locationParam && o.value !== '');
  const [customLocationMode, setCustomLocationMode] = useState(!locationIsPreset && locationParam !== '');
  const locationPreset = locationIsPreset ? locationParam : customLocationMode ? '__custom__' : '';
  const experienceLevel = searchParams.get('experienceLevel') ?? '';
  const workplaceType = searchParams.get('workplaceType') ?? '';
  const sortBy = (searchParams.get('sortBy') ?? 'postedAt') as 'postedAt' | 'collectedAt';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput);
  const [titleInput, setTitleInput] = useState(title);
  const debouncedTitle = useDebounce(titleInput);

  const updateParams = (updates: Record<string, string | undefined>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '' || value === 'all') next.delete(key);
        else next.set(key, value);
      }
      return next;
    });
  };

  // Sync debounced search into URL
  useEffect(() => {
    if (debouncedSearch !== q) {
      updateParams({ q: debouncedSearch || undefined, page: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Sync debounced title filter into URL
  useEffect(() => {
    if (debouncedTitle !== title) {
      updateParams({ title: debouncedTitle || undefined, page: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle]);

  const query = useQuery({
    queryKey: [
      'jobs',
      { q, title, source, location: locationParam, experienceLevel, workplaceType, sortBy, page },
    ],
    queryFn: () =>
      listJobs({
        page,
        limit: PAGE_SIZE,
        q: q || undefined,
        title: title || undefined,
        source,
        location: locationParam || undefined,
        experienceLevel: experienceLevel || undefined,
        workplaceType: workplaceType || undefined,
        sortBy,
        sortOrder: 'desc',
      }),
    placeholderData: (prev) => prev,
  });

  const jobs = query.data?.jobs ?? [];
  const meta = query.data?.meta;
  const activeFilterCount = [
    !!title,
    source !== 'all',
    !!locationParam,
    !!experienceLevel,
    !!workplaceType,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchInput('');
    setTitleInput('');
    setSearchParams(new URLSearchParams());
  };

  const filters = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Select
        aria-label="Source"
        value={source}
        onChange={(e) => updateParams({ source: e.target.value, page: undefined })}
      >
        <option value="all">All sources</option>
        <option value="wuzzuf">Wuzzuf</option>
        <option value="linkedin">LinkedIn</option>
        <option value="glassdoor">Glassdoor</option>
        <option value="indeed">Indeed</option>
        <option value="manual">Manual</option>
      </Select>

      <Select
        aria-label="Location"
        value={locationPreset}
        onChange={(e) => {
          if (e.target.value === '__custom__') {
            setCustomLocationMode(true);
            updateParams({ location: undefined, page: undefined });
          } else {
            setCustomLocationMode(false);
            updateParams({ location: e.target.value || undefined, page: undefined });
          }
        }}
      >
        {locationOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      {customLocationMode && (
        <Input
          aria-label="Custom location"
          placeholder="e.g. Mansoura"
          key={locationParam}
          defaultValue={locationParam}
          onBlur={(e) => updateParams({ location: e.target.value || undefined, page: undefined })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateParams({ location: e.currentTarget.value || undefined, page: undefined });
          }}
        />
      )}

      <Select
        aria-label="Experience level"
        value={experienceLevel}
        onChange={(e) => updateParams({ experienceLevel: e.target.value, page: undefined })}
      >
        <option value="">All experience levels</option>
        <option value="entry">Entry</option>
        <option value="junior">Junior</option>
        <option value="mid">Mid</option>
        <option value="senior">Senior</option>
      </Select>

      <Select
        aria-label="Workplace type"
        value={workplaceType}
        onChange={(e) => updateParams({ workplaceType: e.target.value, page: undefined })}
      >
        <option value="">All workplace types</option>
        <option value="remote">Remote</option>
        <option value="hybrid">Hybrid</option>
        <option value="onsite">On-site</option>
      </Select>

      <Select
        aria-label="Sort by"
        value={sortBy}
        onChange={(e) => updateParams({ sortBy: e.target.value, page: undefined })}
        className="sm:col-span-2 lg:col-span-1"
      >
        <option value="postedAt">Latest posted</option>
        <option value="collectedAt">Recently collected</option>
      </Select>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">All jobs</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {meta ? `${meta.total} job${meta.total === 1 ? '' : 's'} found` : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setFiltersOpen((v) => !v)} className="lg:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-neutral-900 px-1.5 text-xs text-white">{activeFilterCount}</span>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, company, or skills…"
            className="pl-9 pr-9"
            aria-label="Search jobs"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Input
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Filter by title only…"
            title="Searches only the job title (the main search also matches company and skills)"
            className="pr-9"
            aria-label="Filter by title"
          />
          {titleInput && (
            <button
              onClick={() => setTitleInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Clear title filter"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p className="-mt-3 text-xs text-neutral-400">
        Left searches title + company + skills; right filters the title only.
      </p>

      <div className={filtersOpen ? 'block' : 'hidden lg:block'}>{filters}</div>

      {(q || activeFilterCount > 0) && (
        <button
          onClick={clearFilters}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          Clear all filters
        </button>
      )}

      {query.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs match your filters"
          description="Try adjusting your search or filters, or import jobs from a platform."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={page >= meta.totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
