import { apiClient } from './axios';
import type { ApiEnvelope, Job, JobListMeta, JobQueryParams } from '../types';

export interface JobListResponse {
  jobs: Job[];
  meta: JobListMeta;
}

export async function listJobs(params: JobQueryParams): Promise<JobListResponse> {
  const res = await apiClient.get<ApiEnvelope<Job[]>>('/jobs', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      q: params.q || undefined,
      title: params.title || undefined,
      source: params.source && params.source !== 'all' ? params.source : undefined,
      location: params.location || undefined,
      experienceLevel: params.experienceLevel || undefined,
      workplaceType: params.workplaceType || undefined,
      sortBy: params.sortBy ?? 'postedAt',
      sortOrder: params.sortOrder ?? 'desc',
    },
  });

  return {
    jobs: res.data.data ?? [],
    meta: (res.data.meta as unknown as JobListMeta) ?? {
      page: 1,
      limit: params.limit ?? 20,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function getJob(id: number): Promise<Job> {
  const res = await apiClient.get<ApiEnvelope<Job>>(`/jobs/${id}`);
  return res.data.data;
}
