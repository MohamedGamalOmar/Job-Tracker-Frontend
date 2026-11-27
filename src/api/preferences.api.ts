import { apiClient } from './axios';
import type { ApiEnvelope, JobListResponse, JobPreferences } from '../types';

export async function getPreferences(): Promise<JobPreferences | null> {
  const res = await apiClient.get<ApiEnvelope<JobPreferences | null>>('/preferences');
  return res.data.data;
}

export async function savePreferences(prefs: Partial<JobPreferences>): Promise<JobPreferences> {
  const res = await apiClient.put<ApiEnvelope<JobPreferences>>('/preferences', prefs);
  return res.data.data;
}

export async function clearPreferences(): Promise<void> {
  await apiClient.delete<ApiEnvelope<{ message: string }>>('/preferences');
}

export async function getRecommended(
  page = 1,
  limit = 20,
): Promise<JobListResponse> {
  const res = await apiClient.get<ApiEnvelope<JobListResponse>>('/preferences/recommended', {
    params: { page, limit },
  });
  return res.data.data;
}
