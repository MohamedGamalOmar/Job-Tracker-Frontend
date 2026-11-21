import { apiClient } from './axios';
import type { ApiEnvelope, ImportSummary, SourceImportSummary } from '../types';

export async function importJobsPayload(payload: unknown): Promise<ImportSummary> {
  const res = await apiClient.post<ApiEnvelope<ImportSummary>>('/imports/jobs', payload);
  return res.data.data;
}

export async function importCsv(csv: string): Promise<ImportSummary> {
  const res = await apiClient.post<ApiEnvelope<ImportSummary>>('/imports/jobs', { csv });
  return res.data.data;
}

export async function importWuzzuf(options: Record<string, unknown>): Promise<SourceImportSummary> {
  const res = await apiClient.post<ApiEnvelope<SourceImportSummary>>('/imports/wuzzuf', options);
  return res.data.data;
}

export async function importLinkedIn(options: Record<string, unknown>): Promise<SourceImportSummary> {
  const res = await apiClient.post<ApiEnvelope<SourceImportSummary>>('/imports/linkedin', options);
  return res.data.data;
}

export async function importGlassdoor(options: Record<string, unknown>): Promise<SourceImportSummary> {
  const res = await apiClient.post<ApiEnvelope<SourceImportSummary>>('/imports/glassdoor', options);
  return res.data.data;
}

export async function importIndeed(options: Record<string, unknown>): Promise<SourceImportSummary> {
  const res = await apiClient.post<ApiEnvelope<SourceImportSummary>>('/imports/indeed', options);
  return res.data.data;
}
