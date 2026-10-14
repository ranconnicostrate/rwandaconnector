import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { ALL_STATUSES, STATUS_KEY } from '../../utils/status';
import type { Job } from '../../types';

const BAR_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-ink-300',
  UNDER_REVIEW: 'bg-blue-500',
  SHORTLISTED: 'bg-violet-500',
  INTERVIEW: 'bg-amber-500',
  HIRED: 'bg-leaf-500',
  REJECTED: 'bg-red-400'
};

/**
 * Per-job applicant volume with an inline pipeline bar, so an employer can see
 * which role needs attention before drilling into it.
 */
export function ApplicantsByJob() {
  const { t, formatRelative } = useTranslation();
  const { jobs, applications, currentUser } = usePlatform();

  const myJobs = jobs.
  filter((j) => j.ownerId === currentUser.id).
  sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));

  const rowsFor = (job: Job) => applications.filter((a) => a.jobId === job.id);

  const ranked = myJobs.
  map((job) => ({ job, apps: rowsFor(job) })).
  sort((a, b) => b.apps.length - a.apps.length).
  slice(0, 6);

  return (
    <section className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
      <header className="flex items-center justify-between gap-3 border-b border-surface-border px-5 py-4">
        <h2 className="text-sm font-bold text-ink-900">{t('employer.applicantsByJob')}</h2>
        <Link
          to="/employer/applicants"
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-700">
          
          {t('common.seeAll')} <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </header>

      <ul>
        {ranked.map(({ job, apps }) => {
          const fresh = apps.filter((a) => a.status === 'SUBMITTED').length;
          const latest = apps.
          slice().
          sort((a, b) => +new Date(b.appliedAt) - +new Date(a.appliedAt))[0];
          return (
            <li key={job.id} className="border-b border-surface-border last:border-b-0">
              <Link
                to={`/employer/applicants?job=${job.id}`}
                className="block px-5 py-4 transition-colors duration-150 hover:bg-surface-muted">
                
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-bold text-ink-900">
                      {job.title}
                      {!job.open &&
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-bold uppercase text-ink-500">
                          {t('employer.closeJob')}
                        </span>
                      }
                    </p>
                    <p className="truncate text-xs text-ink-400">
                      {job.location}
                      {latest ? ` · ${t('employer.lastApplied')} ${formatRelative(latest.appliedAt)}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold leading-none tabular-nums text-ink-900">{apps.length}</p>
                    <p className="text-[11px] text-ink-400">{t('nav.applicants')}</p>
                  </div>
                  {fresh > 0 &&
                  <span className="mt-1 shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">
                      {t('employer.newCount', { count: fresh })}
                    </span>
                  }
                </div>

                {apps.length > 0 &&
                <>
                    <div
                    className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-surface-muted"
                    role="img"
                    aria-label={t('employer.pipeline')}>
                    
                      {ALL_STATUSES.map((s) => {
                      const n = apps.filter((a) => a.status === s).length;
                      if (n === 0) return null;
                      return (
                        <span
                          key={s}
                          className={BAR_COLOR[s]}
                          style={{ width: `${n / apps.length * 100}%` }} />);


                    })}
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {ALL_STATUSES.map((s) => {
                      const n = apps.filter((a) => a.status === s).length;
                      if (n === 0) return null;
                      return (
                        <li key={s} className="flex items-center gap-1.5 text-[11px] text-ink-500">
                            <span className={`h-2 w-2 rounded-full ${BAR_COLOR[s]}`} />
                            {t(STATUS_KEY[s])} {n}
                          </li>);

                    })}
                    </ul>
                  </>
                }
              </Link>
            </li>);

        })}

        {myJobs.length === 0 &&
        <li className="px-5 py-10 text-center">
            <p className="text-sm text-ink-500">{t('employer.noJobsYet')}</p>
            <Link
            to="/employer/jobs"
            className="mt-3 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
            
              {t('employer.createJob')}
            </Link>
          </li>
        }
      </ul>
    </section>);

}