import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { TYPE_KEY } from '../../components/jobs/JobCard';

export function AdminJobs() {
  const { t, formatSalary, formatDate } = useTranslation();
  const { jobs, companyById, setJobApproval, toggleJobOpen } = usePlatform();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-ink-900">{t('nav.jobs')}</h1>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-5 py-3 font-semibold">{t('jobs.jobTitle')}</th>
              <th className="px-5 py-3 font-semibold">{t('jobs.company')}</th>
              <th className="px-5 py-3 font-semibold">{t('jobs.employmentType')}</th>
              <th className="px-5 py-3 font-semibold">{t('jobs.salary')}</th>
              <th className="px-5 py-3 font-semibold">{t('jobs.deadline')}</th>
              <th className="px-5 py-3 font-semibold">{t('common.status')}</th>
              <th className="px-5 py-3 font-semibold">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) =>
            <tr key={job.id} className="border-b border-surface-border last:border-b-0">
                <td className="px-5 py-3">
                  <Link to={`/jobs/${job.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                    {job.title}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink-700">{companyById(job.companyId)?.name}</td>
                <td className="px-5 py-3 text-ink-700">{t(TYPE_KEY[job.type])}</td>
                <td className="px-5 py-3 text-ink-700">{formatSalary(job.salaryMin, job.salaryMax)}</td>
                <td className="px-5 py-3 text-ink-500">{formatDate(job.deadline)}</td>
                <td className="px-5 py-3">
                  <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  job.approval === 'APPROVED' ?
                  'bg-leaf-50 text-leaf-600' :
                  job.approval === 'PENDING' ?
                  'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-600'}`
                  }>
                  
                    {job.approval === 'APPROVED' ?
                  t('admin.active') :
                  job.approval === 'PENDING' ?
                  t('admin.pendingApproval') :
                  t('common.reject')}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                    type="button"
                    onClick={() => setJobApproval(job.id, 'APPROVED')}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
                    
                      {t('admin.approve')}
                    </button>
                    <button
                    type="button"
                    onClick={() => setJobApproval(job.id, 'REJECTED')}
                    className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-ink-500 transition-colors duration-150 hover:border-red-200 hover:text-red-600">
                    
                      {t('common.reject')}
                    </button>
                    <button
                    type="button"
                    onClick={() => toggleJobOpen(job.id)}
                    className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
                    
                      {job.open ? t('admin.suspend') : t('admin.restore')}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}