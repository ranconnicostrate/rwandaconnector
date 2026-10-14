import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRightIcon, SearchIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Avatar } from '../../components/ui/Avatar';
import { ApplicantDetail } from '../../components/employer/ApplicantDetail';
import { ALL_STATUSES, STATUS_KEY, STATUS_TONE } from '../../utils/status';
import type { Application, ApplicationStatus } from '../../types';

export function EmployerApplicants() {
  const { t, formatDate, formatSalary, formatRelative } = useTranslation();
  const { applications, jobs, currentUser, personById, setApplicationStatus } = usePlatform();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [reviewing, setReviewing] = useState<Application | null>(null);

  const myJobs = useMemo(
    () =>
    jobs.
    filter((j) => j.ownerId === currentUser.id).
    sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt)),
    [jobs, currentUser.id]
  );
  const myJobIds = myJobs.map((j) => j.id);
  const mine = applications.filter((a) => myJobIds.includes(a.jobId));

  // 'ALL' keeps the cross-role view available; a jobId narrows to one role.
  const selectedJobId = params.get('job') ?? 'ALL';
  const selectJob = (id: string) => {
    const next = new URLSearchParams(params);
    if (id === 'ALL') next.delete('job');else
    next.set('job', id);
    setParams(next, { replace: true });
  };

  const countFor = (jobId: string) => mine.filter((a) => a.jobId === jobId).length;
  const newFor = (jobId: string) =>
  mine.filter((a) => a.jobId === jobId && a.status === 'SUBMITTED').length;

  const rows = mine.
  filter((a) => selectedJobId === 'ALL' || a.jobId === selectedJobId).
  filter((a) => status === 'ALL' || a.status === status).
  filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const person = personById(a.applicantId);
    return (
      a.fullName.toLowerCase().includes(q) ||
      a.skills.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) || (
      person?.headline.toLowerCase().includes(q) ?? false));

  }).
  sort((a, b) => +new Date(b.appliedAt) - +new Date(a.appliedAt));

  const selectedJob = myJobs.find((j) => j.id === selectedJobId);

  const jobButton = (id: string, title: string, subtitle: string) => {
    const active = selectedJobId === id;
    const count = id === 'ALL' ? mine.length : countFor(id);
    const fresh = id === 'ALL' ? mine.filter((a) => a.status === 'SUBMITTED').length : newFor(id);
    return (
      <li key={id}>
        <button
          type="button"
          onClick={() => selectJob(id)}
          aria-current={active}
          className={`flex w-full items-center gap-3 border-b border-surface-border px-4 py-3 text-left transition-colors duration-150 last:border-b-0 ${
          active ? 'bg-brand-50' : 'hover:bg-surface-muted'}`
          }>
          
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-sm font-semibold ${active ? 'text-brand-700' : 'text-ink-900'}`}>
              {title}
            </span>
            <span className="block truncate text-xs text-ink-400">{subtitle}</span>
          </span>
          {fresh > 0 &&
          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">
              {fresh}
            </span>
          }
          <span className="w-7 text-right text-sm font-bold tabular-nums text-ink-700">{count}</span>
          <ChevronRightIcon className={`h-4 w-4 shrink-0 ${active ? 'text-brand-600' : 'text-ink-300'}`} />
        </button>
      </li>);

  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-extrabold text-ink-900">{t('nav.applicants')}</h1>
        <p className="text-sm text-ink-500">{t('employer.applicantsIntro')}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <nav
          aria-label={t('employer.applicantsByJob')}
          className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
          
          <h2 className="border-b border-surface-border px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink-400">
            {t('employer.applicantsByJob')}
          </h2>
          <ul className="max-h-[560px] overflow-y-auto scrollbar-thin">
            {jobButton('ALL', t('employer.allJobs'), t('employer.everyRole'))}
            {myJobs.map((job) =>
            jobButton(
              job.id,
              job.title,
              `${job.location} · ${job.open ? t('admin.active') : t('employer.closeJob')}`
            )
            )}
            {myJobs.length === 0 &&
            <li className="px-4 py-8 text-center text-sm text-ink-400">{t('employer.noJobsYet')}</li>
            }
          </ul>
        </nav>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-white p-4 shadow-card sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold text-ink-900">
                {selectedJob ? selectedJob.title : t('employer.allJobs')}
              </h2>
              <p className="text-xs text-ink-500">
                {t('employer.applicantsCount', { count: rows.length })}
              </p>
            </div>
            <div className="relative sm:w-56">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('employer.searchCandidates')}
                aria-label={t('employer.searchCandidates')}
                className="w-full rounded-xl border border-surface-border py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none" />
              
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus | 'ALL')}
              aria-label={t('common.status')}
              className="rounded-xl border border-surface-border px-3 py-2.5 text-sm text-ink-700 focus:border-brand-400 focus:outline-none">
              
              <option value="ALL">{t('common.all')}</option>
              {ALL_STATUSES.map((s) =>
              <option key={s} value={s}>
                  {t(STATUS_KEY[s])}
                </option>
              )}
            </select>
          </div>

          <ul className="space-y-3">
            {rows.map((app) => {
              const person = personById(app.applicantId);
              const job = jobs.find((j) => j.id === app.jobId);
              return (
                <li
                  key={app.id}
                  className="rounded-2xl border border-surface-border bg-white p-4 shadow-card transition-colors duration-150 hover:border-brand-200">
                  
                  <div className="flex items-start gap-3">
                    <Avatar name={app.fullName} color={person?.avatar} photo={person?.photo} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-ink-900">{app.fullName}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_TONE[app.status]}`}>
                          {t(STATUS_KEY[app.status])}
                        </span>
                        {app.status === 'SUBMITTED' &&
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                            {t('common.new')}
                          </span>
                        }
                      </div>
                      <p className="truncate text-xs text-ink-500">{person?.headline}</p>
                      {selectedJobId === 'ALL' &&
                      <p className="mt-0.5 truncate text-xs text-ink-400">
                          {t('employer.appliedFor')}: {job?.title}
                        </p>
                      }
                      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                        <span>
                          <span className="font-semibold text-ink-700">{t('apply.expectedSalary')}:</span>{' '}
                          {formatSalary(app.expectedSalary)}
                        </span>
                        <span title={formatDate(app.appliedAt)}>{formatRelative(app.appliedAt)}</span>
                        <span className="font-mono text-ink-400">{app.id}</span>
                      </p>
                      {app.skills &&
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                          {app.skills.
                        split(',').
                        map((s) => s.trim()).
                        filter(Boolean).
                        slice(0, 5).
                        map((skill) =>
                        <li
                          key={skill}
                          className="rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-700">
                          
                                {skill}
                              </li>
                        )}
                        </ul>
                      }
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewing(app)}
                        className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
                        
                        {t('employer.review')}
                      </button>
                      <select
                        value={app.status}
                        onChange={(e) => setApplicationStatus(app.id, e.target.value as ApplicationStatus)}
                        aria-label={t('employer.changeStatus')}
                        className="rounded-lg border border-surface-border px-2 py-1.5 text-xs text-ink-700 focus:border-brand-400 focus:outline-none">
                        
                        {ALL_STATUSES.map((s) =>
                        <option key={s} value={s}>
                            {t(STATUS_KEY[s])}
                          </option>
                        )}
                      </select>
                    </div>
                  </div>
                </li>);

            })}
            {rows.length === 0 &&
            <li className="rounded-2xl border border-surface-border bg-white p-10 text-center shadow-card">
                <UsersIcon className="mx-auto h-8 w-8 text-ink-300" />
                <p className="mt-3 text-sm text-ink-500">
                  {mine.length === 0 ? t('employer.noApplicantsYet') : t('common.noResults')}
                </p>
              </li>
            }
          </ul>
        </div>
      </div>

      <ApplicantDetail application={reviewing} onClose={() => setReviewing(null)} />
    </div>);

}