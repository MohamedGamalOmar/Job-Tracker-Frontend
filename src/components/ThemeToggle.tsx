import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { cn } from '../lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={cn(
        'relative flex h-8 w-14 items-center rounded-full p-1 transition-colors duration-200',
        isDark ? 'bg-ink' : 'bg-sunken ring-1 ring-inset ring-line',
        className,
      )}
    >
      <span
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200',
          isDark ? 'translate-x-6 bg-surface text-ink shadow-sm' : 'translate-x-0 bg-surface text-ink shadow-sm',
        )}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
