import { apiClient } from './axios';
import type {
  AdminStats,
  ApiEnvelope,
  RunImportsResult,
  SystemInfo,
  User,
  UserRole,
} from '../types';

export interface AdminUser extends User {}

export async function listUsers(limit = 100, offset = 0): Promise<AdminUser[]> {
  const res = await apiClient.get<ApiEnvelope<AdminUser[]>>('/admin/users', {
    params: { limit, offset },
  });
  return res.data.data ?? [];
}

export async function setUserRole(userId: number, role: UserRole): Promise<AdminUser> {
  const res = await apiClient.patch<ApiEnvelope<AdminUser>>(`/admin/users/${userId}/role`, {
    role,
  });
  return res.data.data;
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await apiClient.get<ApiEnvelope<AdminStats>>('/admin/stats');
  return res.data.data;
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const res = await apiClient.get<ApiEnvelope<SystemInfo>>('/admin/system');
  return res.data.data;
}

export async function runScheduledImports(): Promise<RunImportsResult> {
  const res = await apiClient.post<ApiEnvelope<RunImportsResult>>('/admin/run-imports');
  return res.data.data;
}
