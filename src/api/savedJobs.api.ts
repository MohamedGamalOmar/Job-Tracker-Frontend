import { apiClient } from './axios';
import type { ApiEnvelope, Job } from '../types';
import { AxiosError } from 'axios';

export async function listSavedJobs(): Promise<Job[]> {
  const res = await apiClient.get<ApiEnvelope<Job[]>>('/saved-jobs');
  return res.data.data ?? [];
}

export async function saveJob(jobId: number): Promise<Job> {
  const res = await apiClient.post<ApiEnvelope<Job>>(`/saved-jobs/${jobId}`);
  return res.data.data;
}

export async function unsaveJob(jobId: number): Promise<void> {
  try {
    await apiClient.delete<ApiEnvelope<{ jobId: number; saved: boolean }>>(`/saved-jobs/${jobId}`);
  } catch (error) {
    // Backend returns 404 when the job isn't saved — treat as already-unsaved.
    if (axiosIsNotFound(error)) {
      return;
    }
    throw error;
  }
}

function axiosIsNotFound(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 404;
}
