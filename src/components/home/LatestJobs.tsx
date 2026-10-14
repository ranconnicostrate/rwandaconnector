import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BriefcaseIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { JobCard } from '../jobs/JobCard';
import { visibleJobs } from '../../utils/jobs';

const PAGE = 4;

/**
 * Every job currently published by employers, newest first, shown directly on
 * the job seeker's dashboard so a new posting is visible without searching.
 */
export function LatestJobs() {
  const { t, formatNumber } = useTranslation();
  const { jobs, companyById, currentUser } = usePlatform();
  const [shown, setShown] = useState(PAGE);

  const open = visibleJobs(jobs, companyById);
  const matched = open.filter((j) => j.skills.some((s) => currentUser.skills.includes(s)));
  // Skill matches lead, then everything else in posting order.
  const ordered = Array.from(new Set([...matched, ...open]));
  const page = ordered.slice(0, shown);

  return (
    <section aria-labelledby="latest-jobs-heading" className="space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="latest-jobs-heading"
            className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
            
            <BriefcaseIcon className="h-5 w-5 text-brand-600" />
            {t('jobs.openRoles')}
          </h2>
          <p className="text-sm text-ink-500">
            {t('jobs.results', { count: formatNumber(ordered.length) })}
          </p>
        </div>
        <Link
          to="/jobs"
          className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
          
          {t('jobs.searchJobs')} <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </header>

      {page.length === 0 ?
      <p className="rounded-2xl border border-surface-border bg-white p-8 text-center text-sm text-ink-400 shadow-card">
          {t('jobs.noneOpen')}
        </p> :

      <>
          <ul className="space-y-3">
            {page.map((job) =>
          <li key={job.id}>
                <JobCard job={job} />
              </li>
          )}
          </ul>
          {shown < ordered.length &&
        <button
          type="button"
          onClick={() => setShown((v) => v + PAGE)}
          className="w-full rounded-xl border border-surface-border bg-white py-3 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
          
              {t('common.loadMore')}
            </button>
        }
        </>
      }
    </section>);

}