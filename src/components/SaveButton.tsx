import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { useToggleSave } from '../hooks/useToggleSave';
import { cn } from '../lib/utils';

export function SaveButton({ jobId, saved, className }: { jobId: number; saved: boolean; className?: string }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toggle = useToggleSave();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Log in to save jobs');
      navigate('/login');
      return;
    }
    toggle.mutate({ jobId, saved });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
      title={saved ? 'Saved — click to remove' : 'Save job'}
      className={cn(
        'rounded-lg p-1.5 transition-colors disabled:opacity-50',
        saved
          ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
          : 'text-ink-4 hover:bg-sunken hover:text-ink-2',
        className,
      )}
    >
      <Bookmark
        key={String(saved)}
        className={cn('h-4 w-4 animate-pop', saved && 'fill-amber-400')}
      />
    </button>
  );
}
