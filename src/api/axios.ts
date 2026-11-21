import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiEnvelope } from '../types';

const TOKEN_KEY = 'job_tracker_token';
const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable (private mode etc.) — session just won't persist
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

const baseURL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'}/api`;

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 180000,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? '';
      const isAuthEndpoint = requestUrl.includes('/auth/');
      clearStoredToken();

      const path = window.location.pathname;
      const onAuthPage = AUTH_PAGES.some((p) => path.startsWith(p));
      if (!isAuthEndpoint && !onAuthPage) {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403) {
      toast.error('Admin access required');
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
    const body = axiosError.response?.data;
    if (body?.message) {
      return body.message;
    }
    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      const first = body.errors[0];
      return first.path ? `${first.path}: ${first.message}` : (first.message ?? fallback);
    }
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timed out. The backend may still be processing the import.';
    }
    if (!axiosError.response) {
      return 'Cannot reach the backend. Check that it is running and CORS is configured.';
    }
    return `Request failed with status ${axiosError.response.status}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
