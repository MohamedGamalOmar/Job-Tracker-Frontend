import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  getMe,
  login as apiLogin,
  register as apiRegister,
  verifyEmail as apiVerifyEmail,
} from '../api/auth.api';
import type { Credentials, RegisterResult } from '../api/auth.api';
import { clearStoredToken, getStoredToken, setStoredToken } from '../api/axios';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (credentials: Credentials) => Promise<RegisterResult>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Shared in-flight session restore so StrictMode double-mounts (and any other
// concurrent callers) only produce a single GET /auth/me request.
let sessionPromise: Promise<User | null> | null = null;

function fetchSession(): Promise<User | null> {
  sessionPromise ??= getMe().catch(() => null);
  return sessionPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      const me = await fetchSession();
      if (cancelled) return;
      if (me) {
        setUser(me);
        setToken(stored);
      } else {
        clearStoredToken();
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const result = await apiLogin(credentials);
    setStoredToken(result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (credentials: Credentials) => {
    return apiRegister(credentials);
  }, []);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    const result = await apiVerifyEmail(email, otp);
    setStoredToken(result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await getMe();
    setUser(me);
    sessionPromise = Promise.resolve(me);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      verifyEmail,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, verifyEmail, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
