import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { Avatar } from '../components/ui/Avatar';
import { STATUS_KEY, STATUS_TONE } from '../utils/status';

export function Applications() {
  const { t, formatDate, formatSalary } = useTranslation();
  const { applications, currentUser, jobById, companyById, withdrawApplication } = usePlatform();
  const mine = applications.filter((a) => a.applicantId === currentUser.id);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-xl font-extrabold text-ink-900">{t('applications.title')}</h1>

      {mine.length === 0 ?
      <p className="rounded-2xl border border-surface-border bg-white p-10 text-center text-sm text-ink-400 shadow-card">
          {t('applications.empty')}
        </p> :

      <ul className="space-y-3">
          {mine.map((app) => {
          const job = jobById(app.jobId);
          const company = job ? companyById(job.companyId) : undefined;
          return (
            <li
              key={app.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-surface-border bg-white p-4 shadow-card">
              
                <Avatar name={company?.name ?? ''} initials={company?.logo} color={company?.logoColor} size="md" square />
                <div className="min-w-0 flex-1">
                  <Link to={`/jobs/${app.jobId}`} className="text-sm font-bold text-ink-900 hover:text-brand-700">
                    {job?.title}
                  </Link>
                  <p className="text-xs text-ink-500">
                    {company?.name} · {job?.location}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-ink-400">{app.id}</p>
                </div>
                <div className="text-xs text-ink-500">
                  <p className="font-semibold text-ink-700">{t('applications.date')}</p>
                  <p>{formatDate(app.appliedAt)}</p>
                </div>
                <div className="text-xs text-ink-500">
                  <p className="font-semibold text-ink-700">{t('apply.expectedSalary')}</p>
                  <p>{formatSalary(app.expectedSalary)}</p>
                </div>
                <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_TONE[app.status]}`}>
                
                  {t(STATUS_KEY[app.status])}
                </span>
                <button
                type="button"
                onClick={() => withdrawApplication(app.id)}
                className="rounded-lg border border-surface-border px-3 py-2 text-xs font-semibold text-ink-500 transition-colors duration-150 hover:border-red-200 hover:text-red-600">
                
                  {t('applications.withdraw')}
                </button>
              </li>);

        })}
        </ul>
      }
    </div>);

}