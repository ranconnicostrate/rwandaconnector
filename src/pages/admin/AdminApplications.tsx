import React from 'react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { StatTile } from '../../components/ui/StatTile';
import { ProgressList } from '../../components/charts/MiniBarChart';
import { ALL_STATUSES, STATUS_KEY, STATUS_TONE } from '../../utils/status';

export function AdminApplications() {
  const { t, formatDate } = useTranslation();
  const { applications, jobs, companyById } = usePlatform();

  const count = (status: string) => applications.filter((a) => a.status === status).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">{t('admin.totalApplications')}</h1>
        <p className="text-sm text-ink-500">{t('admin.platformActivity')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={t('admin.totalApplications')} value={applications.length} tone="primary" />
        <StatTile label={t('applications.shortlisted')} value={count('SHORTLISTED')} />
        <StatTile label={t('applications.interview')} value={count('INTERVIEW')} />
        <StatTile label={t('applications.hired')} value={count('HIRED')} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-5 py-3 font-semibold">{t('applications.applicationId')}</th>
                <th className="px-5 py-3 font-semibold">{t('jobs.jobTitle')}</th>
                <th className="px-5 py-3 font-semibold">{t('jobs.company')}</th>
                <th className="px-5 py-3 font-semibold">{t('applications.date')}</th>
                <th className="px-5 py-3 font-semibold">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const job = jobs.find((j) => j.id === app.jobId);
                return (
                  <tr key={app.id} className="border-b border-surface-border last:border-b-0">
                    <td className="px-5 py-3 font-mono text-xs text-ink-700">{app.id}</td>
                    <td className="px-5 py-3 text-ink-900">{job?.title}</td>
                    <td className="px-5 py-3 text-ink-500">{job ? companyById(job.companyId)?.name : ''}</td>
                    <td className="px-5 py-3 text-ink-500">{formatDate(app.appliedAt)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_TONE[app.status]}`}>
                        {t(STATUS_KEY[app.status])}
                      </span>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </section>

        <ProgressList
          title={t('employer.pipeline')}
          items={ALL_STATUSES.map((s, i) => ({
            label: t(STATUS_KEY[s]),
            value: count(s),
            color: ['#8a94a6', '#2f7fee', '#7c3aed', '#eeb821', '#1f9d55', '#ef4444'][i]
          }))} />
        
      </div>

      <p className="text-xs text-ink-400">{t('settings.privacy')}: {t('admin.moderation')}</p>
    </div>);

}