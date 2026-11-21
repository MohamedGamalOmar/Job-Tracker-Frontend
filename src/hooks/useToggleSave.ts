import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { saveJob, unsaveJob } from '../api/savedJobs.api';
import { getApiErrorMessage } from '../api/axios';
import type { Job } from '../types';

type JobsCache = { jobs?: Job[]; meta?: unknown } | Job[] | undefined;

function patchSavedFlag(data: JobsCache, jobId: number, saved: boolean): JobsCache {
  if (Array.isArray(data)) {
    return data.map((job) => (job.id === jobId ? { ...job, saved } : job));
  }
  if (data && Array.isArray(data.jobs)) {
    return {
      ...data,
      jobs: data.jobs.map((job) => (job.id === jobId ? { ...job, saved } : job)),
    };
  }
  return data;
}

function patchAllJobCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  jobId: number,
  saved: boolean,
) {
  for (const key of [['jobs'], ['dashboard'], ['saved-jobs']]) {
    queryClient.setQueriesData<JobsCache>({ queryKey: key }, (data) => {
      if (key[0] === 'saved-jobs') {
        // Saved list: flip flag, or drop the row when unsaving.
        if (Array.isArray(data)) {
          return saved
            ? data
            : data.filter((job) => job.id !== jobId);
        }
        return data;
      }
      return patchSavedFlag(data, jobId, saved);
    });
  }
  queryClient.setQueryData<Job | undefined>(['job', jobId], (job) =>
    job ? { ...job, saved } : job,
  );
}

export function useToggleSave() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { jobId: number; saved: boolean }, { previousSaved: boolean }>({
    mutationFn: async ({ jobId, saved }) => {
      if (saved) {
        await unsaveJob(jobId);
      } else {
        await saveJob(jobId);
      }
    },
    onMutate: async ({ jobId, saved }) => {
      const nextSaved = !saved;
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      await queryClient.cancelQueries({ queryKey: ['job'] });
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });
      await queryClient.cancelQueries({ queryKey: ['saved-jobs'] });

      patchAllJobCaches(queryClient, jobId, nextSaved);
      return { previousSaved: saved };
    },
    onError: (error, vars, context) => {
      toast.error(getApiErrorMessage(error, 'Could not update saved job'));
      if (context) {
        patchAllJobCaches(queryClient, vars.jobId, context.previousSaved);
      }
    },
    onSettled: (_data, _error, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });
}
