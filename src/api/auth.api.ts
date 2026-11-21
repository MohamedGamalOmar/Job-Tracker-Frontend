import { apiClient } from './axios';
import type { ApiEnvelope, AuthResponse, User } from '../types';

export interface Credentials {
  email: string;
  password: string;
}

export interface ForgotPasswordResult {
  message?: string;
  resetUrl?: string;
}

export async function login(credentials: Credentials): Promise<AuthResponse> {
  const res = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/login', credentials);
  return res.data.data;
}

export async function register(credentials: Credentials): Promise<AuthResponse> {
  const res = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/register', credentials);
  return res.data.data;
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  const res = await apiClient.post<ApiEnvelope<ForgotPasswordResult>>('/auth/forgot-password', {
    email,
  });
  return res.data.data ?? {};
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiClient.post<ApiEnvelope<{ message: string }>>('/auth/reset-password', {
    token,
    password,
  });
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<ApiEnvelope<User>>('/auth/me');
  return res.data.data;
}
