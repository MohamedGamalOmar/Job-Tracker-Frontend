import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Sparkles, X } from 'lucide-react';
import {
  clearPreferences,
  getPreferences,
  savePreferences,
} from '../api/preferences.api';
import { getApiErrorMessage } from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import type { JobPreferences } from '../types';
import { Button, Card, ErrorState, Field, Input, Select, Skeleton } from '../components/ui';

const EMPTY_PREFS: JobPreferences = {
  desiredTitle: null,
  experienceLevel: null,
  skills: [],
  workplaceType: null,
  postedWithinDays: null,
  location: null,
};

export function PreferencesPage() {
  const { user } = useAuth();
  const prefsQuery = useQuery({
    queryKey: ['preferences', user?.id ?? 'anon'],
    queryFn: getPreferences,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Job preferences</h2>
          <p className="mt-1 text-sm text-ink-3">
            Tell us what you're looking for and we'll surface matching jobs on the Recommended tab.
          </p>
        </div>
        <Link
          to="/jobs?view=recommended"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-canvas shadow-sm transition-colors hover:bg-ink/85"
        >
          <Sparkles className="h-3.5 w-3.5" />
          View matches
        </Link>
      </div>

      {prefsQuery.isLoading ? (
        <Card className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
      ) : prefsQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(prefsQuery.error)}
          onRetry={() => prefsQuery.refetch()}
        />
      ) : (
        <PreferencesForm
          key={user?.id ?? 'anon'}
          initial={{
            ...EMPTY_PREFS,
            ...(prefsQuery.data ?? {}),
            skills: prefsQuery.data?.skills ?? [],
          }}
          hasSavedPrefs={prefsQuery.data !== null}
        />
      )}
    </div>
  );
}

function PreferencesForm({
  initial,
  hasSavedPrefs,
}: {
  initial: JobPreferences;
  hasSavedPrefs: boolean;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<JobPreferences>(initial);
  const [skillInput, setSkillInput] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const saveMutation = useMutation({
    mutationFn: savePreferences,
    onSuccess: () => {
      toast.success('Preferences saved');
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      queryClient.invalidateQueries({ queryKey: ['recommended'] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not save preferences')),
  });

  const clearMutation = useMutation({
    mutationFn: clearPreferences,
    onSuccess: () => {
      toast.success('Preferences cleared');
      setForm(EMPTY_PREFS);
      setConfirmClear(false);
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      queryClient.invalidateQueries({ queryKey: ['recommended'] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not clear preferences')),
  });

  function set<K extends keyof JobPreferences>(key: K, value: JobPreferences[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function addSkill() {
    const skill = skillInput.trim();
    if (!skill) return;
    if (!form.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      set('skills', [...form.skills, skill]);
    }
    setSkillInput('');
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // PUT replaces the whole object — omitted fields are cleared, and the
    // backend schema rejects explicit nulls, so only send set fields.
    const payload: Partial<JobPreferences> = {};
    const desiredTitle = form.desiredTitle?.trim();
    if (desiredTitle) payload.desiredTitle = desiredTitle;
    if (form.experienceLevel) payload.experienceLevel = form.experienceLevel;
    if (form.skills.length > 0) payload.skills = form.skills;
    if (form.workplaceType) payload.workplaceType = form.workplaceType;
    if (form.postedWithinDays) payload.postedWithinDays = form.postedWithinDays;
    const location = form.location?.trim();
    if (location) payload.location = location;
    saveMutation.mutate(payload);
  }

  const hasPrefs =
    !!form.desiredTitle ||
    !!form.experienceLevel ||
    form.skills.length > 0 ||
    !!form.workplaceType ||
    !!form.postedWithinDays ||
    !!form.location;

  return (
    <Card className="p-6">
      <form onSubmit={handleSave} className="space-y-5">
        <Field label="Job title or keywords" htmlFor="pref-title" hint="Every word of 3+ characters must appear in the job title.">
          <Input
            id="pref-title"
            value={form.desiredTitle ?? ''}
            onChange={(e) => set('desiredTitle', e.target.value)}
            placeholder="e.g. frontend developer"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Experience level" htmlFor="pref-exp">
            <Select
              id="pref-exp"
              value={form.experienceLevel ?? ''}
              onChange={(e) => set('experienceLevel', e.target.value || null)}
            >
              <option value="">Any level</option>
              <option value="entry">Entry</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="executive">Executive</option>
            </Select>
          </Field>

          <Field label="Workplace type" htmlFor="pref-workplace">
            <Select
              id="pref-workplace"
              value={form.workplaceType ?? ''}
              onChange={(e) =>
                set('workplaceType', (e.target.value || null) as JobPreferences['workplaceType'])
              }
            >
              <option value="">Any workplace</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </Select>
          </Field>

          <Field label="Posted within" htmlFor="pref-days">
            <Select
              id="pref-days"
              value={form.postedWithinDays?.toString() ?? ''}
              onChange={(e) => set('postedWithinDays', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Any time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </Select>
          </Field>

          <Field label="Location" htmlFor="pref-location">
            <Input
              id="pref-location"
              value={form.location ?? ''}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. Cairo, Remote"
            />
          </Field>
        </div>

        <Field
          label="Skills"
          htmlFor="pref-skill"
          hint="A job matches if it requires ANY of these skills."
        >
          <div className="space-y-2">
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-sunken px-2.5 py-1 text-xs font-medium text-ink-2 ring-1 ring-inset ring-line"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => set('skills', form.skills.filter((s) => s !== skill))}
                      className="text-ink-4 transition-colors hover:text-red-500"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                id="pref-skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Type a skill and press Enter"
              />
              <Button type="button" variant="secondary" onClick={addSkill} disabled={!skillInput.trim()}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </Field>

        <div className="flex items-center justify-between border-t border-line pt-5">
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-3">Clear all preferences?</span>
              <Button type="button" variant="secondary" onClick={() => setConfirmClear(false)}>
                Keep
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => clearMutation.mutate()}
                loading={clearMutation.isPending}
              >
                Clear
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmClear(true)}
              disabled={!hasPrefs && !hasSavedPrefs}
            >
              Clear preferences
            </Button>
          )}
          <Button type="submit" loading={saveMutation.isPending}>
            Save preferences
          </Button>
        </div>
      </form>
    </Card>
  );
}
