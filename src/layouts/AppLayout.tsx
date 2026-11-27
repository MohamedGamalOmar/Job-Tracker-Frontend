import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Briefcase,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Upload,
  Users,
  X,
  Info,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/jobs', label: 'All Jobs', icon: Briefcase },
  { to: '/saved', label: 'Saved', icon: Bookmark },
  ...(import.meta.env.DEV
    ? [{ to: '/settings', label: 'Settings', icon: Settings }]
    : []),
  { to: '/about', label: 'About', icon: Info },
];

const adminNavItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/imports', label: 'Imports', icon: Upload },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b border-line px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
          <Briefcase className="h-4 w-4 text-canvas" />
        </div>
        <span className="text-sm font-semibold text-ink">Job Tracker</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-ink text-canvas shadow-sm'
                  : 'text-ink-2 hover:bg-sunken hover:text-ink',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="flex items-center gap-2 px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </div>
            {adminNavItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-ink-2 hover:bg-sunken hover:text-ink',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="border-t border-line p-4 text-xs text-ink-4">
        Personal job tracker MVP
      </div>
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="animate-menu w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm text-ink-3">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'rounded-lg px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 active:scale-[0.98]',
              danger ? 'bg-red-600 hover:bg-red-500' : 'bg-ink hover:bg-ink/85',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function UserMenu() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function handleLogout() {
    setOpen(false);
    setConfirmLogout(true);
  }

  function confirmAndLogout() {
    setConfirmLogout(false);
    logout();
    navigate('/login', { replace: true });
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2" aria-hidden="true">
        <div className="h-8 w-8 animate-pulse rounded-full bg-sunken" />
        <div className="hidden h-4 w-32 animate-pulse rounded-md bg-sunken sm:block" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const initial = user.email.charAt(0).toUpperCase();
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            'flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors duration-150',
            open ? 'bg-sunken' : 'hover:bg-sunken',
          )}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-canvas">
            {initial}
          </span>
          <span className="hidden max-w-[160px] truncate text-sm font-medium text-ink sm:block">
            {user.email}
          </span>
          <ChevronDown
            className={cn('h-4 w-4 text-ink-4 transition-transform duration-200', open && 'rotate-180')}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="animate-menu absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-canvas">
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{user.email}</p>
                {user.role === 'admin' && (
                  <span className="mt-0.5 inline-block rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                    admin
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-ink-2">
                <Sun className={cn('h-4 w-4', theme === 'dark' && 'text-ink-4')} />
                <span className={cn(theme === 'dark' && 'text-ink-4')}>Light</span>
              </span>
              <ThemeToggle />
              <span className="flex items-center gap-2 text-sm text-ink-2">
                <span className={cn(theme === 'light' && 'text-ink-4')}>Dark</span>
                <Moon className={cn('h-4 w-4', theme === 'light' && 'text-ink-4')} />
              </span>
            </div>

            <div className="border-t border-line p-1.5">
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-2 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={confirmLogout}
          title="Log out?"
          message="You will need to sign in again to access saved jobs, imports, and admin tools."
          confirmLabel="Log out"
          danger
          onConfirm={confirmAndLogout}
          onCancel={() => setConfirmLogout(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <NavLink
        to="/login"
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink"
      >
        Log in
      </NavLink>
      <NavLink
        to="/register"
        className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-canvas transition-colors duration-150 hover:bg-ink/85"
      >
        Register
      </NavLink>
    </div>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-line bg-panel lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-panel shadow-xl">
            <button
              className="absolute right-3 top-4 rounded-lg p-1.5 text-ink-4 hover:bg-sunken"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-panel/80 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-ink-2 hover:bg-sunken lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-ink">Job Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
