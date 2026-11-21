export type JobSource = 'wuzzuf' | 'linkedin' | 'glassdoor' | 'indeed' | 'manual';

export type WorkplaceType = 'remote' | 'hybrid' | 'onsite' | 'unknown';

export interface Job {
  id: number;
  externalId: string | null;
  source: JobSource;
  title: string;
  company: string | null;
  url: string;
  location: string | null;
  workplaceType: WorkplaceType;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryText: string | null;
  postedAt: string | null;
  description: string | null;
  requiredSkills: string[];
  experienceMin: number | null;
  experienceMax: number | null;
  experienceLevel: string | null;
  collectedAt: string;
  createdAt: string;
  updatedAt: string;
  saved: boolean;
}

export interface JobListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JobQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  title?: string;
  source?: string;
  location?: string;
  experienceLevel?: string;
  workplaceType?: string;
  sortBy?: 'postedAt' | 'collectedAt' | 'createdAt' | 'updatedAt' | 'title' | 'company';
  sortOrder?: 'asc' | 'desc';
}

export interface ImportError {
  index: number;
  message: string;
  issues?: string[];
}

export interface ImportSummary {
  totalReceived: number;
  inserted: number;
  duplicates: number;
  invalid: number;
  errors: ImportError[];
}

export interface SourceImportSummary extends ImportSummary {
  pagesFetched: number;
  providerTotal: number | null;
  filteredByQuery?: number;
}

export interface ApiErrorItem {
  path?: string;
  message?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta: Record<string, unknown>;
  message?: string;
  errors?: ApiErrorItem[];
}

export interface User {
  id: number;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
