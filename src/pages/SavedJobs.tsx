import React from 'react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { JobCard } from '../components/jobs/JobCard';

export function SavedJobs() {
  const { t } = useTranslation();
  const { savedJobs, jobById } = usePlatform();
  const jobs = savedJobs.map(jobById).filter((j): j is NonNullable<typeof j> => Boolean(j));

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-extrabold text-ink-900">{t('nav.savedJobs')}</h1>
        <p className="text-sm text-ink-500">{t('jobs.results', { count: jobs.length })}</p>
      </header>

      {jobs.length === 0 ?
      <p className="rounded-2xl border border-surface-border bg-white p-10 text-center text-sm text-ink-400 shadow-card">
          {t('common.noResults')}
        </p> :

      jobs.map((job) => <JobCard key={job.id} job={job} />)
      }
    </div>);

}