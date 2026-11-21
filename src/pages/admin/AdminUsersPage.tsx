import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listUsers, setUserRole } from '../../api/admin.api';
import { getApiErrorMessage } from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';
import { Badge, Button, Card, ErrorState, Skeleton } from '../../components/ui';
import { formatDate } from '../../lib/format';
import type { UserRole } from '../../types';

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, refreshUser } = useAuth();
  const [pendingDemote, setPendingDemote] = useState<number | null>(null);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => listUsers(100, 0),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: UserRole }) =>
      setUserRole(userId, role),
    onSuccess: async (_data, vars) => {
      toast.success(vars.role === 'admin' ? 'User promoted to admin' : 'Admin role removed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      // Role changes only take effect on the next token issuance — refresh /me.
      await refreshUser().catch(() => {});
      setPendingDemote(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
      setPendingDemote(null);
    },
  });

  const users = usersQuery.data ?? [];

  function handleRoleClick(userId: number, currentRole: UserRole) {
    const nextRole: UserRole = currentRole === 'admin' ? 'user' : 'admin';
    if (nextRole === 'user') {
      setPendingDemote(userId);
    } else {
      roleMutation.mutate({ userId, role: nextRole });
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">Users</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Manage user roles. Only admins can import jobs.
        </p>
      </div>

      {usersQuery.isLoading ? (
        <Card className="divide-y divide-neutral-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="ml-auto h-8 w-24" />
            </div>
          ))}
        </Card>
      ) : usersQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(usersQuery.error)}
          onRetry={() => usersQuery.refetch()}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const demoting = pendingDemote === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-neutral-50/60">
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {u.email}
                        {isSelf && <span className="ml-2 text-xs text-neutral-400">(you)</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={u.role === 'admin' ? 'purple' : 'neutral'}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-neutral-400">—</span>
                        ) : demoting ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-xs text-neutral-600">Remove admin?</span>
                            <Button
                              variant="danger"
                              className="px-2.5 py-1 text-xs"
                              loading={roleMutation.isPending}
                              onClick={() => roleMutation.mutate({ userId: u.id, role: 'user' })}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="ghost"
                              className="px-2.5 py-1 text-xs"
                              onClick={() => setPendingDemote(null)}
                            >
                              Cancel
                            </Button>
                          </span>
                        ) : (
                          <Button
                            variant="secondary"
                            className="px-2.5 py-1 text-xs"
                            disabled={roleMutation.isPending}
                            onClick={() => handleRoleClick(u.id, u.role)}
                          >
                            {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
